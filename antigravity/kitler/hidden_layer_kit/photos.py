"""Get real, open-licence photos (CC0 / Public Domain first, CC BY fallback) for a Reel.

The render workspace can only reach GitHub, so the photos are fetched by a GitHub Actions
workflow in the owner's repo (scorsty-cmd/promtapilot, .github/workflows/fetch-images.yml):
this script commits image-requests/<id>.json, pushes, waits for the workflow to commit
assets/<id>/ and downloads the images into ./photos/ (plus photos/manifest.json).

Usage (from the kit folder, after cloning the repo):
    python3 photos.py <repo_dir> <request_id> key1="search words" key2="search words" ...
e.g. python3 photos.py /home/claude/promtapilot 20261018-1649 router="wifi router" city="city at night"
Queries: concrete objects/places that show the topic (server room, phone in hand, parking meter,
receipt, city at night). The renderer refers to an image by its key (photo='router' uses router_0.jpg,
'router_1' the second one). Always LOOK at every downloaded image: reject any with a readable brand
logo, app icon/UI, watermark, embedded text, or an identifiable person's face as the subject.
Images whose manifest entry has attribution_required=true need their credit line in the caption.
"""
import json, os, subprocess, sys, time, urllib.request

RAW = 'https://raw.githubusercontent.com/scorsty-cmd/promtapilot/main/assets/{id}/{f}'


def git(repo, *a):
    return subprocess.run(['git', '-C', repo, *a], check=True, capture_output=True, text=True).stdout


def fetch(url):
    try:
        with urllib.request.urlopen(url + '?t=' + str(int(time.time())), timeout=30) as r:
            return r.read()
    except Exception:
        return None


def main():
    if len(sys.argv) < 4:
        print(__doc__); sys.exit(1)
    repo, rid = sys.argv[1], sys.argv[2]
    items = []
    for kv in sys.argv[3:]:
        k, q = kv.split('=', 1)
        items.append({'key': k.strip(), 'query': q.strip().strip('"'), 'n': 2, 'orientation': 'tall'})
    os.makedirs(os.path.join(repo, 'image-requests'), exist_ok=True)
    path = os.path.join(repo, 'image-requests', rid + '.json')
    json.dump({'id': rid, 'items': items}, open(path, 'w'), indent=1)
    git(repo, 'pull', '--rebase', '-q', 'origin', 'main')
    git(repo, 'add', path)
    git(repo, 'commit', '-qm', f'Request images {rid}')
    git(repo, 'push', '-q', 'origin', 'HEAD:main')
    print('request pushed, waiting for the workflow...', flush=True)
    man = None
    for _ in range(54):              # up to ~9 minutes
        data = fetch(RAW.format(id=rid, f='manifest.json'))
        if data:
            man = json.loads(data); break
        time.sleep(10)
    if not man:
        print('NO PHOTOS: workflow did not deliver in time; render without photos'); sys.exit(2)
    os.makedirs('photos', exist_ok=True)
    ok = []
    for im in man['images']:
        data = fetch(RAW.format(id=rid, f=im['file']))
        if data:
            open(os.path.join('photos', im['file']), 'wb').write(data); ok.append(im)
    man['images'] = ok
    json.dump(man, open('photos/manifest.json', 'w'), indent=1)
    for im in ok:
        print(im['file'], im['width'], 'x', im['height'], im['license'],
              'CREDIT NEEDED: ' + (im.get('attribution') or '') if im['attribution_required'] else '')
    if man.get('missing'):
        print('missing:', man['missing'])


if __name__ == '__main__':
    main()
