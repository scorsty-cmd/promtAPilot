#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kuyruk yükleme işi (GitHub Actions tarafı) — .github/workflows/queue-upload.yml çağırır.

Neden var: Claude'un bulut oturumları GitHub Release oluşturamıyor, ama depoya
push yapabiliyor. Bu yüzden üretim görevleri videoyu `queue/<tag>` dalına
parçalar halinde push'lar (tools/queue_publish.py), bu iş akışı da:
  1. parçaları birleştirip SHA-256 ile doğrular            (prepare)
  2. tools/upload_to_youtube.py ile YouTube'a yükler       (workflow adımı)
  3. aynı etiketle GitHub Release'i *bot olarak* oluşturur, tüm dosyaları ve
     "YouTube: https://youtu.be/..." satırını ekler          (finalize)
  4. başarılıysa queue/<tag> dalını siler (büyük dosyalar depoda kalmaz).

Bot'un oluşturduğu release başka iş akışlarını tetiklemez (GITHUB_TOKEN kuralı),
ayrıca daily-upload.yml bot release'lerini açıkça atlar → çift yükleme olmaz.

Dal düzeni:  upload_queue/<tag>/MANIFEST.json  (en son push'lanır, tetikleyicidir)
             upload_queue/<tag>/<dosya> veya <dosya>.part000, .part001 ...
             upload_queue/<tag>/CANCEL  (varsa: hiçbir şey yüklenmez, dal silinir)
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

TAG_RE = re.compile(r"^(history-|hiddenlayer-|animals-|test-)[a-z0-9][a-z0-9._-]{2,90}$")
VIDEO_EXT = (".mp4", ".mov", ".mkv")


def sh(*args: str, check: bool = True, capture: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(list(args), check=check, text=True,
                          stdout=subprocess.PIPE if capture else None,
                          stderr=subprocess.PIPE if capture else None)


def set_output(**kv: str) -> None:
    out = os.environ.get("GITHUB_OUTPUT")
    lines = [f"{k}={v}" for k, v in kv.items()]
    if out:
        with open(out, "a", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
    print("\n".join(lines))


def summary(text: str) -> None:
    p = os.environ.get("GITHUB_STEP_SUMMARY")
    if p:
        with open(p, "a", encoding="utf-8") as f:
            f.write(text + "\n")
    print(text)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def tag_from_ref() -> str:
    ref = os.environ.get("GITHUB_REF_NAME", "")
    if not ref.startswith("queue/"):
        raise SystemExit(f"Beklenmeyen dal: {ref!r}")
    return ref[len("queue/"):]


def get_release(tag: str) -> dict | None:
    repo = os.environ["GITHUB_REPOSITORY"]
    r = sh("gh", "api", f"repos/{repo}/releases/tags/{tag}", check=False)
    if r.returncode != 0:
        return None
    try:
        return json.loads(r.stdout)
    except Exception:
        return None


def prepare(out_dir: str) -> None:
    tag = tag_from_ref()
    job = Path("upload_queue") / tag
    if not TAG_RE.match(tag):
        summary(f"❌ Geçersiz etiket: `{tag}` (history-, hiddenlayer-, animals- veya test- ile başlamalı)")
        raise SystemExit(1)
    if (job / "CANCEL").exists():
        summary(f"🗑️ `{tag}` iptal edildi (CANCEL dosyası). Dal silinecek, hiçbir şey yüklenmeyecek.")
        set_output(action="cancel", tag=tag)
        return
    man_path = job / "MANIFEST.json"
    if not man_path.exists():
        print(f"ℹ️ {man_path} henüz yok (parçalar hâlâ geliyor). Bekleniyor, iş bitti.")
        set_output(action="skip", tag=tag)
        return
    man = json.loads(man_path.read_text(encoding="utf-8"))
    if man.get("tag") != tag:
        summary(f"❌ MANIFEST etiketi ({man.get('tag')}) dal adıyla ({tag}) uyuşmuyor.")
        raise SystemExit(1)

    rel = get_release(tag)
    if rel and "YouTube: https://youtu.be/" in (rel.get("body") or ""):
        summary(f"✅ `{tag}` zaten yüklenmiş ({rel.get('html_url')}). Tekrar yüklenmeyecek, dal silinecek.")
        set_output(action="already_done", tag=tag)
        return

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    video = ""
    for f in man["files"]:
        name = f["name"]
        if "/" in name or name.startswith("."):
            raise SystemExit(f"Geçersiz dosya adı: {name}")
        dest = out / name
        parts = f.get("parts") or [name]
        with open(dest, "wb") as w:
            for p in parts:
                src = job / p
                if not src.exists():
                    summary(f"❌ Eksik parça: `{p}`")
                    raise SystemExit(1)
                with open(src, "rb") as r:
                    while True:
                        b = r.read(8 * 1024 * 1024)
                        if not b:
                            break
                        w.write(b)
        size = dest.stat().st_size
        digest = sha256(dest)
        if size != f["size"] or digest != f["sha256"]:
            summary(f"❌ `{name}` doğrulanamadı (boyut {size}/{f['size']}, sha {digest[:12]}/{f['sha256'][:12]}).")
            raise SystemExit(1)
        print(f"  ✓ {name}: {size/1e6:.1f} MB, {len(parts)} parça, SHA-256 doğru")
        if name.lower().endswith(VIDEO_EXT) and not video:
            video = str(dest.resolve())
    if not video:
        summary("❌ MANIFEST içinde video dosyası yok.")
        raise SystemExit(1)

    action = "dry" if tag.startswith("test-") else "upload"
    set_output(action=action, tag=tag, video=video)


def build_body(man: dict, result: dict | None, run_url: str, failed: bool) -> str:
    body = (man.get("release_body") or "").rstrip()
    if result:
        body += f"\n\nYouTube: {result['video_url']}"
        if result.get("schedule_label"):
            body += f"\nPlanlanan yayın: {result['schedule_label']}"
    elif failed:
        body += (f"\n\nYouTube yüklemesi BAŞARISIZ — ayrıntı: {run_url}\n"
                 "Sorun giderilince bu çalıştırmada \"Re-run all jobs\" ile tekrar denenebilir "
                 "(dosyalar queue dalında duruyor).")
    body += f"\n\n(Kuyruk akışıyla yayımlandı: {run_url})"
    return body.strip()


def finalize(out_dir: str, upload_outcome: str) -> None:
    tag = tag_from_ref()
    repo = os.environ["GITHUB_REPOSITORY"]
    run_url = f"{os.environ.get('GITHUB_SERVER_URL', 'https://github.com')}/{repo}/actions/runs/{os.environ.get('GITHUB_RUN_ID', '')}"
    man = json.loads((Path("upload_queue") / tag / "MANIFEST.json").read_text(encoding="utf-8"))
    res_path = Path(out_dir) / "_result.json"
    result = json.loads(res_path.read_text(encoding="utf-8")) if res_path.exists() else None
    dry = tag.startswith("test-")
    failed = (not dry) and (upload_outcome != "success" or not result)

    body_file = Path(out_dir) / "_release_body.md"
    body_file.write_text(build_body(man, result, run_url, failed), encoding="utf-8")
    files = [str(Path(out_dir) / f["name"]) for f in man["files"]]
    title = man.get("release_name") or tag

    rel = get_release(tag)
    if rel is None:
        sh("gh", "release", "create", tag, *files, "--repo", repo, "--target", "main",
           "--title", title, "--notes-file", str(body_file), capture=False)
    else:
        sh("gh", "release", "edit", tag, "--repo", repo, "--notes-file", str(body_file), capture=False)
        have = {a["name"]: a.get("size") for a in rel.get("assets", [])}
        missing = [p for p, f in zip(files, man["files"]) if have.get(f["name"]) != f["size"]]
        if missing:
            sh("gh", "release", "upload", tag, *missing, "--repo", repo, "--clobber", capture=False)

    rel = get_release(tag) or {}
    have = {a["name"]: a.get("size") for a in rel.get("assets", [])}
    bad = [f["name"] for f in man["files"] if have.get(f["name"]) != f["size"]]
    if bad:
        summary(f"❌ Release dosyaları eksik/yanlış: {bad}")
        raise SystemExit(1)
    summary(f"📦 Release: {rel.get('html_url')}  ({len(have)} dosya)")
    if result:
        summary(f"🎬 YouTube: {result['video_url']} — {result.get('schedule_label','')} — kanal: {result.get('channel_title','')}")

    if dry:
        sh("gh", "release", "delete", tag, "--repo", repo, "--cleanup-tag", "--yes", capture=False)
        summary("🧪 Test etiketi: release doğrulandı ve silindi (YouTube'a hiçbir şey yüklenmedi).")

    if failed:
        summary("⚠️ YouTube yüklemesi başarısız. queue dalı silinmedi; sorun giderilince bu çalıştırma yeniden denenebilir.")
        raise SystemExit(1)


def main() -> None:
    if len(sys.argv) < 3:
        raise SystemExit("kullanım: queue_job.py prepare <out_dir> | finalize <out_dir> <upload_outcome>")
    cmd, out_dir = sys.argv[1], sys.argv[2]
    if cmd == "prepare":
        prepare(out_dir)
    elif cmd == "finalize":
        finalize(out_dir, sys.argv[3] if len(sys.argv) > 3 else "skipped")
    else:
        raise SystemExit(f"bilinmeyen komut: {cmd}")


if __name__ == "__main__":
    main()
