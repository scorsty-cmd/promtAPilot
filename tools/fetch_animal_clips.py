#!/usr/bin/env python3
"""Fetch free-licence animal video clips for Universe Of Animals Shorts.

Runs in GitHub Actions (full internet). For every animal-requests/<id>.json that has no
<STORE>/<id>/manifest.json yet:
    {"id": "20261022-a", "items": [{"key": "cat", "query": "funny cat", "n": 4}]}
it searches Pexels Videos first (Pexels License: free use, editing allowed, no attribution
required; only when the PEXELS_API_KEY secret exists), then Wikimedia Commons videos
(CC0 / Public Domain / CC BY only, never BY-SA or NC; attribution recorded).
Every clip is normalised to a silent 1080x1920 30 fps H.264 MP4 of at most 25 s (landscape
footage gets a blurred fill background) and a 3-frame preview strip JPG, so the Short
renderer only has to read them. Already-used source ids are remembered in seen.json so a
clip is never used twice. Also caches the Turkish Piper TTS voice in <STORE>/tts/ once.

Usage: python tools/fetch_animal_clips.py <store_dir>
"""
import json, os, re, subprocess, sys, time, datetime, shutil
import requests

REQ_DIR = 'animal-requests'
STORE = sys.argv[1] if len(sys.argv) > 1 else 'store'
UA = {'User-Agent': 'UniverseOfAnimalsShorts/1.1 (https://github.com/scorsty-cmd/promtapilot; scorsty@gmail.com) python-requests'}
RUNLOG = []
PEXELS_KEY = os.environ.get('PEXELS_API_KEY', '').strip()
COMMONS = 'https://commons.wikimedia.org/w/api.php'
LOG = []


def log(*a):
    line = ' '.join(str(x) for x in a)
    LOG.append(line); RUNLOG.append(line); print(*a, flush=True)


def get_stream(url, dest, limit_mb=300, tries=4):
    """Download with polite retries (Wikimedia answers 429 when hit too fast)."""
    for k in range(tries):
        try:
            with requests.get(url, headers=UA, stream=True, timeout=120) as r:
                if r.status_code == 429:
                    wait = int(r.headers.get('Retry-After') or 0) or 10 * (k + 1)
                    log('429, waiting', wait); time.sleep(min(wait, 60)); continue
                r.raise_for_status()
                size = 0
                with open(dest, 'wb') as f:
                    for ch in r.iter_content(1 << 20):
                        size += len(ch); f.write(ch)
                        if size > limit_mb * (1 << 20):
                            raise RuntimeError('too big')
                return True
        except Exception as e:
            log('download error', url[:120], e)
            time.sleep(5)
    return False


