"""Jarvis ajan döngüsü: Claude ile konuşur, araçları çalıştırır, sonuçları geri besler."""

import getpass
import json
import platform
from datetime import datetime
from pathlib import Path

import anthropic
from rich.console import Console
from rich.panel import Panel

from .config import Config
from .memory import Memory
from .permissions import Gatekeeper
from .tools import SERVER_TOOLS, TOOL_DEFS, ToolBox, describe, validate

BETAS = ["server-side-fallback-2026-07-01", "compact-2026-01-12"]

PERSONA = """Sen JARVIS'sin — kullanıcının kişisel bilgisayarında çalışan, ona ait, tam donanımlı bir yapay zeka asistanısın. Iron Man'deki J.A.R.V.I.S. gibi: sakin, son derece yetkin, ince ve zekice bir mizah anlayışı olan, sadık bir yardımcı. Kullanıcıya "{user_name}" diye hitap edersin.

## Yeteneklerin
Bu bilgisayarda gerçek araçların var ve onları kullanırsın — sadece tavsiye vermezsin, işi yaparsın:
- Terminal komutları ve Python kodu çalıştırmak (program kurma, git, derleme, otomasyon, sistem ayarları)
- Tüm klasör ve dosyalara erişmek: okuma, yazma, düzenleme, arama, kopyalama, taşıma, silme
- Uygulama, dosya ve web sitesi açmak; işlemleri listelemek/sonlandırmak; panoyu kullanmak
- Ekran görüntüsü alıp ekranı görmek
- İnternette arama yapmak ve web sayfalarını okumak (güncel bilgi, haber, fiyat, dokümantasyon)
- Kalıcı hafıza: kullanıcının tercihlerini, projelerini, önemli bilgilerini hatırlamak

## Çalışma tarzın
- Bir istek geldiğinde önce ne yapılması gerektiğini anla, sonra araçlarla bizzat yap. Çok adımlı işleri sonuna kadar götür; ara sonuçları kontrol et ve iş bittiğinde gerçekten çalıştığını doğrula.
- Bilmediğin şeyi tahmin etme: dosya yolu, program sürümü, güncel bilgi gerekiyorsa bak veya ara.
- Sadece gerçekten belirsiz ve tahmin edilemez bir tercih varsa soru sor; makul bir varsayım yapabiliyorsan yap ve belirt.
- Kullanıcı bir işleme izin vermezse aynı işlemi tekrar deneme; alternatif öner.
- Sonuçları dürüstçe bildir: bir şey başarısız olduysa nedenini ve ne denediğini söyle. Yapmadığın bir şeyi yapmış gibi gösterme.
- Kullanıcı hakkında kalıcı olarak işe yarayacak bir şey öğrendiğinde (isim, tercih, sık kullanılan klasör, proje) remember aracıyla kaydet.

## Konuşma tarzın
- Kullanıcı hangi dilde yazarsa o dilde cevap ver (varsayılan Türkçe).
- Kısa, net ve zekice ol. Gereksiz giriş cümleleri ve uzun açıklamalar yapma; önemli olanı söyle.
- Yeri geldiğinde zarif, kuru bir espri yap ama işi asla espriye feda etme.
- Sesli moddaysan cevaplarını sesli okunmaya uygun, kısa cümlelerle ver; tablo ve kod bloğu kullanma."""

ENVIRONMENT = """## Ortam
- Tarih: {date}
- İşletim sistemi: {os}
- Kullanıcı hesabı: {account}
- Ana klasör: {home}
- Çalışma klasörü: {cwd}
- İzin modu: {mode}
- Sesli mod: {voice}

## Hafızandaki bilgiler
{memory}"""


