#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Universe Of Animals: publish the Instagram Reel, carousel post and stories that Claude's
daily task puts into every "animals-*" GitHub Release (INSTAGRAM_PLAN.json), straight from
GitHub Actions with the official Instagram API (Instagram Login, graph.instagram.com).
No computer, Buffer or Antigravity needed.

Runs a few times a day (workflow instagram-publish.yml). Each run:
  1. lists animals-* releases (newest 20) and reads their INSTAGRAM_PLAN.json,
  2. gives every release its own posting day (plan date, pushed forward if the previous
     release already took that day -> at most 1 reel + 1 post + 3 stories per day),
  3. publishes every item whose time has come and that is not in the state file yet,
     with safety limits: max 1 reel and 1 post per run, at least 20 h between two reels /
     two posts, stories more than 6 h late are skipped (they would be stale),
  4. records results in instagram/state.json on the branch "instagram-state".

Images must be reachable from a public URL for Instagram, so they are put for a moment in
the PUBLIC repo $IG_MEDIA_REPO (via $IG_MEDIA_PAT) and deleted right after publishing.
Videos are sent directly with Instagram's resumable upload (no public copy needed).

Env: IG_ACCESS_TOKEN (required), IG_MEDIA_PAT + IG_MEDIA_REPO (owner/name, for images),
     GH_TOKEN (GITHUB_TOKEN), GITHUB_REPOSITORY, DRY_RUN=1 (print only), FORCE_TAG (optional:
     only this release), REFRESH_TOKEN=1 (refresh the 60-day token and update the secret).
