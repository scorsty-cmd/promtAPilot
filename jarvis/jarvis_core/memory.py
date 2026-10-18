"""Kalıcı hafıza: Jarvis'in oturumlar arasında hatırladığı bilgiler."""

import json
from datetime import datetime
from pathlib import Path


class Memory:
    def __init__(self, path: Path):
        self.path = path
        self.data: dict[str, dict] = {}
        if path.exists():
            try:
                self.data = json.loads(path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                self.data = {}

    def _save(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, ensure_ascii=False, indent=2), encoding="utf-8")

    def remember(self, key: str, value: str) -> str:
        self.data[key] = {"value": value, "updated": datetime.now().isoformat(timespec="seconds")}
        self._save()
        return f"Hafızaya kaydedildi: {key}"

    def forget(self, key: str) -> str:
        if self.data.pop(key, None) is None:
            return f"'{key}' hafızada yok."
        self._save()
        return f"Silindi: {key}"

    def recall(self, query: str = "") -> str:
        q = query.lower().strip()
        hits = {
            k: v for k, v in self.data.items()
            if not q or q in k.lower() or q in str(v.get("value", "")).lower()
        }
        if not hits:
            return "Eşleşen hafıza kaydı yok."
        return "\n".join(f"- {k}: {v['value']}" for k, v in sorted(hits.items()))

    def summary(self) -> str:
        """Sistem istemine eklenen kısa hafıza özeti."""
        if not self.data:
            return "(henüz kayıtlı bilgi yok)"
        return "\n".join(f"- {k}: {v['value']}" for k, v in sorted(self.data.items()))
