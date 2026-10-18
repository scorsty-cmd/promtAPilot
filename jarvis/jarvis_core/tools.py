"""Jarvis'in bilgisayar üzerindeki araçları: dosyalar, komutlar, uygulamalar, sistem."""

import fnmatch
import os
import platform
import shutil
import subprocess
import sys
import webbrowser
from pathlib import Path

from .memory import Memory

IS_WINDOWS = platform.system() == "Windows"
MAX_OUTPUT = 30_000  # modele dönen çıktının karakter sınırı


def _clip(text: str, limit: int = MAX_OUTPUT) -> str:
    if len(text) <= limit:
        return text
    half = limit // 2
    return f"{text[:half]}\n\n... [{len(text) - limit} karakter kısaltıldı] ...\n\n{text[-half:]}"


def _path(p: str) -> Path:
    return Path(os.path.expandvars(str(p))).expanduser()


def _schema(props: dict, required: list[str]) -> dict:
    return {"type": "object", "properties": props, "required": required}


# --- Araç tanımları (modele gönderilen şema) -------------------------------

TOOL_DEFS = [
    {
        "name": "run_command",
        "description": (
            "Bilgisayarda bir terminal komutu çalıştırır (Windows'ta cmd veya PowerShell, "
            "Linux/macOS'ta bash). Program kurma, git, derleme, sistem ayarları, dosya işlemleri "
            "dahil her şey için kullanılabilir. stdout, stderr ve çıkış kodunu döner."
        ),
        "input_schema": _schema(
            {
                "command": {"type": "string", "description": "Çalıştırılacak komut"},
                "cwd": {"type": "string", "description": "Çalışma klasörü (opsiyonel)"},
                "shell": {
                    "type": "string", "enum": ["default", "powershell"],
                    "description": "Windows'ta PowerShell kullanmak için 'powershell'",
                },
                "timeout": {"type": "integer", "description": "Saniye cinsinden zaman aşımı (varsayılan 120)"},
                "background": {
                    "type": "boolean",
                    "description": "true ise komutu arka planda başlatır ve beklemez (sunucu, uzun işlem)",
                },
            },
            ["command"],
        ),
    },
    {
        "name": "run_python",
        "description": "Python kodu çalıştırır ve çıktısını döner. Hesaplama, veri işleme, otomasyon betikleri için.",
        "input_schema": _schema(
            {
                "code": {"type": "string"},
                "timeout": {"type": "integer", "description": "Saniye (varsayılan 120)"},
            },
            ["code"],
        ),
    },
    {
        "name": "read_file",
        "description": "Bir metin dosyasını okur (satır numaralı). Büyük dosyalarda offset/limit kullan.",
        "input_schema": _schema(
            {
                "path": {"type": "string"},
                "offset": {"type": "integer", "description": "Başlangıç satırı (1'den başlar)"},
                "limit": {"type": "integer", "description": "Okunacak satır sayısı (varsayılan 2000)"},
            },
            ["path"],
        ),
    },
    {
        "name": "write_file",
        "description": "Dosyaya metin yazar (gerekirse klasörleri oluşturur). append=true ise sona ekler.",
        "input_schema": _schema(
            {
                "path": {"type": "string"},
                "content": {"type": "string"},
                "append": {"type": "boolean"},
            },
            ["path", "content"],
        ),
    },
    {
        "name": "edit_file",
        "description": "Dosyadaki bir metni birebir bulup değiştirir. old_text dosyada tam olarak bir kez geçmeli.",
        "input_schema": _schema(
            {
                "path": {"type": "string"},
                "old_text": {"type": "string"},
                "new_text": {"type": "string"},
            },
            ["path", "old_text", "new_text"],
        ),
    },
    {
        "name": "list_dir",
        "description": "Klasör içeriğini listeler (boyut ve tür ile). recursive=true ile alt klasörler de.",
        "input_schema": _schema(
            {
                "path": {"type": "string"},
                "recursive": {"type": "boolean"},
                "pattern": {"type": "string", "description": "Ör. *.pdf"},
            },
            ["path"],
        ),
    },
    {
        "name": "search_files",
        "description": "Bir klasör altında dosya adına (glob) ve/veya dosya içeriğine göre arama yapar.",
        "input_schema": _schema(
            {
                "root": {"type": "string"},
                "name_pattern": {"type": "string", "description": "Ör. *rapor*.docx"},
                "contains": {"type": "string", "description": "Dosya içinde aranacak metin"},
                "max_results": {"type": "integer"},
            },
            ["root"],
        ),
    },
    {
        "name": "file_ops",
        "description": "Dosya/klasör işlemleri: copy, move, delete, mkdir.",
        "input_schema": _schema(
            {
                "action": {"type": "string", "enum": ["copy", "move", "delete", "mkdir"]},
                "src": {"type": "string"},
                "dst": {"type": "string", "description": "copy/move için hedef"},
            },
            ["action", "src"],
        ),
    },
    {
        "name": "open_target",
        "description": (
            "Bir dosyayı, klasörü, web adresini veya uygulamayı varsayılan programla açar. "
            "Ör. 'https://youtube.com', 'C:\\Users\\...\\rapor.pdf', 'notepad', 'spotify'."
        ),
        "input_schema": _schema({"target": {"type": "string"}}, ["target"]),
    },
    {
        "name": "system_info",
        "description": "İşletim sistemi, CPU, RAM, disk, pil ve ağ durumu bilgisini döner.",
        "input_schema": _schema({}, []),
    },
    {
        "name": "processes",
        "description": "Çalışan işlemleri listeler (filtreli) veya bir işlemi sonlandırır.",
        "input_schema": _schema(
            {
                "action": {"type": "string", "enum": ["list", "kill"]},
                "name": {"type": "string", "description": "İşlem adı filtresi"},
                "pid": {"type": "integer"},
            },
            ["action"],
        ),
    },
    {
        "name": "clipboard",
        "description": "Panoyu okur (get) veya panoya metin yazar (set).",
        "input_schema": _schema(
            {"action": {"type": "string", "enum": ["get", "set"]}, "text": {"type": "string"}},
            ["action"],
        ),
    },
    {
        "name": "screenshot",
        "description": "Ekran görüntüsü alır, kaydeder ve görüntüyü inceleyebilmen için sana gönderir.",
        "input_schema": _schema({"path": {"type": "string", "description": "Kayıt yolu (opsiyonel)"}}, []),
    },
    {
        "name": "remember",
        "description": "Kullanıcı hakkında veya gelecekte işe yarayacak bir bilgiyi kalıcı hafızaya kaydeder.",
        "input_schema": _schema({"key": {"type": "string"}, "value": {"type": "string"}}, ["key", "value"]),
    },
    {
        "name": "recall",
        "description": "Kalıcı hafızada arama yapar. Boş sorgu tüm kayıtları getirir.",
        "input_schema": _schema({"query": {"type": "string"}}, []),
    },
    {
        "name": "forget",
        "description": "Kalıcı hafızadan bir kaydı siler.",
        "input_schema": _schema({"key": {"type": "string"}}, ["key"]),
    },
]

