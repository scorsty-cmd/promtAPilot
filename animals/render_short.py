#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render one vertical Universe Of Animals Short (1080x1920, 30 fps) from a spec.json.

    python animals/render_short.py spec.json out_dir

spec.json:
{
  "slug": "kedi-pazartesi",
  "clips": [{"path": "/abs/cat_0.mp4", "start": 0.0, "end": 9.0}],   # played in order, looped if needed
  "hook": "Pazartesi sabahı her kedi:",                                 # top banner, whole video
  "lines": ["Beş dakika daha...", "Kalkmıyorum *dedim!*"],               # narration + captions (*x* = yellow)
  "line_gap": 0.35, "lead_in": 0.5, "voice_speed": 1.0,
  "music": "bouncy" | "calm" | "none",
  "end_card": {"title": "ABONE OL", "sub": "Her gün yeni komik hayvan videosu", "promo": "..."}
}
Needs: ffmpeg, Pillow, numpy, soundfile, piper-tts and the Turkish voice
(env PIPER_VOICE=/path/tr_TR-fahrettin-medium.onnx; its .onnx.json next to it).
Outputs: <slug>_shorts.mp4, thumb.jpg, contact.jpg, timeline.json
"""
import json, os, re, subprocess, sys, math, random, tempfile
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFont

W, H, FPS, SR = 1080, 1920, 30, 48000
HERE = os.path.dirname(os.path.abspath(__file__))
F_BLACK = os.path.join(HERE, 'fonts', 'InterDisplay-Black.otf')
F_BOLD = os.path.join(HERE, 'fonts', 'InterDisplay-Bold.otf')
YELLOW, WHITE, INK = (255, 212, 0, 255), (255, 255, 255, 255), (12, 12, 12, 255)
END_CARD = 2.8
SAFE_X0, SAFE_X1 = 80, 1000          # Shorts UI covers the right edge and the bottom


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(' '.join(cmd[:6]) + '...\n' + r.stderr[-1500:])
    return r.stdout


def probe_dur(p):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]).strip())


# ---------------------------------------------------------------- voice
def tts(text, out_wav, speed):
    voice = os.environ.get('PIPER_VOICE')
    if not voice or not os.path.exists(voice):
        raise RuntimeError('PIPER_VOICE not set / missing')
    clean = re.sub(r'\*', '', text)
    r = subprocess.run([sys.executable, '-m', 'piper', '-m', voice, '-f', out_wav,
                        '--length-scale', f'{1.0 / speed:.3f}', '--sentence-silence', '0.12'],
                       input=clean, capture_output=True, text=True)
    if r.returncode != 0 or not os.path.exists(out_wav):
        raise RuntimeError('piper failed: ' + r.stderr[-800:])
    a, sr = sf.read(out_wav, dtype='float32')
    if a.ndim > 1:
        a = a.mean(axis=1)
    # trim silence at both ends
    idx = np.where(np.abs(a) > 0.01)[0]
    if len(idx):
        a = a[max(0, idx[0] - int(0.03 * sr)): idx[-1] + int(0.08 * sr)]
    # resample to SR
    n = int(len(a) * SR / sr)
    a = np.interp(np.linspace(0, len(a) - 1, n), np.arange(len(a)), a).astype(np.float32)
    return a / (np.max(np.abs(a)) + 1e-6) * 0.9


# ---------------------------------------------------------------- music + sfx (original, synthesised)
def pluck(freq, dur, amp=0.3):
    t = np.arange(int(dur * SR)) / SR
    env = np.exp(-t * 7) * np.minimum(1, t * 400)
    tone = sum(np.sin(2 * np.pi * freq * k * t) / k ** 1.6 for k in (1, 2, 3, 4))
    return (tone * env * amp).astype(np.float32)


def music(kind, total, seed):
    out = np.zeros(int(total * SR) + SR, np.float32)
    if kind == 'none':
        return out[:int(total * SR)]
    rng = random.Random(seed)
    root = rng.choice([261.63, 293.66, 329.63, 349.23, 392.0])
    scale = [0, 2, 4, 7, 9, 12, 14, 16]
    bpm = rng.choice([108, 112, 116]) if kind == 'bouncy' else rng.choice([78, 84])
    beat = 60 / bpm
    motif = [rng.choice(scale) for _ in range(8)]
    bass_seq = [0, 0, 5, 7] if kind == 'bouncy' else [0, 5, 3, 4]
    t, i = 0.0, 0
    while t < total:
        bar = int(t / (beat * 4))
        # melody on 8ths (bouncy) or quarters (calm)
        step = beat / 2 if kind == 'bouncy' else beat
        if kind == 'calm' or i % 8 not in (3, 7):
            semi = motif[i % 8] + (12 if bar % 4 == 3 and i % 2 else 0)
            n = pluck(root * 2 ** (semi / 12), 0.6, 0.16 if kind == 'bouncy' else 0.12)
            s = int(t * SR); out[s:s + len(n)] += n[:len(out) - s]
        if i % (2 if kind == 'bouncy' else 1) == 0:
            beat_no = int(round(t / beat))
            if beat_no % 1 == 0:
                bf = root / 2 * 2 ** (bass_seq[(beat_no // 4) % 4] / 12)
                b = pluck(bf, beat * 0.95, 0.22)
                s = int(t * SR); out[s:s + len(b)] += b[:len(out) - s]
            if kind == 'bouncy' and beat_no % 2 == 1:   # soft snap on 2 and 4
                nl = int(0.05 * SR)
                nz = np.random.default_rng(beat_no).normal(0, 1, nl).astype(np.float32) * np.exp(-np.arange(nl) / (0.012 * SR)) * 0.08
                s = int(t * SR); out[s:s + nl] += nz[:len(out) - s]
        t += step; i += 1
    out = out[:int(total * SR)]
    fade = int(0.8 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out / (np.max(np.abs(out)) + 1e-6) * 0.5


def pop(amp=0.25):
    t = np.arange(int(0.07 * SR)) / SR
    f = 900 * np.exp(-t * 30) + 300
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 60) * amp).astype(np.float32)


def whoosh(dur=0.5, amp=0.18):
    n = int(dur * SR)
    nz = np.random.default_rng(7).normal(0, 1, n).astype(np.float32)
    k = np.ones(40) / 40
    nz = np.convolve(nz, k, mode='same')
    env = np.sin(np.linspace(0, np.pi, n)) ** 2
    return nz * env * amp / (np.max(np.abs(nz)) + 1e-6) * 3


def add(buf, clip, at):
    s = int(at * SR)
    if s >= len(buf):
        return
    e = min(len(buf), s + len(clip))
    buf[s:e] += clip[:e - s]


# ---------------------------------------------------------------- text images
def font(path, size):
    return ImageFont.truetype(path, size)


def wrap(draw, text, fnt, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if draw.textlength(test, font=fnt) <= maxw or not cur:
            cur = test
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def hook_png(text, path):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    size = 70
    while True:
        f = font(F_BLACK, size)
        lines = wrap(d, text, f, SAFE_X1 - SAFE_X0 - 80)
        if len(lines) <= 2 or size <= 48:
            break
        size -= 4
    lh = int(size * 1.18)
    box_w = max(d.textlength(l, font=f) for l in lines) + 70
    box_h = lh * len(lines) + 46
    x0 = (W - box_w) / 2; y0 = 250
    d.rounded_rectangle([x0, y0, x0 + box_w, y0 + box_h], radius=28, fill=WHITE)
    for i, l in enumerate(lines):
        tw = d.textlength(l, font=f)
        d.text(((W - tw) / 2, y0 + 20 + i * lh), l, font=f, fill=INK)
    img.save(path)
    return y0 + box_h


def caption_png(chunk, path, y_center=1230):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    parts = re.split(r'(\*[^*]+\*)', chunk)
    tokens = []
    for p in parts:
        if not p:
            continue
        hl = p.startswith('*') and p.endswith('*')
        for w in p.strip('*').split():
            tokens.append((w, hl))
    size = 96
    while True:
        f = font(F_BLACK, size)
        total = sum(d.textlength(w + ' ', font=f) for w, _ in tokens)
        if total <= SAFE_X1 - SAFE_X0 or size <= 56:
            break
        size -= 4
    # up to two lines
    lines, cur, cw = [], [], 0
    for w, hl in tokens:
        ww = d.textlength(w + ' ', font=f)
        if cw + ww > SAFE_X1 - SAFE_X0 and cur:
            lines.append(cur); cur, cw = [], 0
        cur.append((w, hl)); cw += ww
    if cur:
        lines.append(cur)
    lh = int(size * 1.15)
    y = y_center - lh * len(lines) / 2
    for ln in lines:
        lw = sum(d.textlength(w + ' ', font=f) for w, _ in ln) - d.textlength(' ', font=f)
        x = (W - lw) / 2
        for w, hl in ln:
            d.text((x, y), w, font=f, fill=YELLOW if hl else WHITE, stroke_width=11, stroke_fill=INK)
            x += d.textlength(w + ' ', font=f)
        y += lh
    img.save(path)


def end_png(card, path):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 150)); d = ImageDraw.Draw(img)
    f1, f2, f3 = font(F_BLACK, 132), font(F_BOLD, 54), font(F_BOLD, 44)
    title = card.get('title', 'ABONE OL')
    tw = d.textlength(title, font=f1)
    d.rounded_rectangle([(W - tw) / 2 - 50, 700, (W + tw) / 2 + 50, 880], radius=40, fill=(230, 33, 23, 255))
    d.text(((W - tw) / 2, 714), title, font=f1, fill=WHITE)
    y = 940
    for l in wrap(d, card.get('sub', ''), f2, 860):
        d.text(((W - d.textlength(l, font=f2)) / 2, y), l, font=f2, fill=WHITE); y += 70
    promo = card.get('promo')
    if promo:
        y += 40
        for l in wrap(d, promo, f3, 840):
            d.text(((W - d.textlength(l, font=f3)) / 2, y), l, font=f3, fill=YELLOW); y += 60
    img.save(path)


def chunks_of(line, max_words=3, max_chars=20):
    words = line.split()
    out, cur = [], []
    for w in words:
        if cur and (len(cur) >= max_words or len(' '.join(cur + [w]).replace('*', '')) > max_chars):
            out.append(' '.join(cur)); cur = []
        cur.append(w)
    if cur:
        out.append(' '.join(cur))
    # keep *...* emphasis balanced inside each chunk
    fixed, open_ = [], False
    for c in out:
        s = ('*' if open_ else '') + c
        if s.count('*') % 2 == 1:
            s += '*'; open_ = True
        else:
            open_ = False
        fixed.append(s.replace('**', ''))
    return fixed


# ---------------------------------------------------------------- main
def main(spec_path, out_dir):
    spec = json.load(open(spec_path, encoding='utf-8'))
    os.makedirs(out_dir, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='uoa_')
    slug = re.sub(r'[^a-z0-9-]', '', spec.get('slug', 'short').lower()) or 'short'
    speed = float(spec.get('voice_speed', 1.0))
    gap, lead = float(spec.get('line_gap', 0.35)), float(spec.get('lead_in', 0.5))

    # 1. voice + timeline
    t, timeline, voices = lead, [], []
    for k, line in enumerate(spec['lines']):
        a = tts(line, os.path.join(tmp, f'v{k}.wav'), speed)
        d = len(a) / SR
        timeline.append({'line': line, 'start': round(t, 3), 'end': round(t + d, 3)})
        voices.append((a, t)); t += d + gap
    voice_end = t - gap
    body = max(voice_end + 0.7, float(spec.get('min_body', 6.0)))
    total = round(body + END_CARD, 2)
    if total > 59:
        raise RuntimeError(f'too long: {total:.1f}s (Shorts max 60s) – shorten the lines')

    # 2. video track from clips (looped in order until the body is filled)
    segs, filled, idx = [], 0.0, 0
    clips = spec['clips']
    while filled < total - 1e-3:
        c = clips[idx % len(clips)]; idx += 1
        s, e = float(c.get('start', 0)), float(c.get('end') or probe_dur(c['path']))
        dur = min(e - s, total - filled)
        if dur < 0.3:
            break
        segs.append((c['path'], s, dur)); filled += dur
        if idx > 40:
            break
    args = ['ffmpeg', '-y', '-v', 'error']
    for p, s, d in segs:
        args += ['-ss', f'{s:.3f}', '-t', f'{d:.3f}', '-i', p]
    vf = ''.join(f'[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1,format=yuv420p[s{i}];' for i in range(len(segs)))
    vf += ''.join(f'[s{i}]' for i in range(len(segs))) + f'concat=n={len(segs)}:v=1:a=0[base]'
    # 3. overlays
    pngs = []
    hook_png(spec.get('hook', ''), os.path.join(tmp, 'hook.png')) if spec.get('hook') else None
    if spec.get('hook'):
        pngs.append((os.path.join(tmp, 'hook.png'), 0.0, body))
    cap_events = []
    for k, tl in enumerate(timeline):
        chs = chunks_of(tl['line'])
        weights = [max(1, len(c.replace('*', ''))) for c in chs]
        dur = tl['end'] - tl['start']; cs = tl['start']
        for j, (c, wgt) in enumerate(zip(chs, weights)):
            cd = dur * wgt / sum(weights)
            ce = cs + cd if j < len(chs) - 1 else tl['end'] + min(gap, 0.3)
            p = os.path.join(tmp, f'c{k}_{j}.png'); caption_png(c, p)
            pngs.append((p, cs, ce)); cap_events.append(cs); cs += cd
    end_png(spec.get('end_card', {}), os.path.join(tmp, 'end.png'))
    pngs.append((os.path.join(tmp, 'end.png'), body, total))
    n0 = len(segs)
    for p, a, b in pngs:
        args += ['-loop', '1', '-t', f'{total:.3f}', '-i', p]
    last = 'base'
    for i, (p, a, b) in enumerate(pngs):
        vf += f';[{last}][{n0 + i}:v]overlay=0:0:enable=\'between(t,{a:.3f},{b:.3f})\'[o{i}]'
        last = f'o{i}'
    vid = os.path.join(tmp, 'video.mp4')
    args += ['-filter_complex', vf, '-map', f'[{last}]', '-t', f'{total:.3f}', '-r', str(FPS),
             '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', vid]
    run(args)

    # 4. audio: voice + ducked music + sfx
    n = int(total * SR)
    vo = np.zeros(n, np.float32)
    for a, at in voices:
        add(vo, a, at)
    mus = music(spec.get('music', 'bouncy'), total, slug)
    env = np.convolve((np.abs(vo) > 0.02).astype(np.float32), np.ones(int(0.25 * SR)) / int(0.25 * SR), mode='same')
    duck = 0.30 - 0.20 * np.clip(env * 3, 0, 1)
    mix = vo + mus * duck
    for at in cap_events[:1]:
        add(mix, pop(0.22), max(0, at - 0.02))
    add(mix, whoosh(), max(0, body - 0.25))
    add(mix, pop(0.3), body + 0.05)
    mix = np.clip(mix, -1, 1)
    wav = os.path.join(tmp, 'mix.wav'); sf.write(wav, mix, SR)

    out = os.path.join(out_dir, f'{slug}_shorts.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', wav, '-map', '0:v', '-map', '1:a',
         '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
         '-movflags', '+faststart', '-shortest', out])
    # 5. thumb + contact sheet
    run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{min(1.2, total / 3):.2f}', '-i', out, '-frames:v', '1', '-q:v', '3',
         os.path.join(out_dir, 'thumb.jpg')])
    times = [total * k / 8 + 0.3 for k in range(8)]
    sheet = Image.new('RGB', (4 * 270, 2 * 480), 'black')
    for k, ts in enumerate(times):
        fp = os.path.join(tmp, f'f{k}.jpg')
        run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{min(ts, total - 0.1):.2f}', '-i', out, '-frames:v', '1', fp])
        im = Image.open(fp).resize((270, 480)); sheet.paste(im, ((k % 4) * 270, (k // 4) * 480))
    sheet.save(os.path.join(out_dir, 'contact.jpg'), quality=85)
    json.dump({'total': total, 'body': body, 'timeline': timeline}, open(os.path.join(out_dir, 'timeline.json'), 'w'),
              ensure_ascii=False, indent=1)
    print(json.dumps({'video': out, 'duration': total, 'lines': len(timeline)}, ensure_ascii=False))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
