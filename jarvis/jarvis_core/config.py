"""Jarvis ayarları: model, izin modu, veri klasörleri."""

import os
from dataclasses import dataclass, field
from pathlib import Path

DATA_DIR = Path(os.environ.get("JARVIS_HOME", Path.home() / ".jarvis"))


def _load_dotenv() -> None:
    """jarvis/.env dosyasındaki değişkenleri (varsa) ortama yükler."""
    env_file = Path(__file__).resolve().parent.parent / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_dotenv()


@dataclass
class Config:
    model: str = os.environ.get("JARVIS_MODEL", "claude-opus-5-5")
    # low | medium | high | xhigh | max
    effort: str = os.environ.get("JARVIS_EFFORT", "high")
    # guvenli: her riskli işlemde sorar
    # akilli : sadece silme/öldürme/tehlikeli komutlarda sorar (varsayılan)
    # tam    : hiçbir şey sormaz (felaket komutları hariç)
    permission_mode: str = os.environ.get("JARVIS_MODE", "akilli")
    user_name: str = os.environ.get("JARVIS_USER_NAME", "efendim")
    voice: bool = False
    data_dir: Path = field(default_factory=lambda: DATA_DIR)

    @property
    def memory_file(self) -> Path:
        return self.data_dir / "memory.json"

    @property
    def log_file(self) -> Path:
        return self.data_dir / "actions.log"

    def ensure_dirs(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