def load_json(p, default):
    try:
        with open(p, encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return default


def search_pexels(query, seen):
    if not PEXELS_KEY:
        return []
    try:
        r = requests.get('https://api.pexels.com/videos/search',
                         params={'query': query, 'orientation': 'portrait', 'per_page': 40},
                         headers={'Authorization': PEXELS_KEY, **UA}, timeout=30)
        vids = r.json().get('videos', [])
        log('pexels', query, r.status_code, 'results', len(vids))
    except Exception as e:
        log('pexels error', e); return []
    out = []
    for v in vids:
        sid = f"pexels-{v['id']}"
        if sid in seen or not (5 <= (v.get('duration') or 0) <= 60):
            continue
        files = [f for f in v.get('video_files', []) if (f.get('height') or 0) >= 1280 and f.get('file_type') == 'video/mp4']
        if not files:
            files = [f for f in v.get('video_files', []) if (f.get('height') or 0) >= 720]
        if not files:
            continue
        f = sorted(files, key=lambda x: abs((x.get('height') or 0) - 1920))[0]
        out.append({'source_id': sid, 'url': f['link'], 'duration': v.get('duration'),
                    'title': (v.get('url') or '').rstrip('/').split('/')[-1], 'creator': (v.get('user') or {}).get('name'),
                    'license': 'Pexels License', 'license_url': 'https://www.pexels.com/license/',
                    'source_page': v.get('url'), 'needs_credit': False, 'attribution': None})
    return out


def search_commons(query, seen):
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrnamespace': 6,
              'gsrsearch': query if 'filetype:' in query else query + ' filetype:video', 'gsrlimit': 40, 'prop': 'imageinfo',
              'iiprop': 'url|extmetadata|size|mediatype'}
    try:
        r = requests.get(COMMONS, params=params, headers=UA, timeout=30)
        pages = r.json().get('query', {}).get('pages', {}).values()
    except Exception as e:
        log('commons error', query, e); return []
    out = []
    for pg in sorted(pages, key=lambda p: p.get('index', 99)):
        ii = (pg.get('imageinfo') or [{}])[0]; md = ii.get('extmetadata', {})
        sid = f"commons-{pg.get('pageid')}"
        lic = (md.get('LicenseShortName', {}).get('value') or '').lower()
        if sid in seen or 'nc' in lic.split() or '-nc' in lic or 'sa' in lic.replace('usa', ''):
            continue
        if 'cc0' in lic or 'public domain' in lic or lic.startswith('pd'):
            credit = False
        elif lic.startswith('cc by') or lic.startswith('cc-by'):
            credit = True
        else:
            continue
        dur = float(ii.get('duration') or 0)
        if dur and not (4 <= dur <= 180):
            continue
        if (ii.get('height') or 0) < 480:
            continue
        artist = re.sub(r'<[^>]+>', '', md.get('Artist', {}).get('value', '')).strip()[:100]
        out.append({'source_id': sid, 'url': ii.get('url'), 'duration': dur, 'title': pg.get('title'),
                    'creator': artist, 'license': lic, 'license_url': md.get('LicenseUrl', {}).get('value'),
                    'source_page': ii.get('descriptionurl'), 'needs_credit': credit,
                    'attribution': f"{pg.get('title', '').replace('File:', '')} by {artist} ({lic}), via Wikimedia Commons" if credit else None})
    log('commons', query, 'usable results', len(out))
    return out


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height:format=duration', '-of', 'json', path],
                       capture_output=True, text=True)
    d = json.loads(r.stdout or '{}')
    s = (d.get('streams') or [{}])[0]
    return s.get('width') or 0, s.get('height') or 0, float((d.get('format') or {}).get('duration') or 0)


def normalise(src, dst, jpg):
    w, h, dur = probe(src)
    if not w or dur < 3:
        return False
    length = min(dur, 25.0)
    if h >= w * 1.5:   # already vertical
        vf = 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920'
    else:              # landscape/square → blurred fill + centred
        # foreground 1150 px tall, centre-cropped to the full width, over a blurred fill:
        # the animal stays large on a phone instead of a thin strip
        vf = ('split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,'
              'boxblur=30:2,eq=brightness=-0.10[bg];[b]scale=-2:1150,crop=min(iw\\,1080):1150[fg];'
              '[bg][fg]overlay=(W-w)/2:(H-h)/2')
    r = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', src, '-t', f'{length:.2f}', '-an',
                        '-filter_complex', vf + ',fps=30,format=yuv420p', '-c:v', 'libx264', '-preset', 'veryfast',
                        '-crf', '25', '-movflags', '+faststart', dst], capture_output=True, text=True)
    if r.returncode != 0:
        log('ffmpeg error', r.stderr[-300:]); return False
    # preview strip: 3 frames side by side (start / middle / end)
    ts = [0.5, length / 2, max(0.5, length - 1)]
    frames = []
    for i, t in enumerate(ts):
        fp = f'{dst}.{i}.jpg'
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.2f}', '-i', dst, '-frames:v', '1',
                        '-vf', 'scale=360:640', fp], capture_output=True)
        if os.path.exists(fp):
            frames.append(fp)
    if frames:
        args = ['ffmpeg', '-y', '-v', 'error']
        for fp in frames:
            args += ['-i', fp]
        args += ['-filter_complex', f'hstack=inputs={len(frames)}' if len(frames) > 1 else 'null', jpg]
        subprocess.run(args, capture_output=True)
        for fp in frames:
            os.remove(fp)
    return True