class Jarvis:
    def __init__(self, config: Config, console: Console | None = None):
        config.ensure_dirs()
        self.config = config
        self.console = console or Console()
        self.client = anthropic.Anthropic()
        self.memory = Memory(config.memory_file)
        self.toolbox = ToolBox(self.memory, config.data_dir)
        self.gate = Gatekeeper(config.permission_mode, config.log_file, self.console)
        self.messages: list[dict] = []
        self.system = self._build_system()

    def _build_system(self) -> list[dict]:
        env = ENVIRONMENT.format(
            date=datetime.now().strftime("%d %B %Y, %A"),
            os=f"{platform.system()} {platform.release()}",
            account=getpass.getuser(),
            home=Path.home(),
            cwd=Path.cwd(),
            mode=self.config.permission_mode,
            voice="açık" if self.config.voice else "kapalı",
            memory=self.memory.summary(),
        )
        return [
            {"type": "text", "text": PERSONA.format(user_name=self.config.user_name)},
            {"type": "text", "text": env},
        ]

    def reset(self) -> None:
        self.messages = []
        self.system = self._build_system()

    def set_mode(self, mode: str) -> None:
        self.config.permission_mode = mode
        self.gate.mode = mode

    # --- Tek bir kullanıcı mesajını sonuna kadar işler ----------------------

    def ask(self, user_text: str) -> str:
        self.messages.append({"role": "user", "content": user_text})
        final_text = ""
        json_retries = 0

        while True:
            try:
                response = self._stream_turn()
                json_retries = 0
            except ValueError:
                # Araç girdisi hiç ayrıştırılamadı; turu yeniden iste (sınırlı).
                json_retries += 1
                if json_retries > 2:
                    raise
                continue
            except KeyboardInterrupt:
                self.console.print("\n[dim]⏹ Durduruldu.[/]")
                return final_text

            self.messages.append({"role": "assistant", "content": response.content})
            final_text = "".join(b.text for b in response.content if b.type == "text") or final_text

            if response.stop_reason == "pause_turn":
                continue
            if response.stop_reason == "refusal":
                self.console.print("\n[red]Bu isteği yerine getiremiyorum.[/]")
                return final_text

            tool_uses = [b for b in response.content if b.type == "tool_use"]
            if not tool_uses:
                return final_text

            truncated = response.stop_reason == "max_tokens"
            results = []
            for i, block in enumerate(tool_uses):
                if truncated:
                    results.append(self._error(block.id, "Girdi max_tokens nedeniyle kesildi; daha küçük parçalarla tekrar dene."))
                    continue
                try:
                    results.append(self._execute(block))
                except KeyboardInterrupt:
                    self.console.print("\n[dim]⏹ İşlem iptal edildi.[/]")
                    for rest in tool_uses[i:]:
                        results.append(self._error(rest.id, "Kullanıcı işlemi iptal etti."))
                    self.messages.append({"role": "user", "content": results})
                    return final_text
            self.messages.append({"role": "user", "content": results})

    def _stream_turn(self):
        cfg = self.config
        printed_text = False
        with self.client.beta.messages.stream(
            model=cfg.model,
            max_tokens=64000,
            betas=BETAS,
            fallbacks="default",
            context_management={"edits": [{"type": "compact_20260112"}]},
            thinking={"type": "adaptive", "display": "summarized"},
            output_config={"effort": cfg.effort},
            cache_control={"type": "ephemeral"},
            system=self.system,
            tools=[*TOOL_DEFS, *SERVER_TOOLS],
            messages=self.messages,
        ) as stream:
            for event in stream:
                if event.type == "thinking":
                    self.console.print(event.thinking, style="dim italic", end="", markup=False, highlight=False)
                elif event.type == "text":
                    if not printed_text:
                        self.console.print("\n[bold cyan]JARVIS ›[/] ", end="")
                        printed_text = True
                    self.console.print(event.text, end="", markup=False, highlight=False)
                elif event.type == "content_block_start":
                    block = event.content_block
                    if block.type == "server_tool_use":
                        icon = "🔎 Web'de arıyor" if block.name == "web_search" else "🌐 Sayfa okuyor"
                        self.console.print(f"\n[magenta]{icon}…[/]", end="")
                    elif block.type == "thinking":
                        self.console.print("\n[dim]💭 [/]", end="")
            response = stream.get_final_message()
        self.console.print()
        return response

    def _execute(self, block) -> dict:
        args = block.input
        problem = validate(block.name, args)
        if problem:
            return self._error(block.id, problem)

        summary = describe(block.name, args)
        if not self.gate.allow(block.name, args, summary):
            return self._error(block.id, "Kullanıcı bu işleme izin vermedi.")

        self.console.print(f"[green]⚙ {block.name}[/] [dim]{summary[:160]}[/]", markup=True, highlight=False)
        try:
            output = self.toolbox.run(block.name, args)
        except Exception as e:  # araç hataları modele geri bildirilir
            self.gate.log(block.name, summary, f"error: {e}")
            return self._error(block.id, f"{type(e).__name__}: {e}")
        return {"type": "tool_result", "tool_use_id": block.id, "content": output}

    @staticmethod
    def _error(tool_use_id: str, message: str) -> dict:
        return {"type": "tool_result", "tool_use_id": tool_use_id, "content": message, "is_error": True}


def banner(console: Console, config: Config) -> None:
    modes = {"guvenli": "🛡 Güvenli", "akilli": "🧠 Akıllı", "tam": "⚡ TAM YETKİ"}
    console.print(Panel.fit(
        "[bold cyan]J.A.R.V.I.S.[/]  [dim]Just A Rather Very Intelligent System[/]\n"
        f"Model: [green]{config.model}[/]   Mod: [yellow]{modes.get(config.permission_mode, config.permission_mode)}[/]"
        f"   Ses: {'🎙 açık' if config.voice else 'kapalı'}\n"
        "[dim]Komutlar: /mod <guvenli|akilli|tam>  /hafiza  /yeni  /yardim  /cikis[/]",
        border_style="cyan",
    ))


def dump_memory(memory: Memory) -> str:
    return json.dumps(memory.data, ensure_ascii=False, indent=2) if memory.data else "(hafıza boş)"
