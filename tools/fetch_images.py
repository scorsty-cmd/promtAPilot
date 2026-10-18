"""Fetch open-licence photos for Hidden Layer Reels.

Reads every image-requests/<id>.json that has no assets/<id>/manifest.json yet:
    {"id": "20261018-1649", "items": [
        {"key": "router", "query": "wifi router", "n": 3, "orientation": "tall"}]}
For each item it searches Openverse for CC0 / Public Domain Mark images first
(no attribution needed), then CC BY as a fallback (attribution recorded), downloads
up to n usable images (short side >= 700 px), resizes them to max 1800 px and writes
assets/<id>/<key>_<k>.jpg plus manifest.json (title, creator, licence, source page).
"""
import io, json, os, sys, time
import requests
from PIL import Image

API = 'https://api.openverse.org/v1/images/'
UA = {'User-Agent': 'HiddenLayerReels/1.0 (github.com/scorsty-cmd/promtapilot)'}
REQ_DIR, OUT_DIR = 'image-requests', 'assets'


def search(query, licences, orientation=None):
    params = {'q': query, 'license': licences, 'page_size': 30, 'mature': 'false'}
    if orientation in ('tall', 'wide', 'square'):
        params['aspect_ratio'] = orientation
    for attempt in range(3):
        try:
            r = requests.get(API, params=params, headers=UA, timeout=30)
            if r.status_code == 200:
                return r.json().get('results', [])
            print('search', query, r.status_code, r.text[:200])
        except Exception as e:  # network hiccup
            print('search error', e)
        time.sleep(3 * (attempt + 1))
    return []


def download(res):
    for url in (res.get('url'), res.get('thumbnail')):
        if not url:
            continue
        try:
            r = requests.get(url, headers=UA, timeout=40)
            if r.status_code != 200 or len(r.content) < 20000:
                continue
            im = Image.open(io.BytesIO(r.content)).convert('RGB')
            if min(im.size) < 700:
                continue
            s = 1800 / max(im.size)
            if s < 1:
                im = im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)
            return im
        except Exception as e:
            print('download error', url, e)
    return None


def handle(req):
    rid = req['id']
    out = os.path.join(OUT_DIR, rid)
    os.makedirs(out, exist_ok=True)
    manifest = {'id': rid, 'images': [], 'missing': []}
    for item in req.get('items', [])[:8]:
        key, n = item['key'], max(1, min(int(item.get('n', 2)), 5))
        got = 0
        for licences, needs_credit in (('cc0,pdm', False), ('by', True)):
            if got >= n:
                break
            for res in search(item['query'], licences, item.get('orientation')):
                if got >= n:
                    break
                im = download(res)
                if im is None:
                    continue
                name = f'{key}_{got}.jpg'
                im.save(os.path.join(out, name), quality=88)
                manifest['images'].append({
                    'file': name, 'key': key, 'query': item['query'],
                    'width': im.width, 'height': im.height,
                    'title': res.get('title'), 'creator': res.get('creator'),
                    'license': res.get('license'), 'license_version': res.get('license_version'),
                    'license_url': res.get('license_url'), 'source_page': res.get('foreign_landing_url'),
                    'attribution_required': needs_credit,
                    'attribution': res.get('attribution')})
                got += 1
                print('saved', rid, name, res.get('license'))
        if got < n:
            manifest['missing'].append({'key': key, 'query': item['query'], 'found': got})
    with open(os.path.join(out, 'manifest.json'), 'w') as f:
        json.dump(manifest, f, indent=1)


def main():
    if not os.path.isdir(REQ_DIR):
        return
    for fn in sorted(os.listdir(REQ_DIR)):
        if not fn.endswith('.json'):
            continue
        try:
            req = json.load(open(os.path.join(REQ_DIR, fn)))
        except Exception as e:
            print('bad request', fn, e)
            continue
        req.setdefault('id', fn[:-5])
        if os.path.exists(os.path.join(OUT_DIR, req['id'], 'manifest.json')):
            continue
        handle(req)


if __name__ == '__main__':
    sys.exit(main())
