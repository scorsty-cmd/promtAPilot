#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Universe Of Animals "comic edit" renderer: inner-voice stickers, freeze-frame punch,
punch-in zooms, slow-motion replays, shake, synthesised sound effects, the channel owner's
own voice and multi-clip compilations (up to ~60 s). 1080x1920, 30 fps. No AI voice.

    python animals/render_edit.py spec.json out_dir

spec.json
{
  "slug": "kedi-derleme-fizik",
  "title": "Kediler fizik kurallarını tanımıyor",      # big sticker at the top for the first ~3 s
  "music": "bouncy" | "calm" | "none", "music_vol": 0.22,
  "intro_voice": {"file": "animals/voice/kullanici_ses_01.aac", "from": 1.0, "to": 2.4,
                  "caption": "..."},                     # optional: owner's line over the opening
  "segments": [
    {"path": "/abs/clip.mp4", "start": 3.0, "end": 9.5,
     "crop_x": 0.5,               # 0..1 horizontal framing of the 9:16 crop (0.5 = centre)
     "zoom_base": 1.0,            # extra constant zoom (1.0–1.6) when the animal is small
     "cy": 0.5,                   # vertical centre for zoom_base (0..1)
     "eq": {"brightness": 0.0, "contrast": 1.0, "saturation": 1.1},
     "clip_audio": 0.0,           # keep the clip's own sound (0..1); 0 = muted
     "number": 1,                 # optional paw counter (lists / compilations)
     "events": [                  # t = seconds from the segment's start (source time)
       {"t": 0.2, "type": "sticker", "text": "Balıklar: 'Burası güvenli.'", "dur": 2.4, "style": "cream", "y": 1300},
       {"t": 1.2, "type": "inner", "text": "Bir gün... bir gün.", "dur": 2.5},
       {"t": 2.0, "type": "zoom", "dur": 1.0, "scale": 1.35, "cx": 0.5, "cy": 0.45},
       {"t": 3.1, "type": "freeze", "dur": 0.6, "sfx": "scratch", "text": "...", "style": "tangerine"},
       {"t": 3.3, "type": "shake", "dur": 0.35},
       {"t": 3.3, "type": "sfx", "name": "boing"},
       {"t": 4.5, "type": "replay", "from": 2.6, "to": 3.6, "speed": 0.4, "label": "BİR DAHA İZLEYELİM",
        "scale": 1.25, "cx": 0.5, "cy": 0.5},
       {"t": 0.5, "type": "voice", "file": "animals/voice/kullanici_ses_01.aac", "from": 3.2, "to": 5.0,
        "caption": "..."}          # owner's own recorded voice line (+ optional caption sticker);
                                   # also used for a neural-voice line: "file": "<assets>/<id>/tts_l1.mp3" (no from/to)
     ]}
  ],
  "end_card": {"title": "ABONE OL", "sub": "Her gün yeni komik hayvan videosu", "promo": "..."}
}
sfx names: pop, boing, scratch, bonk, ding, slide_up, slide_down, dun, shutter, whoosh, drumroll, rewind, tick
Outputs: <slug>_shorts.mp4, thumb.jpg, contact.jpg, timeline.json
Style: anthropic universe-of-animals-style (cream/tangerine stickers, cocoa outline, Bricolage Grotesque).
"""
import json, math, os, re, shutil, subprocess, sys, tempfile
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from render_short import music as make_music  # noqa: E402  (original synthesised music)

W, H, FPS, SR = 1080, 1920, 30, 48000
FONT = os.path.join(HERE, 'fonts', 'BricolageGrotesque.ttf')
CREAM, COCOA, TANG, SKY = (255, 244, 226, 255), (42, 26, 18, 255), (255, 106, 43, 255), (124, 200, 255, 255)
WHITE = (255, 255, 255, 255)
END_CARD = 3.0
SAFE_X0, SAFE_X1 = 70, 960
REPO = os.path.dirname(HERE)
VIDEO_Y = 330            # top of the video window (meme-frame layout: title above, video below)
BG = (42, 26, 18)


def detect_band(path):
    """Fetched clips are 1080x1920 with blurred fill above/below the real picture: find the sharp rows."""
    dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path]).strip())
    lo, hi = [], []
    for k in range(3):
        fp = tempfile.mktemp(suffix='.png')
        run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{dur * (k + 1) / 4:.2f}', '-i', path, '-frames:v', '1',
             '-vf', 'scale=270:480,format=gray', fp])
        a = np.asarray(Image.open(fp), float); os.remove(fp)
        e = np.abs(np.diff(a, axis=1)).mean(1)
        rows = np.where(e > e.max() * 0.35)[0]
        if len(rows):
            lo.append(rows.min() * 4); hi.append(rows.max() * 4 + 4)
    if not lo:
        return 0, H
    y0, y1 = int(np.median(lo)), int(np.median(hi))
    if y1 - y0 > H * 0.85:
        return 0, H
    return y0, y1


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(' '.join(map(str, cmd[:8])) + '...\n' + r.stderr[-1500:])
    return r.stdout


def has_audio(p):
    return bool(run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index',
                     '-of', 'csv=p=0', p]).strip())


def clean_text(s):
    # stickers use one font; drop emoji / symbols it cannot draw
    return re.sub(r'[\U00010000-\U0010FFFF☀-➿️]', '', s).strip()


# ------------------------------------------------------------------ fonts / stickers
_fc = {}


def font(size, weight=800, width=88):
    k = (size, weight, width)
    if k not in _fc:
        f = ImageFont.truetype(FONT, size)
        try:
            f.set_variation_by_axes([min(96, max(12, size)), weight, width])
        except Exception:
            pass
        _fc[k] = f
    return _fc[k]


def wrap(d, text, f, maxw):
    out, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw or not cur:
            cur = t
        else:
            out.append(cur); cur = w
    if cur:
        out.append(cur)
    return out


def sticker(text, style='cream', size=78, maxw=None, rot=0.0):
    """Rounded sticker, 8px cocoa outline, solid offset shadow, slight rotation. Returns RGBA."""
    text = clean_text(text)
    maxw = maxw or (SAFE_X1 - SAFE_X0 - 90)
    dummy = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    while True:
        f = font(size)
        lines = wrap(dummy, text, f, maxw)
        if len(lines) <= 3 or size <= 46:
            break
        size -= 4
    if len(lines) > 1:  # balance line lengths (no lonely last word)
        lo_w, hi_w = 200, maxw
        while hi_w - lo_w > 8:
            mid = (lo_w + hi_w) / 2
            if len(wrap(dummy, text, f, mid)) <= len(lines):
                hi_w = mid
            else:
                lo_w = mid
        lines = wrap(dummy, text, f, hi_w)
    lh = int(size * 1.12)
    tw = max(dummy.textlength(l, font=f) for l in lines)
    pad_x, pad_y, ol, sh = 42, 26, 8, 10
    bw, bh = int(tw + 2 * pad_x), int(lh * len(lines) + 2 * pad_y + size * 0.12)
    img = Image.new('RGBA', (bw + sh + ol * 2 + 4, bh + sh + ol * 2 + 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    fill = TANG if style == 'tangerine' else (COCOA if style == 'dark' else CREAM)
    ink = CREAM if style in ('tangerine', 'dark') else COCOA
    x0, y0 = ol, ol
    d.rounded_rectangle([x0 + sh, y0 + sh, x0 + sh + bw, y0 + sh + bh], radius=36, fill=COCOA)
    d.rounded_rectangle([x0, y0, x0 + bw, y0 + bh], radius=36, fill=fill, outline=COCOA, width=ol)
    for i, l in enumerate(lines):
        lw = d.textlength(l, font=f)
        d.text((x0 + (bw - lw) / 2, y0 + pad_y + i * lh), l, font=f, fill=ink)
    if rot:
        img = img.rotate(rot, resample=Image.BICUBIC, expand=True)
    return img


def inner_pill(text, maxw=880):
    """Top-left dark cocoa pill 'iç ses: ...' with a sky dot."""
    text = clean_text(text)
    dummy = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    fl, ft = font(42, 700), font(64, 800)
    lines = wrap(dummy, text, ft, maxw - 90)
    if len(lines) > 3:
        ft = font(54, 800); lines = wrap(dummy, text, ft, maxw - 90)
    lh = int(ft.size * 1.14)
    tw = max([dummy.textlength(l, font=ft) for l in lines] + [dummy.textlength('iç ses', font=fl) + 40])
    bw, bh = int(tw + 76), int(58 + lh * len(lines) + 36)
    img = Image.new('RGBA', (bw + 8, bh + 8), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, bw, bh], radius=34, fill=(42, 26, 18, 235))
    d.text((38, 18), 'iç ses', font=fl, fill=SKY)
    lw = d.textlength('iç ses', font=fl)
    d.ellipse([38 + lw + 12, 36, 38 + lw + 30, 54], fill=SKY)
    for i, l in enumerate(lines):
        d.text((38, 70 + i * lh), l, font=ft, fill=CREAM)
    return img


def counter_png(n):
    img = Image.new('RGBA', (130, 130), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    d.ellipse([10, 10, 124, 124], fill=COCOA)
    d.ellipse([2, 2, 116, 116], fill=TANG, outline=COCOA, width=7)
    f = font(66); s = str(n); tw = d.textlength(s, font=f)
    d.text((59 - tw / 2, 14), s, font=f, fill=CREAM)
    return img


# ------------------------------------------------------------------ sound effects (synthesised, original)
def _t(d):
    return np.arange(int(d * SR)) / SR


def _norm(a, amp):
    return (a / (np.max(np.abs(a)) + 1e-9) * amp).astype(np.float32)


def _noise(n, seed=1):
    return np.random.default_rng(seed).normal(0, 1, n).astype(np.float32)


def _lp(x, k):
    return np.convolve(x, np.ones(k) / k, mode='same')


def sfx(name, amp=0.35):
    if name == 'pop':
        t = _t(0.08); f = 900 * np.exp(-t * 30) + 300
        return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 60), amp * 0.8)
    if name == 'boing':
        t = _t(0.7); f = 180 + 260 * np.exp(-t * 4) * (1 + 0.35 * np.sin(2 * np.pi * 14 * t))
        return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.5) * np.minimum(1, t * 300), amp)
    if name == 'scratch':
        t = _t(0.42); n = _noise(len(t), 3)
        rate = np.abs(np.sin(2 * np.pi * 7 * t)) * 0.9 + 0.1
        idx = np.clip(np.cumsum(rate) * 3, 0, len(n) - 1).astype(int)
        s = _lp(n[idx], 6) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
        return _norm(s * np.exp(-t * 2.5), amp)
    if name == 'bonk':
        t = _t(0.35)
        s = np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t * 6) + 70) / SR) * np.exp(-t * 12)
        s[:300] += _noise(300, 5) * np.linspace(1, 0, 300)
        return _norm(s, amp)
    if name == 'ding':
        t = _t(1.2)
        s = sum(np.sin(2 * np.pi * 1320 * r * t) * np.exp(-t * dcy) / (k + 1)
                for k, (r, dcy) in enumerate([(1, 3), (2.76, 6), (5.4, 9)]))
        return _norm(s * np.minimum(1, t * 800), amp * 0.7)
    if name in ('slide_up', 'slide_down'):
        t = _t(0.55); a, b = (450, 1500) if name == 'slide_up' else (1500, 420)
        f = a * (b / a) ** (t / t[-1]) * (1 + 0.02 * np.sin(2 * np.pi * 6 * t))
        return _norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / t[-1]) ** 0.5, amp * 0.7)
    if name == 'dun':
        out = np.zeros(int(1.9 * SR), np.float32)
        for st, fr, d in ((0.0, 98, 0.32), (0.4, 92.5, 0.32), (0.8, 82.4, 1.05)):
            t = _t(d)
            tone = sum(np.sign(np.sin(2 * np.pi * fr * h * t)) / h ** 1.3 for h in (1, 2, 3))
            tone = _lp(tone, 18) * np.exp(-t * (1.2 if d > 1 else 5)) * np.minimum(1, t * 120)
            s = int(st * SR); out[s:s + len(t)] += tone[:len(out) - s]
        return _norm(out, amp)
    if name == 'shutter':
        out = np.zeros(int(0.18 * SR), np.float32)
        for st in (0.0, 0.07):
            n = int(0.025 * SR); s = int(st * SR)
            out[s:s + n] += _noise(n, int(st * 100) + 2) * np.exp(-np.arange(n) / (0.004 * SR))
        return _norm(out, amp * 0.8)
    if name == 'whoosh':
        n = int(0.45 * SR); nz = _lp(_noise(n, 7), 30)
        return _norm(nz * np.sin(np.linspace(0, np.pi, n)) ** 2, amp * 0.6)
    if name == 'drumroll':
        out = np.zeros(int(1.2 * SR), np.float32)
        for k in range(int(1.2 * 22)):
            n = int(0.03 * SR); s = int(k / 22 * SR)
            out[s:s + n] += _noise(n, k + 11) * np.exp(-np.arange(n) / (0.006 * SR)) * (0.4 + 0.6 * k / 26)
        return _norm(_lp(out, 4), amp * 0.8)
    if name == 'rewind':
        out = np.zeros(int(0.6 * SR), np.float32)
        for k in range(6):
            t = _t(0.09); s = int(k * 0.095 * SR)
            ch = np.sin(2 * np.pi * np.cumsum(2400 - 14000 * t) / SR) * np.exp(-t * 20)
            out[s:s + len(t)] += ch[:len(out) - s]
        return _norm(out, amp * 0.6)
    if name == 'tick':
        n = int(0.03 * SR)
        return _norm(_noise(n, 9) * np.exp(-np.arange(n) / (0.003 * SR)), amp * 0.5)
    raise ValueError('unknown sfx ' + name)


def add(buf, clip, at):
    s = int(round(at * SR))
    if s < 0:
        clip, s = clip[-s:], 0
    if s >= len(buf):
        return
    e = min(len(buf), s + len(clip))
    buf[s:e] += clip[:e - s]


def load_voice(path, a, b):
    """Owner's recorded line: cut, de-noise, even out, return mono float32 at SR."""
    p = path if os.path.isabs(path) else os.path.join(REPO, path)
    tmpw = tempfile.mktemp(suffix='.wav')
    cut = (['-ss', f'{a:.3f}'] if a else []) + (['-to', f'{b:.3f}'] if b else [])
    run(['ffmpeg', '-y', '-v', 'error'] + cut + ['-i', p, '-ac', '1', '-ar', str(SR),
         '-af', 'highpass=f=90,lowpass=f=9000,afftdn=nf=-28,acompressor=threshold=-22dB:ratio=3:attack=5:release=80,'
                'afade=t=in:d=0.03', tmpw])
    v, _ = sf.read(tmpw, dtype='float32'); os.remove(tmpw)
    if v.ndim > 1:
        v = v.mean(1)
    fade = min(len(v) // 4, int(0.06 * SR))
    if fade:
        v[-fade:] *= np.linspace(1, 0, fade)
    return _norm(v, 0.92)


# ------------------------------------------------------------------ segment planning
def plan_segment(seg):
    """Turn a segment's events into a list of output pieces + timed overlays/sfx (segment-local output time)."""
    a, b = float(seg.get('start', 0)), float(seg['end'])
    evs = sorted(seg.get('events', []), key=lambda e: e.get('t', 0))
    cuts = sorted({e['t'] for e in evs if e['type'] in ('freeze', 'replay') and 0 <= e['t'] <= b - a})
    pieces, out_t, src = [], 0.0, 0.0
    inserts = {}
    for e in evs:
        if e['type'] in ('freeze', 'replay'):
            inserts.setdefault(e['t'], []).append(e)
    for c in cuts + [b - a]:
        if c > src + 1e-3:
            pieces.append({'kind': 'play', 'src0': src, 'src1': c, 'speed': 1.0, 'out0': out_t})
            out_t += c - src; src = c
        for e in inserts.get(c, []):
            if e['type'] == 'freeze':
                d = float(e.get('dur', 0.5))
                pieces.append({'kind': 'freeze', 'src0': c, 'src1': c, 'out0': out_t, 'dur': d,
                               'zoom': float(e.get('zoom', 1.05)), 'ev': e})
                out_t += d
            else:
                sp = float(e.get('speed', 0.45)); f0, f1 = float(e['from']), float(e['to'])
                pieces.append({'kind': 'replay', 'src0': f0, 'src1': f1, 'speed': sp, 'out0': out_t, 'ev': e})
                out_t += (f1 - f0) / sp
    total = out_t

    def out_of(tsrc):  # source time of the first (main) pass -> output time
        for p in pieces:
            if p['kind'] == 'play' and p['src0'] - 1e-6 <= tsrc <= p['src1'] + 1e-6:
                return p['out0'] + (tsrc - p['src0'])
        return min(total, tsrc)

    overlays, sounds, zooms, shakes = [], [], [], []
    for p in pieces:
        e = p.get('ev') or {}
        if p['kind'] == 'freeze':
            sounds.append((p['out0'], {'type': 'sfx', 'name': e.get('sfx', 'scratch')}))
            if e.get('text'):
                overlays.append({'kind': 'sticker', 'text': e['text'], 'style': e.get('style', 'tangerine'),
                                 't0': p['out0'], 't1': p['out0'] + p['dur'] + float(e.get('hold', 1.0)),
                                 'y': e.get('y', 1330), 'rot': e.get('rot', 3), 'size': e.get('size', 84)})
        if p['kind'] == 'replay':
            d = (p['src1'] - p['src0']) / p['speed']
            sounds.append((p['out0'], {'type': 'sfx', 'name': 'rewind'}))
            overlays.append({'kind': 'sticker', 'text': e.get('label', 'BİR DAHA İZLEYELİM'), 'style': 'tangerine',
                             't0': p['out0'], 't1': p['out0'] + d, 'y': e.get('y', 470), 'rot': -3, 'size': 60})
            zooms.append({'t0': p['out0'], 't1': p['out0'] + d, 'scale': float(e.get('scale', 1.25)),
                          'cx': float(e.get('cx', 0.5)), 'cy': float(e.get('cy', 0.5)), 'ease': 0.4})
            if e.get('text'):
                overlays.append({'kind': 'sticker', 'text': e['text'], 'style': e.get('style', 'cream'),
                                 't0': p['out0'] + d * 0.35, 't1': p['out0'] + d, 'y': e.get('ty', 1330),
                                 'rot': 2, 'size': 78})
    for e in evs:
        t = out_of(e.get('t', 0))
        ty = e['type']
        if ty == 'sticker':
            overlays.append({'kind': 'sticker', 'text': e['text'], 'style': e.get('style', 'cream'), 't0': t,
                             't1': t + float(e.get('dur', 2.2)), 'y': e.get('y', 1300),
                             'rot': e.get('rot', -3 if len(overlays) % 2 else 3), 'size': e.get('size', 78)})
            if e.get('pop', True):
                sounds.append((t, {'type': 'sfx', 'name': 'pop'}))
        elif ty == 'inner':
            overlays.append({'kind': 'inner', 'text': e['text'], 't0': t, 't1': t + float(e.get('dur', 2.5))})
            sounds.append((t, {'type': 'sfx', 'name': 'tick'}))
        elif ty == 'zoom':
            zooms.append({'t0': t, 't1': t + float(e.get('dur', 0.8)), 'scale': float(e.get('scale', 1.3)),
                          'cx': float(e.get('cx', 0.5)), 'cy': float(e.get('cy', 0.5)), 'ease': 0.12})
            if e.get('sfx', 'whoosh'):
                sounds.append((t, {'type': 'sfx', 'name': e.get('sfx', 'whoosh')}))
        elif ty == 'shake':
            shakes.append((t, t + float(e.get('dur', 0.3))))
        elif ty == 'sfx':
            sounds.append((t, e))
        elif ty == 'voice':
            sounds.append((t, e))
            if e.get('caption'):
                v = load_voice(e['file'], float(e.get('from') or 0), float(e.get('to') or 0))
                overlays.append({'kind': 'sticker', 'text': e['caption'], 'style': e.get('style', 'cream'),
                                 't0': t, 't1': t + len(v) / SR + 0.4, 'y': e.get('y', 1420), 'rot': -2,
                                 'size': e.get('size', 70)})
    return pieces, total, overlays, sounds, zooms, shakes


# ------------------------------------------------------------------ main render
def main(spec_path, out_dir):
    spec = json.load(open(spec_path, encoding='utf-8'))
    os.makedirs(out_dir, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='uoa_edit_')
    slug = re.sub(r'[^a-z0-9-]', '', spec.get('slug', 'edit').lower()) or 'edit'

    # 1. plan the whole timeline
    segs, t0 = [], 0.0
    for k, seg in enumerate(spec['segments']):
        pieces, dur, ov, snd, zm, sh = plan_segment(seg)
        segs.append({'seg': seg, 'pieces': pieces, 'dur': dur, 'ov': ov, 'snd': snd, 'zm': zm, 'sh': sh,
                     'out0': t0, 'k': k})
        t0 += dur
    body = t0
    total = round(body + END_CARD, 3)
    if total > 62:
        raise RuntimeError(f'too long: {total:.1f}s — keep compilations under 60 s')

    # 2. extract each segment's frames (9:16 crop, colour) to disk
    for s in segs:
        seg = s['seg']; a, b = float(seg.get('start', 0)), float(seg['end'])
        eq = seg.get('eq', {})
        cx = float(seg.get('crop_x', 0.5))
        band = seg.get('band') or detect_band(seg['path'])
        if band == 'full':
            band = (0, H)
        y0b, y1b = int(band[0]), int(band[1])
        bh = (y1b - y0b) // 2 * 2
        vh = min(H - VIDEO_Y - 120, int(bh * float(seg.get('band_scale', 1.2))) // 2 * 2)
        sc = max(vh / bh, 1.0)
        vw = int(W * sc) // 2 * 2
        s['vh'] = vh
        vf = (f"crop={W}:{bh}:0:{y0b},scale={vw}:{vh}:flags=lanczos,"
              f"crop={W}:{vh}:'(iw-{W})*{cx:.3f}':0,setsar=1,fps={FPS},"
              f"eq=brightness={eq.get('brightness', 0)}:contrast={eq.get('contrast', 1.0)}:"
              f"saturation={eq.get('saturation', 1.1)}")
        d = os.path.join(tmp, f's{s["k"]}'); os.makedirs(d)
        run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', seg['path'], '-vf', vf,
             '-q:v', '2', os.path.join(d, '%05d.jpg')])
        s['frames'] = sorted(os.listdir(d)); s['dir'] = d

    # 3. pre-build overlay images
    title_img = sticker(spec['title'], 'cream', 84, rot=-2) if spec.get('title') else None
    title_t1 = float(spec.get('title_dur', 1e9))
    cache = {}

    def ov_img(o):
        key = (o['kind'], o['text'], o.get('style'), o.get('rot'), o.get('size'))
        if key not in cache:
            cache[key] = inner_pill(o['text']) if o['kind'] == 'inner' else \
                sticker(o['text'], o.get('style', 'cream'), o.get('size', 78), rot=o.get('rot', 0))
        return cache[key]

    counters = {s['k']: counter_png(s['seg']['number']) for s in segs if s['seg'].get('number')}
    end_bg = None

    # 4. render frames -> ffmpeg pipe
    vid = os.path.join(tmp, 'video.mp4')
    enc = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                            '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
                            '-pix_fmt', 'yuv420p', vid], stdin=subprocess.PIPE)
    nfr = int(round(total * FPS))
    last_frame = None

    def paste_pop(canvas, img, cx, y, age, center=True):
        # sticker slap: 0.6 -> 1.08 -> 1.0 over 6 frames
        f = age * FPS
        sc = 0.6 + 0.48 * f / 3 if f < 3 else (1.08 - 0.08 * (f - 3) / 3 if f < 6 else 1.0)
        im = img if abs(sc - 1) < 1e-3 else img.resize((max(1, int(img.width * sc)), max(1, int(img.height * sc))),
                                                       Image.BILINEAR)
        x = int(cx - im.width / 2) if center else int(cx)
        x = max(10, min(W - im.width - 10, x))
        yy = int(y - (im.height - img.height) / 2)
        canvas.alpha_composite(im, (x, max(0, yy)))

    for fi in range(nfr):
        t = fi / FPS
        if t >= body:
            if end_bg is None:
                base = last_frame.copy().filter(ImageFilter.GaussianBlur(18))
                dim = Image.new('RGBA', (W, H), (42, 26, 18, 150))
                end_bg = Image.alpha_composite(base.convert('RGBA'), dim)
                card = spec.get('end_card', {})
                end_items = [(sticker(card.get('title', 'ABONE OL'), 'tangerine', 120, rot=-3), 720, 0.0)]
                end_items.append((sticker(card.get('sub', 'Her gün yeni komik hayvan videosu'), 'cream', 58, rot=2),
                                  940, 0.25))
                if card.get('promo'):
                    end_items.append((sticker(card['promo'], 'cream', 48, rot=-1), 1150, 0.55))
            fr = end_bg.copy()
            for img, y, delay in end_items:
                age = t - body - delay
                if age >= 0:
                    paste_pop(fr, img, W / 2, y, age)
            enc.stdin.write(fr.convert('RGB').tobytes())
            continue
        s = next(x for x in segs if x['out0'] - 1e-9 <= t < x['out0'] + x['dur'] + 1e-9) if t < body else segs[-1]
        lt = t - s['out0']
        p = next((q for q in s['pieces'] if q['out0'] - 1e-9 <= lt < q['out0'] +
                  (q['dur'] if q['kind'] == 'freeze' else (q['src1'] - q['src0']) / q['speed']) + 1e-9),
                 s['pieces'][-1])
        if p['kind'] == 'freeze':
            src = p['src0']
        else:
            src = p['src0'] + (lt - p['out0']) * p['speed']
        idx = min(len(s['frames']) - 1, max(0, int(round(src * FPS))))
        im = Image.open(os.path.join(s['dir'], s['frames'][idx])).convert('RGB')
        # zoom: base + punch-ins + freeze zoom + segment-entry punch
        seg = s['seg']
        scale, cx, cy = float(seg.get('zoom_base', 1.0)), 0.5, float(seg.get('cy', 0.5))
        for z in s['zm']:
            if z['t0'] <= lt <= z['t1']:
                e = z['ease']; u = min(1, (lt - z['t0']) / e, (z['t1'] - lt) / e) if e > 0 else 1
                u = max(0.0, min(1.0, u)); u = u * u * (3 - 2 * u)
                scale *= 1 + (z['scale'] - 1) * u; cx, cy = z['cx'], z['cy']
        if p['kind'] == 'freeze':
            u = min(1, (lt - p['out0']) / 0.12); scale *= 1 + (p['zoom'] - 1) * u
        if lt < 4 / FPS and s['k'] > 0:
            scale *= 1 + 0.12 * (1 - lt * FPS / 4)
        dx = dy = 0
        for a0, a1 in s['sh']:
            if a0 <= lt <= a1:
                dx, dy = int(18 * math.sin(lt * 90)), int(14 * math.cos(lt * 70))
        VH = s['vh']
        if scale > 1.001 or dx or dy:
            cw, ch = W / scale, VH / scale
            x0 = min(max(0, cx * W - cw / 2 + dx), W - cw); y0 = min(max(0, cy * VH - ch / 2 + dy), VH - ch)
            im = im.resize((W, VH), Image.BILINEAR, box=(x0, y0, x0 + cw, y0 + ch))
        fr = Image.new('RGBA', (W, H), BG + (255,))
        vy = VIDEO_Y if VH < H - VIDEO_Y else H - VH
        fr.paste(im, (0, vy))
        d_ = ImageDraw.Draw(fr)
        d_.rectangle([0, vy - 6, W, vy - 1], fill=TANG)
        d_.rectangle([0, vy + VH, W, vy + VH + 5], fill=TANG)
        last_frame = fr.convert('RGB')
        # overlays
        if title_img is not None and t < title_t1:
            paste_pop(fr, title_img, W / 2, max(40, (VIDEO_Y - title_img.height) // 2 + 4), t)
        if s['k'] in counters:
            fr.alpha_composite(counters[s['k']], (SAFE_X0 - 30, VIDEO_Y + 24))
        for o in s['ov']:
            if o['t0'] <= lt < o['t1']:
                img = ov_img(o)
                if o['kind'] == 'inner':
                    x = SAFE_X0 + (110 if s['k'] in counters else -30)
                    paste_pop(fr, img, x, VIDEO_Y + 30, lt - o['t0'], center=False)
                else:
                    paste_pop(fr, img, W / 2 - 30, o.get('y', 1300), lt - o['t0'])
        enc.stdin.write(fr.convert('RGB').tobytes())
    enc.stdin.close(); enc.wait()
    if enc.returncode:
        raise RuntimeError('encoder failed')

    # 5. audio
    n = int(total * SR)
    clipa, vo, fx = np.zeros(n, np.float32), np.zeros(n, np.float32), np.zeros(n, np.float32)
    for s in segs:
        seg = s['seg']; vol = float(seg.get('clip_audio', 0))
        if vol > 0 and has_audio(seg['path']):
            w = os.path.join(tmp, f'a{s["k"]}.wav')
            run(['ffmpeg', '-y', '-v', 'error', '-ss', str(seg.get('start', 0)), '-to', str(seg['end']), '-i',
                 seg['path'], '-ac', '1', '-ar', str(SR), '-af', 'highpass=f=80', w])
            ca, _ = sf.read(w, dtype='float32')
            ca = ca if ca.ndim == 1 else ca.mean(1)
            ca = _norm(ca, 0.8) * vol
            for p in s['pieces']:
                if p['kind'] == 'freeze':
                    continue
                piece = ca[int(p['src0'] * SR):int(p['src1'] * SR)]
                if p['speed'] != 1.0 and len(piece):
                    m = int(len(piece) / p['speed'])
                    piece = np.interp(np.linspace(0, len(piece) - 1, m), np.arange(len(piece)), piece).astype(np.float32)
                add(clipa, piece, s['out0'] + p['out0'])
        for at, e in s['snd']:
            T = s['out0'] + at
            if e['type'] == 'voice':
                add(vo, load_voice(e['file'], float(e.get('from') or 0), float(e.get('to') or 0)), T)
            else:
                add(fx, sfx(e['name'], float(e.get('amp', 0.35))), T)
        if s['k'] > 0:
            add(fx, sfx('whoosh', 0.25), s['out0'] - 0.18)
    iv = spec.get('intro_voice')
    if iv:
        add(vo, load_voice(iv['file'], float(iv.get('from') or 0), float(iv.get('to') or 0)), float(iv.get('t', 0.3)))
    add(fx, sfx('pop', 0.3), 0.02)
    add(fx, sfx('whoosh', 0.3), body - 0.2)
    add(fx, sfx('ding', 0.3), body + 0.05)
    mus = make_music(spec.get('music', 'bouncy'), total, slug) * float(spec.get('music_vol', 0.22)) / 0.3
    talk = np.convolve((np.abs(vo) > 0.03).astype(np.float32), np.ones(int(0.3 * SR)) / int(0.3 * SR), mode='same')
    duck = 1 - 0.7 * np.clip(talk * 3, 0, 1)
    mix = np.clip(vo + clipa * (0.5 + 0.5 * duck) + fx + mus * duck, -1, 1)
    wav = os.path.join(tmp, 'mix.wav'); sf.write(wav, mix, SR)
    out = os.path.join(out_dir, f'{slug}_shorts.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', wav, '-map', '0:v', '-map', '1:a',
         '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
         '-movflags', '+faststart', '-shortest', out])

    # 6. thumb + contact sheet + timeline
    run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{min(1.0, total / 3):.2f}', '-i', out, '-frames:v', '1', '-q:v', '3',
         os.path.join(out_dir, 'thumb.jpg')])
    k = 12
    sheet = Image.new('RGB', (6 * 216, 2 * 384), 'black')
    for i in range(k):
        ts = min(total - 0.1, total * i / k + 0.4)
        fp = os.path.join(tmp, f'f{i}.jpg')
        run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{ts:.2f}', '-i', out, '-frames:v', '1', fp])
        sheet.paste(Image.open(fp).resize((216, 384)), ((i % 6) * 216, (i // 6) * 384))
    sheet.save(os.path.join(out_dir, 'contact.jpg'), quality=85)
    tl = [{'segment': s['k'], 'out0': round(s['out0'], 2), 'dur': round(s['dur'], 2), 'path': s['seg']['path']}
          for s in segs]
    json.dump({'total': total, 'body': body, 'segments': tl}, open(os.path.join(out_dir, 'timeline.json'), 'w'),
              ensure_ascii=False, indent=1)
    shutil.rmtree(tmp, ignore_errors=True)
    print(json.dumps({'video': out, 'duration': total, 'segments': len(segs)}, ensure_ascii=False))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
