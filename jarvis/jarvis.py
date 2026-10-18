#!/usr/bin/env python3
"""J.A.R.V.I.S. başlatıcı.

Kullanım:
    python jarvis.py                      # sohbet modu
    python jarvis.py --mod tam            # tam yetki (onay sormaz)
    python jarvis.py --ses                # sesli mod
    python jarvis.py "Masaüstümü düzenle"  # tek seferlik görev
"""

import argparse
import sys

import anthropic
from rich.console import Console

from jarvis_core.agent import Jarvis, banner, dump_memory
from jarvis_core.config import Config

MODES = ("guvenli", "akilli", "tam")
HELP = """[bold]Komutlar[/]
  /mod guvenli   Her riskli işlemde onay ister
  /mod akilli    Sadece silme/sonlandırma/tehlikeli komutlarda onay ister (varsayılan)
  /mod tam       Tam yetki: onay sormaz (yalnızca disk biçimlendirme gibi felaket komutları sorulur)
  /hafiza        Kalıcı hafızayı gösterir
  /yeni          Yeni sohbet başlatır
  /cikis         Çıkış
[bold]Örnekler[/]
  İndirilenler klasörümü türlerine göre alt klasörlere ayır
  Bilgisayarım neden yavaş, en çok RAM yiyen programlar hangileri?
  Masaüstüne bugünkü dolar kuru ve hava durumuyla bir not dosyası yaz
  Ekranıma bak ve gördüğün hatayı çöz"""


def main() -> int:
    parser = argparse.ArgumentParser(description="J.A.R.V.I.S. kişisel yapay zeka asistanı")
    parser.add_argument("gorev", nargs="*", help="Tek seferlik görev (boş bırakılırsa sohbet modu)")
    parser.add_argument("--mod", choices=MODES, help="İzin modu")
    parser.add_argument("--ses", action="store_true", help="Sesli mod (mikrofon + konuşma)")
    parser.add_argument("--model", help="Claude model kimliği")
    parser.add_argument("--efor", choices=["low", "medium", "high", "xhigh", "max"], help="Düşünme derinliği")
    args = parser.parse_args()

    config = Config()
    if args.mod:
        config.permission_mode = args.mod
    if args.model:
        config.model = args.model
    if args.efor:
        config.effort = args.efor
    config.voice = args.ses

    console = Console()
    voice = None
    if config.voice:
        try:
            from jarvis_core.voice import Voice
            voice = Voice()
        except Exception as e:  # mikrofon/paket yoksa yazılı moda düş
            console.print(f"[yellow]Sesli mod başlatılamadı ({e}). Yazılı moda geçiliyor.[/]\n"
                          "[dim]Kurulum: pip install SpeechRecognition pyaudio pyttsx3[/]")
            config.voice = False

    jarvis = Jarvis(config, console)

    def run(text: str) -> None:
        try:
            answer = jarvis.ask(text)
        except anthropic.AuthenticationError:
            console.print("[red]API anahtarı geçersiz veya yok.[/] jarvis/.env dosyasına ANTHROPIC_API_KEY ekleyin.")
            return
        except anthropic.RateLimitError:
            console.print("[yellow]Hız sınırına ulaşıldı, biraz bekleyip tekrar deneyin.[/]")
            return
        except anthropic.APIStatusError as e:
            console.print(f"[red]API hatası ({e.status_code}):[/] {e.message}")
            return
        except anthropic.APIConnectionError:
            console.print("[red]İnternet bağlantısı kurulamadı.[/]")
            return
        if voice and answer:
            voice.speak(answer)

    if args.gorev:
        run(" ".join(args.gorev))
        return 0

    banner(console, config)
    if voice:
        console.print("[dim]Konuşmak için Enter'a basın, yazmak için doğrudan yazın.[/]")

    while True:
        try:
            text = console.input("\n[bold green]Siz ›[/] ").strip()
        except (EOFError, KeyboardInterrupt):
            console.print("\n[cyan]İyi günler, efendim.[/]")
            return 0

        if not text and voice:
            console.print("[magenta]🎙 Dinliyorum…[/]")
            text = voice.listen() or ""
            if not text:
                console.print("[dim]Anlaşılamadı.[/]")
                continue
            console.print(f"[green]Siz (ses) ›[/] {text}")
        if not text:
            continue

        cmd, _, rest = text.partition(" ")
        if cmd in ("/cikis", "/exit", "/quit"):
            console.print("[cyan]İyi günler, efendim.[/]")
            return 0
        if cmd in ("/yardim", "/help"):
            console.print(HELP)
            continue
        if cmd == "/hafiza":
            console.print(dump_memory(jarvis.memory))
            continue
        if cmd == "/yeni":
            jarvis.reset()
            console.print("[dim]Yeni sohbet başlatıldı.[/]")
            continue
        if cmd == "/mod":
            if rest.strip() in MODES:
                jarvis.set_mode(rest.strip())
                console.print(f"[yellow]İzin modu: {rest.strip()}[/]")
            else:
                console.print(f"[dim]Mevcut mod: {config.permission_mode}. Seçenekler: {', '.join(MODES)}[/]")
            continue

        run(text)


if __name__ == "__main__":
    sys.exit(main())
