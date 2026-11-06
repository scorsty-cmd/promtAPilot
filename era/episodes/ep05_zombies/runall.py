"""Resumable 4-chunk render and final muxer for 'If the Whole World Turned Into Zombies'.
Splits total frames into 4 chunks, renders with Remotion CLI, and muxes with public/mix.wav."""
import json, os, subprocess, sys, time

def run(cmd):
    print(">", " ".join(cmd), flush=True)
    res = subprocess.run(cmd)
    if res.returncode != 0:
        print(f"FAILED with exit code {res.returncode}", flush=True)
        sys.exit(res.returncode)

if __name__ == "__main__":
    tl = json.load(open("src/timeline.json"))
    TOTAL_FRAMES = int((tl["voice_end"] + 8) * 30)
    print(f"Total video duration: {round(TOTAL_FRAMES / 30, 2)}s ({TOTAL_FRAMES} frames)")

    os.makedirs("chunks", exist_ok=True)
    os.makedirs("out", exist_ok=True)

    chunk_size = TOTAL_FRAMES // 4
    chunks = [
        (0, chunk_size, "c0"),
        (chunk_size + 1, chunk_size * 2, "c1"),
        (chunk_size * 2 + 1, chunk_size * 3, "c2"),
        (chunk_size * 3 + 1, TOTAL_FRAMES - 1, "c3"),
    ]

    for start_f, end_f, cid in chunks:
        out_mp4 = f"chunks/{cid}.mp4"
        if os.path.exists(out_mp4) and os.path.getsize(out_mp4) > 1000000:
            print(f"Chunk {cid} already exists ({os.path.getsize(out_mp4)} bytes), skipping.")
            continue
        print(f"\n--- RENDERING CHUNK {cid}: frames {start_f} to {end_f} ({end_f - start_f + 1} frames) ---", flush=True)
        cmd = [
            "npx.cmd", "remotion", "render",
            "Zombies",
            out_mp4,
            f"--frames={start_f}-{end_f}",
            "--concurrency=3",
            "--muted",
            "--jpeg-quality=90",
            "--crf=16"
        ]
        run(cmd)

    print("\n--- ALL CHUNKS RENDERED. CONCATENATING ---", flush=True)
    list_path = "chunks/list.txt"
    with open(list_path, "w") as f:
        for _, _, cid in chunks:
            f.write(f"file '{cid}.mp4'\n")

    final_mp4 = "out/final.mp4"
    mux_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0", "-i", list_path,
        "-i", "public/mix.wav",
        "-map", "0:v", "-map", "1:a",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        final_mp4
    ]
    run(mux_cmd)
    print(f"\nSUCCESS! Final video assembled at {final_mp4} ({os.path.getsize(final_mp4)} bytes)", flush=True)
