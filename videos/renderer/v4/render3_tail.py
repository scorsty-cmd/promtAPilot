if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--beats', action='store_true'); ap.add_argument('--out')
    ap.add_argument('--start', type=float, default=0); ap.add_argument('--end', type=float, default=None)
    ap.add_argument('--at', type=float, nargs='*')
    A = ap.parse_args()
    if A.at:
        for t in A.at: Image.fromarray(frame(t)).save(f'at_{t:07.2f}.jpg', quality=88)
        sys.exit()
    if A.beats:
        tiles = []
        for i, s in enumerate(STARTS):
            t = s + min(DURS[i] * .8, 4.5); tiles.append((i, Image.fromarray(frame(t)).resize((640, 360))))
        for p in range(0, len(tiles), 9):
            sh = Image.new('RGB', (1920, 1080), 'white'); d = ImageDraw.Draw(sh)
            for q, (i, im) in enumerate(tiles[p:p + 9]):
                sh.paste(im, ((q % 3) * 640, (q // 3) * 360)); d.rectangle([(q % 3) * 640, (q // 3) * 360, (q % 3) * 640 + 60, (q // 3) * 360 + 26], fill='red'); d.text(((q % 3) * 640 + 4, (q // 3) * 360 + 4), str(i), fill='white')
            sh.save(f'preview_sheet_{p // 9}.jpg', quality=85)
        print('total', TOTAL, 'beats', len(B)); sys.exit()
    end = A.end if A.end is not None else TOTAL
    n0 = int(round(A.start * FPS)); n1 = int(round(end * FPS))
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-maxrate', '14M', '-bufsize', '28M', '-pix_fmt', 'yuv420p', A.out], stdin=subprocess.PIPE)
    import time; t0 = time.time()
    for n in range(n0, n1):
        p.stdin.write(frame(n / FPS, n).tobytes())
        if n % 300 == 0: print(n, n1, round((n - n0) / (time.time() - t0 + 1e-9), 1), 'fps', flush=True)
    p.stdin.close(); p.wait(); print('done', A.out)