def ensure_voice():
    """Cache a Turkish Piper voice in <STORE>/tts/ (looked up via the Hugging Face tree API)."""
    d = os.path.join(STORE, 'tts'); os.makedirs(d, exist_ok=True)
    have = [f for f in os.listdir(d) if f.endswith('.onnx') and os.path.getsize(os.path.join(d, f)) > 1_000_000]
    if have and os.path.exists(os.path.join(d, have[0] + '.json')):
        return
    files = []
    try:
        r = requests.get('https://huggingface.co/api/models/rhasspy/piper-voices/tree/main/tr/tr_TR',
                         params={'recursive': 'true'}, headers=UA, timeout=30)
        files = [x['path'] for x in r.json() if x.get('type') == 'file']
        log('hf tree', r.status_code, files)
    except Exception as e:
        log('hf tree error', e)
    onnx = [f for f in files if f.endswith('.onnx')]
    pref = ['fahrettin-medium', 'fettah-medium', 'dfki-medium']
    onnx.sort(key=lambda f: next((i for i, k in enumerate(pref) if k in f), 9))
    for path in onnx[:3]:
        name = os.path.basename(path)
        ok = all(get_stream(f'https://huggingface.co/rhasspy/piper-voices/resolve/main/{pp}', os.path.join(d, os.path.basename(pp)), limit_mb=200)
                 for pp in (path, path + '.json'))
        log('voice', name, 'ok' if ok else 'FAILED')
        if ok:
            open(os.path.join(d, 'VOICE.txt'), 'w').write(name)
            return


def main():
    os.makedirs(STORE, exist_ok=True)
    seen_p = os.path.join(STORE, 'seen.json')
    seen = set(load_json(seen_p, []))
    ensure_voice()
    # prune request folders older than 5 days (ids start with YYYYMMDD)
    cutoff = (datetime.date.today() - datetime.timedelta(days=5)).strftime('%Y%m%d')
    for name in os.listdir(STORE):
        if re.match(r'^\d{8}', name) and name[:8] < cutoff:
            shutil.rmtree(os.path.join(STORE, name), ignore_errors=True)
    for fn in sorted(os.listdir(REQ_DIR)) if os.path.isdir(REQ_DIR) else []:
        if not fn.endswith('.json'):
            continue
        req = load_json(os.path.join(REQ_DIR, fn), {})
        rid = req.get('id') or fn[:-5]
        if not re.match(r'^\d{8}', rid) or rid[:8] < cutoff:
            continue
        out_dir = os.path.join(STORE, rid)
        if os.path.exists(os.path.join(out_dir, 'manifest.json')):
            continue
        os.makedirs(out_dir, exist_ok=True)
        LOG.clear(); manifest = []
        log('pexels key present:', bool(PEXELS_KEY))
        for item in req.get('items', []):
            key = re.sub(r'[^a-z0-9_-]', '', item.get('key', 'clip').lower()) or 'clip'
            n = int(item.get('n', 3))
            cands = search_pexels(item['query'], seen) + search_commons(item.get('commons_query') or item['query'], seen)
            got = 0
            for c in cands:
                if got >= n:
                    break
                tmp = os.path.join(out_dir, '_src')
                url = c['url'].split('?utm_')[0]
                if c['source_id'].startswith('commons-'):
                    time.sleep(3)
                if not get_stream(url, tmp):
                    log('download failed', url[:120]); continue
                name = f'{key}_{got}'
                ok = normalise(tmp, os.path.join(out_dir, name + '.mp4'), os.path.join(out_dir, name + '.jpg'))
                if os.path.exists(tmp):
                    os.remove(tmp)
                if not ok:
                    continue
                _, _, dur = probe(os.path.join(out_dir, name + '.mp4'))
                manifest.append({**c, 'file': name + '.mp4', 'preview': name + '.jpg', 'key': key,
                                 'query': item['query'], 'clip_duration': round(dur, 2)})
                seen.add(c['source_id']); got += 1
                log('saved', name, c['source_id'], c['license'])
            log(f'item {key}: {got}/{n}')
        with open(os.path.join(out_dir, 'manifest.json'), 'w', encoding='utf-8') as f:
            json.dump(manifest, f, ensure_ascii=False, indent=1)
        with open(os.path.join(out_dir, 'log.txt'), 'w', encoding='utf-8') as f:
            f.write('\n'.join(LOG))
    with open(seen_p, 'w', encoding='utf-8') as f:
        json.dump(sorted(seen), f)
    with open(os.path.join(STORE, '_last_run_log.txt'), 'w', encoding='utf-8') as f:
        f.write(datetime.datetime.utcnow().isoformat() + 'Z\n' + '\n'.join(RUNLOG))


if __name__ == '__main__':
    main()
