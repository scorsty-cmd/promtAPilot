#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Videoyu YouTube yükleme kuyruğuna gönderir (Claude görevleri için release yerine).

Claude'un bulut oturumları GitHub Release oluşturamaz ("not permitted for this
session type"), ama depoya push yapabilir. Bu betik dosyaları `queue/<tag>`
dalına gönderir; .github/workflows/queue-upload.yml de videoyu YouTube'a yükler
ve aynı etiketle GitHub Release'i (tüm dosyalar + "YouTube: https://youtu.be/..."
satırı) kendisi oluşturur. Sonuç, eski release akışıyla birebir aynıdır.

Kullanım (deponun bir klonunun içinden):
  python tools/queue_publish.py --tag history-2026-10-23-hattin \
      --name "History Sourced: <başlık>" --body-file body.txt --wait \
      2026-10-23_hattin.mp4 thumb_B.jpg subtitles.srt YOUTUBE_METADATA.txt

  --tag   history-… / hiddenlayer-… / animals-… (test-… = deneme: YouTube'a
          yüklemez, release'i oluşturup siler)
  --wait  iş akışı bitene kadar bekler; sonucu (release linki, YouTube linki,
          planlanan yayın veya hata) yazdırır. Çıkış kodu 0 = başarılı.

90 MB'tan büyük dosyalar parçalara bölünür ve her push ~90 MB'ı geçmez.
Aynı etiket için release veya queue dalı zaten varsa hiçbir şey göndermez
(çift yükleme olmasın). Bekleyen bir gönderimi iptal etmek için:
  python tools/queue_publish.py --cancel --tag <tag>
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

REPO = "scorsty-cmd/promtapilot"
PART = 85 * 1024 * 1024          # parça boyutu (GitHub dosya sınırı 100 MB)
PUSH_BATCH = 90 * 1024 * 1024    # tek push'ta gönderilecek en fazla veri
TAG_RE = re.compile(r"^(history-|hiddenlayer-|animals-|test-)[a-z0-9][a-z0-9._-]{2,90}$")
VIDEO_EXT = (".mp4", ".mov", ".mkv")


def run(cmd: list[str], cwd: str | None = None, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, cwd=cwd, check=check, text=True,
                          stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def gh_json(path: str) -> dict | list | None:
    r = run(["gh", "api", path], check=False)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout)
    except Exception:
        return None


def check_tag(tag: str) -> None:
    if not TAG_RE.match(tag):
        raise SystemExit(f"❌ Geçersiz etiket {tag!r}: küçük harf/rakam/tire, history-, hiddenlayer-, animals- veya test- ile başlamalı.")
    low = tag.lower()
    if low.startswith("history-") and "hidden" in low:
        raise SystemExit("❌ history- etiketi 'hidden' içeremez (kanal ayrımı).")
    if low.startswith("hiddenlayer-") and ("history" in low or "shorts" in low):
        raise SystemExit("❌ hiddenlayer- etiketi 'history' veya 'shorts' içeremez (kanal ayrımı).")
    if low.startswith("animals-") and any(k in low for k in ("history", "hidden", "shorts")):
        raise SystemExit("❌ animals- etiketi 'history', 'hidden' veya 'shorts' içeremez (kanal ayrımı).")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git(wt: str, *args: str) -> str:
    return run(["git", "-c", "user.name=Claude", "-c", "user.email=noreply@anthropic.com", *args], cwd=wt).stdout


def push(wt: str, branch: str) -> None:
    for attempt in range(3):
        r = run(["git", "push", "-q", "origin", f"HEAD:refs/heads/{branch}"], cwd=wt, check=False)
        if r.returncode == 0:
            return
        print(f"  push denemesi {attempt + 1} başarısız:\n{r.stdout.strip()[-600:]}")
        # Bağlantı kopsa bile push uzak tarafa ulaşmış olabilir: kontrol et.
        remote = run(["git", "ls-remote", "origin", f"refs/heads/{branch}"], cwd=wt, check=False).stdout.split()
        local = run(["git", "rev-parse", "HEAD"], cwd=wt).stdout.strip()
        if remote and remote[0] == local:
            print("  (uzak dal zaten güncel — push aslında ulaşmış)")
            return
        time.sleep(10 * (attempt + 1))
    raise SystemExit("❌ push 3 denemede başarısız oldu.")


def repo_root() -> str:
    here = Path(__file__).resolve().parent
    return run(["git", "rev-parse", "--show-toplevel"], cwd=str(here)).stdout.strip()


def make_worktree(root: str, branch: str) -> str:
    run(["git", "fetch", "-q", "--depth", "1", "origin", "main"], cwd=root)
    wt = tempfile.mkdtemp(prefix="queue_wt_")
    shutil.rmtree(wt)
    run(["git", "worktree", "add", "-q", "--detach", wt, "FETCH_HEAD"], cwd=root)
    return wt


def drop_worktree(root: str, wt: str) -> None:
    run(["git", "worktree", "remove", "--force", wt], cwd=root, check=False)
    shutil.rmtree(wt, ignore_errors=True)


def wait_for_run(branch: str, sha: str, tag: str, timeout_min: int) -> int:
    print(f"⏳ Yükleme iş akışı bekleniyor (en fazla {timeout_min} dk)...")
    deadline = time.time() + timeout_min * 60
    run_info = None
    while time.time() < deadline:
        data = gh_json(f"repos/{REPO}/actions/workflows/queue-upload.yml/runs?branch={branch}&per_page=10") or {}
        runs = [r for r in data.get("workflow_runs", []) if r.get("head_sha") == sha]
        if runs:
            run_info = runs[0]
            if run_info.get("status") == "completed":
                break
        time.sleep(30)
    if not run_info or run_info.get("status") != "completed":
        print(f"⚠️ İş akışı {timeout_min} dk içinde bitmedi. Durum: {run_info and run_info.get('html_url')}")
        return 3
    concl = run_info.get("conclusion")
    print(f"İş akışı sonucu: {concl} — {run_info.get('html_url')}")
    if tag.startswith("test-"):
        return 0 if concl == "success" else 2
    rel = gh_json(f"repos/{REPO}/releases/tags/{tag}")
    if isinstance(rel, dict):
        print(f"Release: {rel.get('html_url')}")
        body = rel.get("body") or ""
        for line in body.splitlines():
            if line.startswith(("YouTube", "Planlanan yayın")):
                print(line)
    else:
        print("Release oluşturulmamış (birleştirme/doğrulama aşamasında hata olabilir; iş akışı linkine bak).")
    return 0 if concl == "success" else 2


def cancel(tag: str) -> None:
    branch = f"queue/{tag}"
    if not run(["git", "ls-remote", "origin", f"refs/heads/{branch}"], cwd=repo_root()).stdout.strip():
        raise SystemExit(f"{branch} dalı yok, iptal edilecek bir şey yok.")
    root = repo_root()
    run(["git", "fetch", "-q", "--depth", "1", "origin", f"{branch}:refs/remotes/origin/{branch}"], cwd=root)
    wt = tempfile.mkdtemp(prefix="queue_wt_")
    shutil.rmtree(wt)
    run(["git", "worktree", "add", "-q", "--detach", wt, f"origin/{branch}"], cwd=root)
    try:
        # Dal eski bir main'den açıldıysa iş akışı dosyası olmayabilir: main'i birleştir.
        run(["git", "fetch", "-q", "--depth", "1", "origin", "main"], cwd=wt)
        run(["git", "-c", "user.name=Claude", "-c", "user.email=noreply@anthropic.com",
             "merge", "-q", "--allow-unrelated-histories", "-X", "theirs", "-m", "main'i al", "FETCH_HEAD"], cwd=wt, check=False)
        d = Path(wt) / "upload_queue" / tag
        d.mkdir(parents=True, exist_ok=True)
        (d / "CANCEL").write_text("iptal\n", encoding="utf-8")
        git(wt, "add", "-A")
        git(wt, "commit", "-q", "-m", f"queue: {tag} iptal")
        push(wt, branch)
        print(f"🗑️ {branch} iptal edildi; iş akışı dalı silecek.")
    finally:
        drop_worktree(root, wt)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tag", required=True)
    ap.add_argument("--name", help="Release adı (ör. 'History Sourced: <başlık>')")
    ap.add_argument("--body", default="", help="Release açıklaması")
    ap.add_argument("--body-file", help="Release açıklaması dosyası")
    ap.add_argument("--wait", action="store_true", help="İş akışı bitene kadar bekle ve sonucu yazdır")
    ap.add_argument("--timeout", type=int, default=45, help="--wait için dakika")
    ap.add_argument("--cancel", action="store_true", help="Bekleyen queue/<tag> gönderimini iptal et")
    ap.add_argument("files", nargs="*")
    a = ap.parse_args()

    tag = a.tag.strip()
    if a.cancel:
        cancel(tag)
        return
    check_tag(tag)

    files = [Path(f).resolve() for f in a.files]
    if not files:
        raise SystemExit("❌ Gönderilecek dosya yok.")
    for f in files:
        if not f.is_file():
            raise SystemExit(f"❌ Dosya yok: {f}")
    names = [f.name for f in files]
    if len(set(names)) != len(names):
        raise SystemExit("❌ Aynı adlı iki dosya var.")
    videos = [f for f in files if f.name.lower().endswith(VIDEO_EXT)]
    if len(videos) != 1:
        raise SystemExit(f"❌ Tam olarak 1 video dosyası olmalı (bulunan: {[v.name for v in videos]}).")
    thumbs = [n for n in names if "thumb" in n.lower() and n.lower().endswith((".jpg", ".jpeg", ".png"))]
    if len(thumbs) > 1:
        raise SystemExit(f"❌ Adında 'thumb' geçen yalnızca 1 görsel olabilir (yükleyici ilkini kapak yapar): {thumbs}")
    for f in files:
        if f.stat().st_size >= 2 * 1024**3:
            raise SystemExit(f"❌ {f.name} 2 GB'tan büyük (release sınırı).")

    branch = f"queue/{tag}"
    if isinstance(gh_json(f"repos/{REPO}/releases/tags/{tag}"), dict):
        raise SystemExit(f"⛔ {tag} etiketli release zaten var — video ikinci kez gönderilmedi.")
    root = repo_root()
    if run(["git", "ls-remote", "origin", f"refs/heads/{branch}"], cwd=root).stdout.strip():
        raise SystemExit(f"⛔ {branch} dalı zaten var (gönderim sürüyor veya başarısız olmuş) — ikinci kez gönderilmedi.")

    body = a.body
    if a.body_file:
        body = Path(a.body_file).read_text(encoding="utf-8")
    manifest = {"tag": tag, "release_name": a.name or tag, "release_body": body,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "files": []}

    wt = make_worktree(root, branch)
    try:
        job = Path(wt) / "upload_queue" / tag
        job.mkdir(parents=True)
        batch, batch_size, pushed_any = [], 0, False

        def flush(msg: str) -> None:
            nonlocal batch, batch_size, pushed_any
            if not batch:
                return
            git(wt, "add", *batch)
            git(wt, "commit", "-q", "-m", msg)
            push(wt, branch)
            pushed_any = True
            print(f"  ↑ {msg} ({batch_size / 1e6:.1f} MB)")
            batch, batch_size = [], 0

        for f in sorted(files, key=lambda p: p.stat().st_size):
            size = f.stat().st_size
            entry = {"name": f.name, "size": size, "sha256": sha256(f)}
            if size > PART:
                parts = []
                with open(f, "rb") as r:
                    i = 0
                    while True:
                        chunk = r.read(PART)
                        if not chunk:
                            break
                        pname = f"{f.name}.part{i:03d}"
                        (job / pname).write_bytes(chunk)
                        if batch_size + len(chunk) > PUSH_BATCH:
                            flush(f"queue: {tag} parçalar")
                        batch.append(str(job / pname))
                        batch_size += len(chunk)
                        parts.append(pname)
                        i += 1
                entry["parts"] = parts
            else:
                if batch_size + size > PUSH_BATCH:
                    flush(f"queue: {tag} dosyalar")
                shutil.copy2(f, job / f.name)
                batch.append(str(job / f.name))
                batch_size += size
            manifest["files"].append(entry)
        flush(f"queue: {tag} dosyalar")

        (job / "MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
        git(wt, "add", str(job / "MANIFEST.json"))
        git(wt, "commit", "-q", "-m", f"queue: {tag} hazır (MANIFEST)")
        push(wt, branch)
        sha = run(["git", "rev-parse", "HEAD"], cwd=wt).stdout.strip()
    finally:
        drop_worktree(root, wt)

    total = sum(e["size"] for e in manifest["files"])
    print(f"✅ {tag}: {len(files)} dosya ({total / 1e6:.1f} MB) {branch} dalına gönderildi. "
          f"Yükleme iş akışı başladı: https://github.com/{REPO}/actions/workflows/queue-upload.yml")
    if a.wait:
        sys.exit(wait_for_run(branch, sha, tag, a.timeout))


if __name__ == "__main__":
    main()
