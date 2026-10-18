"""İzin katmanı: hangi işlemin onay gerektirdiğine karar verir ve her işlemi kaydeder."""

import re
from datetime import datetime
from pathlib import Path

from rich.console import Console
from rich.prompt import Confirm

# Her modda (tam yetki dahil) mutlaka onay istenen, geri dönüşü olmayan komutlar.
CATASTROPHIC = [
    r"\brm\s+-[a-z]*r[a-z]*f?[a-z]*\s+(/|~|\$HOME|/\*)(\s|$)",
    r"\bformat\s+[a-z]:",
    r"\bmkfs(\.\w+)?\b",
    r"\bdd\s+.*of=/dev/",
    r"\bdiskpart\b",
    r"\b(rd|rmdir)\s+/s\s+/q\s+[a-z]:\\?\s*$",
    r"\bdel\s+/[a-z\s/]*\s+[a-z]:\\\*",
    r"Remove-Item\s+.*-Recurse.*\s+[A-Za-z]:\\\s*$",
    r"\bbcdedit\b",
    r"\bcipher\s+/w",
    r":\(\)\s*\{\s*:\|:&\s*\};:",
]

# "akilli" modda onay istenen, veri kaybettirebilecek komutlar.
DESTRUCTIVE = [
    r"\brm\b", r"\bdel\b", r"\berase\b", r"\brmdir\b", r"\brd\b", r"Remove-Item",
    r"\bshutdown\b", r"\brestart-computer\b", r"\breboot\b", r"\bkill(all)?\b",
    r"\btaskkill\b", r"Stop-Process", r"\breg\s+(delete|add)\b", r"\bgit\s+(push\s+.*--force|reset\s+--hard|clean)",
    r"\bchmod\s+-R\b", r"\bchown\s+-R\b", r"\bsudo\b", r"\bmv\b", r"\bmove\b",
    r"\bnetsh\b", r"\bsc\s+(delete|stop|config)\b", r"\bpip\s+uninstall\b", r"\bwinget\s+uninstall\b",
    r">\s*[^>&|]",  # dosya üzerine yazma yönlendirmesi
]

SAFE_TOOLS = {
    "read_file", "list_dir", "search_files", "system_info", "recall", "screenshot",
}


def _matches(patterns: list[str], text: str) -> bool:
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)


class Gatekeeper:
    def __init__(self, mode: str, log_file: Path, console: Console):
        self.mode = mode
        self.log_file = log_file
        self.console = console

    def log(self, tool: str, detail: str, outcome: str) -> None:
        self.log_file.parent.mkdir(parents=True, exist_ok=True)
        stamp = datetime.now().isoformat(timespec="seconds")
        with self.log_file.open("a", encoding="utf-8") as f:
            f.write(f"{stamp}\t{tool}\t{outcome}\t{detail[:500]!r}\n")

    def _risk(self, tool: str, args: dict) -> str:
        """'safe', 'normal', 'destructive' veya 'catastrophic' döner."""
        if tool in SAFE_TOOLS:
            return "safe"
        if tool == "processes":
            return "destructive" if args.get("action") == "kill" else "safe"
        if tool == "clipboard":
            return "safe" if args.get("action") == "get" else "normal"
        if tool in ("remember", "forget"):
            return "safe"
        if tool == "file_ops":
            return "destructive" if args.get("action") in ("delete", "move") else "normal"
        if tool == "write_file" and not args.get("append"):
            return "destructive" if Path(str(args.get("path", ""))).expanduser().exists() else "normal"
        if tool in ("run_command", "run_python"):
            text = str(args.get("command") or args.get("code") or "")
            if _matches(CATASTROPHIC, text):
                return "catastrophic"
            if _matches(DESTRUCTIVE, text) or tool == "run_python" and re.search(
                r"\b(rmtree|remove|unlink|rmdir|kill|system|Popen)\b", text
            ):
                return "destructive"
        return "normal"

    def allow(self, tool: str, args: dict, summary: str) -> bool:
        risk = self._risk(tool, args)
        need_confirm = (
            risk == "catastrophic"
            or (self.mode == "guvenli" and risk != "safe")
            or (self.mode == "akilli" and risk == "destructive")
        )
        if not need_confirm:
            self.log(tool, summary, "auto")
            return True

        color = "bold red" if risk == "catastrophic" else "yellow"
        label = "GERİ DÖNÜŞÜ OLMAYAN İŞLEM" if risk == "catastrophic" else "Onay gerekli"
        self.console.print(f"\n[{color}]⚠ {label}[/] → [cyan]{tool}[/]\n  {summary}")
        try:
            ok = Confirm.ask("  İzin veriyor musunuz?", default=False)
        except (EOFError, KeyboardInterrupt):
            ok = False
        self.log(tool, summary, "approved" if ok else "denied")
        return ok