for _t in TOOL_DEFS:
    _t["eager_input_streaming"] = True

# Anthropic sunucusunda çalışan web araçları
SERVER_TOOLS = [
    {"type": "web_search_20260209", "name": "web_search", "max_uses": 8},
    {"type": "web_fetch_20260209", "name": "web_fetch", "max_uses": 8},
]

REQUIRED = {t["name"]: t["input_schema"]["required"] for t in TOOL_DEFS}


def validate(name: str, args) -> str | None:
    """Akış sırasında kesilmiş/eksik girdileri yakalar. Hata metni veya None döner."""
    if name not in REQUIRED:
        return f"Bilinmeyen araç: {name}"
    if not isinstance(args, dict):
        return "Araç girdisi bir nesne olmalı."
    missing = [k for k in REQUIRED[name] if k not in args]
    if missing:
        return f"Eksik parametre(ler): {', '.join(missing)}"
    return None


def describe(name: str, args: dict) -> str:
    """Onay ekranı ve kayıt için tek satırlık özet."""
    if name == "run_command":
        return f"$ {args.get('command')}" + (f"   (klasör: {args['cwd']})" if args.get("cwd") else "")
    if name == "run_python":
        code = str(args.get("code", ""))
        return "python: " + (code if len(code) < 400 else code[:400] + " …")
    if name == "file_ops":
        return f"{args.get('action')} {args.get('src')}" + (f" → {args['dst']}" if args.get("dst") else "")
    if name in ("write_file", "edit_file", "read_file"):
        return f"{name} {args.get('path')}"
    if name == "processes":
        return f"{args.get('action')} {args.get('name') or args.get('pid') or ''}"
    return f"{name} {args}"