"""
from __future__ import annotations

import base64, datetime as dt, json, os, sys, time, uuid
from zoneinfo import ZoneInfo

import requests

IST = ZoneInfo('Europe/Istanbul')
GRAPH = 'https://graph.instagram.com/v21.0'
REPO = os.environ.get('GITHUB_REPOSITORY', 'scorsty-cmd/promtAPilot')
GH = os.environ.get('GH_TOKEN', '')
IG_TOKEN = os.environ.get('IG_ACCESS_TOKEN', '').strip()
MEDIA_PAT = os.environ.get('IG_MEDIA_PAT', '').strip()
MEDIA_REPO = os.environ.get('IG_MEDIA_REPO', '').strip()
DRY = os.environ.get('DRY_RUN') == '1'
FORCE_TAG = os.environ.get('FORCE_TAG', '').strip()
STATE_BRANCH, STATE_PATH = 'instagram-state', 'instagram/state.json'
FORBIDDEN_USERNAMES = {'hiddenlayerdecoded'}           # never post animal content there
STORY_MAX_LATE_H, MIN_GAP_H = 6, 20
SUMMARY = []


def log(*a):
    s = ' '.join(str(x) for x in a)
    print(s, flush=True)
    SUMMARY.append(s)


def gh(method, path, token=None, **kw):
    h = {'Authorization': f'Bearer {token or GH}', 'Accept': 'application/vnd.github+json'}
    h.update(kw.pop('headers', {}))
    r = requests.request(method, f'https://api.github.com{path}', headers=h, timeout=120, **kw)
    return r


# ---------------------------------------------------------------- state
def load_state():
    r = gh('GET', f'/repos/{REPO}/contents/{STATE_PATH}?ref={STATE_BRANCH}')
    if r.status_code == 200:
        j = r.json()
        return json.loads(base64.b64decode(j['content']).decode()), j['sha']
    return {'posted': {}, 'last': {}}, None


def save_state(state, sha):
    if DRY:
        return
    if gh('GET', f'/repos/{REPO}/branches/{STATE_BRANCH}').status_code == 404:
        main_sha = gh('GET', f'/repos/{REPO}/git/ref/heads/main').json()['object']['sha']
        gh('POST', f'/repos/{REPO}/git/refs', json={'ref': f'refs/heads/{STATE_BRANCH}', 'sha': main_sha})
    body = {'message': 'Instagram state', 'branch': STATE_BRANCH,
            'content': base64.b64encode(json.dumps(state, ensure_ascii=False, indent=1).encode()).decode()}
    if sha:
        body['sha'] = sha
    r = gh('PUT', f'/repos/{REPO}/contents/{STATE_PATH}', json=body)
    if r.status_code not in (200, 201):
        log('UYARI: state kaydedilemedi', r.status_code, r.text[:200])


# ---------------------------------------------------------------- releases
def releases():
    r = gh('GET', f'/repos/{REPO}/releases?per_page=40')
    r.raise_for_status()
    rel = [x for x in r.json() if x['tag_name'].startswith('animals-') and not x['draft']]
    if FORCE_TAG:
        rel = [x for x in rel if x['tag_name'] == FORCE_TAG]
    return sorted(rel, key=lambda x: x['tag_name'])[-20:]


def asset_bytes(rel, name):
    a = next((a for a in rel['assets'] if a['name'] == name), None)
    if not a:
        raise FileNotFoundError(name)
    r = gh('GET', f"/repos/{REPO}/releases/assets/{a['id']}", headers={'Accept': 'application/octet-stream'})
    r.raise_for_status()
    return r.content


# ---------------------------------------------------------------- instagram
def ig(method, path, **params):
    params['access_token'] = IG_TOKEN
    url = path if path.startswith('http') else f'{GRAPH}/{path}'
    r = requests.request(method, url, params=params if method == 'GET' else None,
                         data=params if method != 'GET' else None, timeout=120)
    j = r.json() if r.content else {}
    if r.status_code >= 400 or 'error' in j:
        raise RuntimeError(f"Instagram API {path}: {j.get('error', j)}")
    return j


def wait_ready(cid, timeout=600):
    t0 = time.time()
    while time.time() - t0 < timeout:
        st = ig('GET', cid, fields='status_code,status').get('status_code')
        if st == 'FINISHED':
            return
        if st in ('ERROR', 'EXPIRED'):
            raise RuntimeError(f'container {cid} {st}: ' + json.dumps(ig("GET", cid, fields="status")))
        time.sleep(8)
    raise TimeoutError(f'container {cid} not ready')


def publish(user_id, cid):
    wait_ready(cid)
    mid = ig('POST', f'{user_id}/media_publish', creation_id=cid)['id']
    link = ig('GET', mid, fields='permalink').get('permalink', '')
    return mid, link


def public_url(data, name):
    """Put an image into the public media repo for a moment; returns (url, delete_fn)."""
    if not (MEDIA_PAT and MEDIA_REPO):
        raise RuntimeError('IG_MEDIA_PAT / IG_MEDIA_REPO tanımlı değil: görseller için gerekli')
    path = f'tmp/{uuid.uuid4().hex[:10]}_{name}'
    r = gh('PUT', f'/repos/{MEDIA_REPO}/contents/{path}', token=MEDIA_PAT,
           json={'message': 'temp media', 'content': base64.b64encode(data).decode()})
    if r.status_code not in (200, 201):
        raise RuntimeError(f'medya deposuna yüklenemedi: {r.status_code} {r.text[:200]}')
    sha = r.json()['content']['sha']
    url = f'https://raw.githubusercontent.com/{MEDIA_REPO}/main/{path}'
    for _ in range(12):                                   # wait until the CDN serves it
        if requests.head(url, timeout=30).status_code == 200:
            break
        time.sleep(5)

    def delete():
        gh('DELETE', f'/repos/{MEDIA_REPO}/contents/{path}', token=MEDIA_PAT,
           json={'message': 'remove temp media', 'sha': sha})
    return url, delete


def post_reel(user_id, data, caption):
    c = ig('POST', f'{user_id}/media', media_type='REELS', upload_type='resumable',
           caption=caption, share_to_feed='true')
    up = requests.post(c['uri'], data=data, timeout=600, headers={
        'Authorization': f'OAuth {IG_TOKEN}', 'offset': '0', 'file_size': str(len(data))})
    if up.status_code >= 400:
        raise RuntimeError(f'video yüklenemedi: {up.status_code} {up.text[:200]}')
    return publish(user_id, c['id'])


def post_images(user_id, kind, images, caption=None):
    cleanups = []
    try:
        if kind == 'story':
            url, d = public_url(images[0][1], images[0][0]); cleanups.append(d)
            cid = ig('POST', f'{user_id}/media', media_type='STORIES', image_url=url)['id']
            return publish(user_id, cid)
        children = []
        for name, data in images[:10]:
            url, d = public_url(data, name); cleanups.append(d)
            children.append(ig('POST', f'{user_id}/media', image_url=url, is_carousel_item='true')['id'])
        for ch in children:
            wait_ready(ch)
        if len(children) == 1:
            raise RuntimeError('carousel için en az 2 görsel gerekli')
        cid = ig('POST', f'{user_id}/media', media_type='CAROUSEL', children=','.join(children),
                 caption=caption or '')['id']
        return publish(user_id, cid)
    finally:
        for d in cleanups:
            try:
                d()
            except Exception as e:
                log('UYARI: geçici görsel silinemedi', e)


# ---------------------------------------------------------------- planning
def build_schedule(rels):
    """[(due_datetime, tag, idx, item, rel)] with one posting day per release."""
    out, last_day = [], None
    for rel in rels:
        try:
            plan = json.loads(asset_bytes(rel, 'INSTAGRAM_PLAN.json'))
        except Exception as e:
            log(f'{rel["tag_name"]}: INSTAGRAM_PLAN.json okunamadı ({e}), atlandı')
            continue
        day = dt.date.fromisoformat(plan.get('date') or rel['tag_name'][8:18])
        if last_day and day <= last_day:
            day = last_day + dt.timedelta(days=1)
        last_day = day
        for i, it in enumerate(plan.get('items', [])):
            hh, mm = (it.get('time') or '20:00').split(':')
            due = dt.datetime.combine(day, dt.time(int(hh), int(mm)), IST)
            out.append((due, rel['tag_name'], i, it, rel))
    return sorted(out, key=lambda x: x[0])


def refresh_token():
    j = requests.get('https://graph.instagram.com/refresh_access_token',
                     params={'grant_type': 'ig_refresh_token', 'access_token': IG_TOKEN}, timeout=60).json()
    if 'access_token' not in j:
        log('UYARI: token yenilenemedi', j)
        return
    days = int(j.get('expires_in', 0)) // 86400
    log(f'Token yenilendi, {days} gün geçerli.')
    if j['access_token'] != IG_TOKEN and MEDIA_PAT and not DRY:
        import subprocess
        r = subprocess.run(['gh', 'secret', 'set', 'IG_ACCESS_TOKEN', '-R', REPO, '--body', j['access_token']],
                           env={**os.environ, 'GH_TOKEN': MEDIA_PAT}, capture_output=True, text=True)
        log('Secret güncellendi.' if r.returncode == 0 else f'UYARI: secret güncellenemedi: {r.stderr[:200]}')


def main():
    if not IG_TOKEN:
        print('IG_ACCESS_TOKEN secret henüz tanımlı değil; kurulum bitince paylaşımlar başlar.')
        return
    me = ig('GET', 'me', fields='user_id,username,account_type')
    user_id, username = me.get('user_id') or me.get('id'), me.get('username', '')
    log(f'Bağlı Instagram hesabı: @{username} ({me.get("account_type")})')
    if username.lower() in FORBIDDEN_USERNAMES:
        sys.exit(f'KRİTİK GÜVENLİK ENGELİ: token @{username} hesabına ait; hayvan içerikleri oraya paylaşılmaz.')
    if os.environ.get('REFRESH_TOKEN') == '1':
        refresh_token()

    state, sha = load_state()
    now = dt.datetime.now(IST)
    done_kind = set()
    sched = build_schedule(releases())
    # stories in time order; reels/posts newest first, so a backlog never makes the page lag
    # behind (older unposted reels/posts stay as a reserve for days without new content)
    order = [x for x in sched if x[3].get('type') == 'story'] + \
            sorted([x for x in sched if x[3].get('type') != 'story'], key=lambda x: x[0], reverse=True)
    for due, tag, i, it, rel in order:
        key = f'{tag}#{i}'
        kind = it.get('type')
        if key in state['posted'] or due > now:
            continue
        late_h = (now - due).total_seconds() / 3600
        if kind == 'story' and late_h > STORY_MAX_LATE_H:
            state['posted'][key] = {'status': 'skipped-stale', 'at': now.isoformat()}
            log(f'{key} hikâye {late_h:.0f} saat gecikmiş, atlandı.')
            continue
        if kind in ('reel', 'post'):
            if kind in done_kind:
                continue
            last = state['last'].get(kind)
            if last and (now - dt.datetime.fromisoformat(last)).total_seconds() < MIN_GAP_H * 3600:
                continue
        try:
            if DRY:
                log(f'[DRY] {key} {kind} (planlanan {due:%d.%m %H:%M})')
                if kind in ('reel', 'post'):
                    done_kind.add(kind)
                continue
            if kind == 'reel':
                mid, link = post_reel(user_id, asset_bytes(rel, it['file']), it.get('caption', ''))
            elif kind == 'post':
                imgs = [(n, asset_bytes(rel, n)) for n in it['files']]
                mid, link = post_images(user_id, 'post', imgs, it.get('caption', ''))
            elif kind == 'story':
                mid, link = post_images(user_id, 'story', [(it['file'], asset_bytes(rel, it['file']))])
            else:
                continue
            state['posted'][key] = {'status': 'ok', 'id': mid, 'link': link, 'at': now.isoformat()}
            if kind in ('reel', 'post'):
                state['last'][kind] = now.isoformat(); done_kind.add(kind)
            log(f'✅ {key} {kind} paylaşıldı: {link}')
            if it.get('note') and kind == 'story':
                log(f'   not: {it["note"]}')
        except Exception as e:
            log(f'❌ {key} {kind} paylaşılamadı: {e}')
            fails = state.setdefault('fails', {})
            fails[key] = fails.get(key, 0) + 1
            if fails[key] >= 3:
                state['posted'][key] = {'status': 'failed', 'error': str(e)[:300], 'at': now.isoformat()}
        save_state(state, sha)
        state, sha = load_state() if not DRY else (state, sha)
    save_state(state, sha)
    if not any(s.startswith(('✅', '❌', '[DRY]')) for s in SUMMARY):
        log('Şu an paylaşım zamanı gelmiş yeni içerik yok.')
    path = os.environ.get('GITHUB_STEP_SUMMARY')
    if path:
        open(path, 'a', encoding='utf-8').write('### Instagram paylaşımları\n\n' + '\n'.join(f'- {s}' for s in SUMMARY) + '\n')


if __name__ == '__main__':
    main()