# --- Uygulamalar ------------------------------------------------------------

class ToolBox:
    def __init__(self, memory: Memory, data_dir: Path):
        self.memory = memory
        self.data_dir = data_dir

    def run(self, name: str, args: dict):
        """Aracı çalıştırır. str veya (Anthropic içerik blokları listesi) döner."""
        fn = getattr(self, f"t_{name}")
        return fn(**args)

    # Komutlar
    def t_run_command(self, command, cwd=None, shell="default", timeout=120, background=False):
        cwd = str(_path(cwd)) if cwd else None
        if IS_WINDOWS and shell == "powershell":
            argv, use_shell = ["powershell", "-NoProfile", "-Command", command], False
        else:
            argv, use_shell = command, True
        if background:
            kwargs = {"creationflags": subprocess.CREATE_NEW_CONSOLE} if IS_WINDOWS else {"start_new_session": True}
            proc = subprocess.Popen(argv, shell=use_shell, cwd=cwd,
                                    stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, **kwargs)
            return f"Arka planda başlatıldı (PID {proc.pid})."
        try:
            res = subprocess.run(argv, shell=use_shell, cwd=cwd, capture_output=True,
                                 timeout=timeout, encoding="utf-8", errors="replace")
        except subprocess.TimeoutExpired:
            return f"Zaman aşımı: komut {timeout} saniyede bitmedi."
        out = f"[çıkış kodu {res.returncode}]\n"
        if res.stdout:
            out += f"--- stdout ---\n{res.stdout}\n"
        if res.stderr:
            out += f"--- stderr ---\n{res.stderr}\n"
        return _clip(out)

    def t_run_python(self, code, timeout=120):
        try:
            res = subprocess.run([sys.executable, "-c", code], capture_output=True, timeout=timeout,
                                 encoding="utf-8", errors="replace")
        except subprocess.TimeoutExpired:
            return f"Zaman aşımı: kod {timeout} saniyede bitmedi."
        return _clip(f"[çıkış kodu {res.returncode}]\n{res.stdout}{res.stderr}")

    # Dosyalar
    def t_read_file(self, path, offset=1, limit=2000):
        p = _path(path)
        if not p.is_file():
            return f"Dosya bulunamadı: {p}"
        with p.open("rb") as f:
            head = f.read(4096)
        if b"\x00" in head:
            return f"İkili dosya ({p.stat().st_size:,} bayt) — metin olarak okunamaz. run_python ile işleyebilirsin."
        lines = p.read_text(encoding="utf-8", errors="replace").splitlines()
        start = max(1, int(offset)) - 1
        chunk = lines[start:start + int(limit)]
        body = "\n".join(f"{i:>6}\t{line}" for i, line in enumerate(chunk, start + 1))
        more = f"\n... (toplam {len(lines)} satır)" if start + len(chunk) < len(lines) else ""
        return _clip(body + more)

    def t_write_file(self, path, content, append=False):
        p = _path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open("a" if append else "w", encoding="utf-8") as f:
            f.write(content)
        return f"{'Eklendi' if append else 'Yazıldı'}: {p} ({len(content):,} karakter)"

    def t_edit_file(self, path, old_text, new_text):
        p = _path(path)
        if not p.is_file():
            return f"Dosya bulunamadı: {p}"
        text = p.read_text(encoding="utf-8")
        count = text.count(old_text)
        if count != 1:
            return f"old_text dosyada {count} kez geçiyor; tam olarak 1 olmalı. Daha fazla bağlam ekle."
        p.write_text(text.replace(old_text, new_text), encoding="utf-8")
        return f"Düzenlendi: {p}"

    def t_list_dir(self, path, recursive=False, pattern=None):
        root = _path(path)
        if not root.is_dir():
            return f"Klasör bulunamadı: {root}"
        items = root.rglob("*") if recursive else root.iterdir()
        rows = []
        for item in items:
            if pattern and not fnmatch.fnmatch(item.name.lower(), pattern.lower()):
                continue
            try:
                kind = "📁" if item.is_dir() else f"{item.stat().st_size:>12,} B"
            except OSError:
                kind = "?"
            rows.append(f"{kind:>16}  {item.relative_to(root)}")
            if len(rows) >= 1000:
                rows.append("... (1000 kayıt sınırı)")
                break
        return _clip("\n".join(sorted(rows)) or "(boş)")

    def t_search_files(self, root, name_pattern=None, contains=None, max_results=100):
        base = _path(root)
        if not base.is_dir():
            return f"Klasör bulunamadı: {base}"
        skip = {".git", "node_modules", "__pycache__", "$Recycle.Bin", "AppData", ".venv", "venv"}
        hits = []
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [d for d in dirnames if d not in skip]
            for fname in filenames:
                if name_pattern and not fnmatch.fnmatch(fname.lower(), name_pattern.lower()):
                    continue
                fpath = Path(dirpath) / fname
                if contains:
                    try:
                        if fpath.stat().st_size > 5_000_000:
                            continue
                        text = fpath.read_text(encoding="utf-8", errors="ignore")
                    except OSError:
                        continue
                    idx = text.lower().find(contains.lower())
                    if idx < 0:
                        continue
                    line_no = text.count("\n", 0, idx) + 1
                    hits.append(f"{fpath}:{line_no}")
                else:
                    hits.append(str(fpath))
                if len(hits) >= max_results:
                    return "\n".join(hits) + f"\n... ({max_results} sonuç sınırı)"
        return "\n".join(hits) or "Sonuç yok."

    def t_file_ops(self, action, src, dst=None):
        s = _path(src)
        if action == "mkdir":
            s.mkdir(parents=True, exist_ok=True)
            return f"Klasör oluşturuldu: {s}"
        if not s.exists():
            return f"Bulunamadı: {s}"
        if action == "delete":
            shutil.rmtree(s) if s.is_dir() else s.unlink()
            return f"Silindi: {s}"
        if not dst:
            return "Hedef (dst) gerekli."
        d = _path(dst)
        d.parent.mkdir(parents=True, exist_ok=True)
        if action == "copy":
            shutil.copytree(s, d) if s.is_dir() else shutil.copy2(s, d)
            return f"Kopyalandı: {s} → {d}"
        shutil.move(str(s), str(d))
        return f"Taşındı: {s} → {d}"

    # Uygulamalar ve sistem
    def t_open_target(self, target):
        if target.startswith(("http://", "https://", "www.")):
            webbrowser.open(target if "://" in target else "https://" + target)
            return f"Tarayıcıda açıldı: {target}"
        p = _path(target)
        try:
            if IS_WINDOWS:
                if p.exists():
                    os.startfile(str(p))  # noqa: dosya/klasör
                else:
                    subprocess.Popen(f'start "" "{target}"', shell=True)
            elif platform.system() == "Darwin":
                subprocess.Popen(["open", str(p)] if p.exists() else ["open", "-a", target])
            else:
                subprocess.Popen(["xdg-open", str(p)] if p.exists() else [target], start_new_session=True,
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except OSError as e:
            return f"Açılamadı: {e}"
        return f"Açıldı: {target}"

    def t_system_info(self):
        info = [
            f"Sistem: {platform.system()} {platform.release()} ({platform.version()})",
            f"Makine: {platform.node()} / {platform.machine()}",
            f"Python: {sys.version.split()[0]}",
            f"Kullanıcı klasörü: {Path.home()}",
        ]
        try:
            import psutil
            vm = psutil.virtual_memory()
            info.append(f"CPU: {psutil.cpu_count()} çekirdek, kullanım %{psutil.cpu_percent(interval=0.5)}")
            info.append(f"RAM: {vm.used / 2**30:.1f} / {vm.total / 2**30:.1f} GB (%{vm.percent})")
            for part in psutil.disk_partitions():
                try:
                    u = psutil.disk_usage(part.mountpoint)
                    info.append(f"Disk {part.mountpoint}: {u.free / 2**30:.0f} GB boş / {u.total / 2**30:.0f} GB")
                except OSError:
                    pass
            bat = psutil.sensors_battery()
            if bat:
                info.append(f"Pil: %{bat.percent:.0f} {'(şarjda)' if bat.power_plugged else ''}")
        except ImportError:
            total, used, free = shutil.disk_usage(Path.home().anchor or "/")
            info.append(f"Disk: {free / 2**30:.0f} GB boş / {total / 2**30:.0f} GB (detay için: pip install psutil)")
        return "\n".join(info)

    def t_processes(self, action, name=None, pid=None):
        try:
            import psutil
        except ImportError:
            return "psutil kurulu değil: pip install psutil (veya run_command ile tasklist/ps kullan)"
        if action == "kill":
            targets = [psutil.Process(pid)] if pid else [
                p for p in psutil.process_iter(["name"]) if name and name.lower() in (p.info["name"] or "").lower()
            ]
            if not targets:
                return "Eşleşen işlem yok."
            killed = []
            for p in targets:
                try:
                    p.terminate()
                    killed.append(f"{p.pid} {p.name()}")
                except psutil.Error as e:
                    killed.append(f"{p.pid} hata: {e}")
            return "Sonlandırıldı:\n" + "\n".join(killed)
        rows = []
        for p in psutil.process_iter(["pid", "name", "memory_info", "cpu_percent"]):
            n = p.info["name"] or ""
            if name and name.lower() not in n.lower():
                continue
            mem = (p.info["memory_info"].rss / 2**20) if p.info["memory_info"] else 0
            rows.append((mem, f"{p.info['pid']:>7}  {mem:>8.0f} MB  {n}"))
        rows.sort(reverse=True)
        return "\n".join(r for _, r in rows[:60]) or "Eşleşen işlem yok."

    def t_clipboard(self, action, text=None):
        try:
            import pyperclip
        except ImportError:
            return "pyperclip kurulu değil: pip install pyperclip"
        if action == "set":
            pyperclip.copy(text or "")
            return "Panoya kopyalandı."
        return _clip(pyperclip.paste() or "(pano boş)")

    def t_screenshot(self, path=None):
        try:
            from PIL import ImageGrab
        except ImportError:
            return "Pillow kurulu değil: pip install pillow"
        import base64
        import io
        from datetime import datetime
        img = ImageGrab.grab()
        p = _path(path) if path else self.data_dir / "screenshots" / f"ekran_{datetime.now():%Y%m%d_%H%M%S}.png"
        p.parent.mkdir(parents=True, exist_ok=True)
        img.save(p)
        preview = img.copy()
        preview.thumbnail((1568, 1568))
        buf = io.BytesIO()
        preview.save(buf, format="PNG")
        return [
            {"type": "text", "text": f"Ekran görüntüsü kaydedildi: {p}"},
            {"type": "image", "source": {"type": "base64", "media_type": "image/png",
                                         "data": base64.standard_b64encode(buf.getvalue()).decode()}},
        ]

    # Hafıza
    def t_remember(self, key, value):
        return self.memory.remember(key, value)

    def t_recall(self, query=""):
        return self.memory.recall(query)

    def t_forget(self, key):
        return self.memory.forget(key)
