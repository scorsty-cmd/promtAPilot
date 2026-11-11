import os, sys, time, re, json, subprocess, traceback, threading, urllib.request

os.environ["TRANSFORMERS_NO_TORCHVISION"] = "1"
TOPICS = ["antigravity-fuat-colab-2026", "ws-colab-tts-fda6dbf7b4d365d9d9327381"]
REF_URL = "https://raw.githubusercontent.com/scorsty-cmd/promtAPilot/main/colab/referans_12s.wav"
REMOTE_CMD_URL = "https://raw.githubusercontent.com/scorsty-cmd/promtAPilot/main/colab/remote_cmd.py"

def notify(msg: str):
    print(f"📡 {msg}", flush=True)
    for t in TOPICS:
        try:
            req = urllib.request.Request(f"https://ntfy.sh/{t}", data=msg.encode("utf-8"), method="POST")
            urllib.request.urlopen(req, timeout=8)
        except Exception:
            pass

_last_cmd_sha = None
def remote_watcher():
    global _last_cmd_sha
    import hashlib
    while True:
        try:
            url = f"{REMOTE_CMD_URL}?t={int(time.time())}"
            with urllib.request.urlopen(url, timeout=8) as r:
                code = r.read().decode("utf-8")
            sha = hashlib.sha1(code.encode("utf-8")).hexdigest()
            if sha != _last_cmd_sha and "# RUN_ID:" in code:
                _last_cmd_sha = sha
                notify(f"STATUS: Uzaktan komut calistiriliyor ({sha[:8]})...")
                exec(code, globals())
        except Exception:
            pass
        time.sleep(6)

threading.Thread(target=remote_watcher, daemon=True).start()

try:
    notify("STATUS: [1/4] Yeni v2 Bootstrap baslatildi, GPU hazirlaniyor...")
    subprocess.run("nvidia-smi --query-gpu=name,memory.total --format=csv", shell=True)

    if not os.path.exists("referans.wav") or os.path.getsize("referans.wav") < 10000:
        urllib.request.urlretrieve(REF_URL, "referans.wav")
        notify(f"STATUS: [2/4] referans.wav indirildi ({os.path.getsize('referans.wav')} bayt)")

    notify("STATUS: [3/4] Paketler ve uyumluluk katmani kontrol ediliyor...")
    subprocess.run("pip install -q uv", shell=True, check=False)
    subprocess.run(
        "uv pip install --system -U 'protobuf>=6.31.1' 'chatterbox-tts==0.1.7' fastapi uvicorn python-multipart soundfile requests",
        shell=True, check=False
    )
    subprocess.run("uv pip uninstall --system torchvision torchao || true", shell=True, check=False)

    chk = subprocess.run([sys.executable, "-c", "from chatterbox.mtl_tts import ChatterboxMultilingualTTS"], capture_output=True, text=True)
    if chk.returncode != 0:
        notify("STATUS: [3.5/4] Python 3.13 icin transformers==4.49.0 aktif ediliyor...")
        subprocess.run("uv pip install --system 'transformers==4.49.0'", shell=True, check=False)
        chk2 = subprocess.run([sys.executable, "-c", "from chatterbox.mtl_tts import ChatterboxMultilingualTTS"], capture_output=True, text=True)
        if chk2.returncode != 0:
            notify("ERROR: Import hatasi detayi: " + chk2.stderr[-600:])

    if not os.path.exists("cloudflared") or os.path.getsize("cloudflared") < 1000000:
        urllib.request.urlretrieve(
            "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64",
            "cloudflared"
        )
    os.chmod("cloudflared", 0o755)

    SERVER_PY = """import os, sys, io, time, hashlib, threading
os.environ["TRANSFORMERS_NO_TORCHVISION"] = "1"
import transformers
try:
    from transformers.models.llama import modeling_llama, configuration_llama
    transformers.LlamaModel = modeling_llama.LlamaModel
    transformers.LlamaConfig = configuration_llama.LlamaConfig
    from transformers.models.gpt2 import modeling_gpt2, configuration_gpt2
    transformers.GPT2Model = modeling_gpt2.GPT2Model
    transformers.GPT2Config = configuration_gpt2.GPT2Config
except Exception as e:
    print("Shim warning:", e, flush=True)

import torch
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException
from fastapi.responses import Response, JSONResponse
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

REF_DEFAULT = "referans.wav"
app = FastAPI(title="Web Sihirbazi Colab GPU TTS")
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Chatterbox modeli belleğe alınıyor... Cihaz: {device}", flush=True)
tts = ChatterboxMultilingualTTS.from_pretrained(device=device)

GPU_LOCK = threading.Lock()
_cond_key = None

if os.path.exists(REF_DEFAULT) and os.path.getsize(REF_DEFAULT) > 10000:
    try:
        tts.prepare_conditionals(REF_DEFAULT, exaggeration=0.35)
        with open(REF_DEFAULT, "rb") as rf:
            _cond_key = (hashlib.sha1(rf.read()).hexdigest(), 0.35)
        print("✅ Varsayilan referans.wav GPU bellegine on-yuklendi!", flush=True)
    except Exception as e:
        print("Referans on-yukleme uyarisi:", e, flush=True)

print("✅ MODEL_READY", flush=True)

@app.get("/")
def index():
    gpu_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    vram_gb = round(torch.cuda.get_device_properties(0).total_memory / 1e9, 1) if torch.cuda.is_available() else 0
    return {
        "status": "online",
        "device": device,
        "gpu_name": gpu_name,
        "vram_gb": vram_gb,
        "model": "Chatterbox Multilingual (GPU)",
        "ref_ready": os.path.exists(REF_DEFAULT),
    }

@app.post("/clone_voice")
def clone_voice(
    text: str = Form(...),
    language: str = Form("tr"),
    exaggeration: float = Form(0.35),
    cfg_weight: float = Form(0.55),
    temperature: float = Form(0.75),
    ref_file: UploadFile = File(None),
    x_token: str = Header(None),
):
    global _cond_key
    try:
        if ref_file is not None:
            data = ref_file.file.read()
            ref_path = "temp_ref.wav"
            with open(ref_path, "wb") as f:
                f.write(data)
        elif os.path.exists(REF_DEFAULT):
            ref_path = REF_DEFAULT
            with open(ref_path, "rb") as f:
                data = f.read()
        else:
            raise HTTPException(status_code=400, detail="referans.wav bulunamadi")

        key = (hashlib.sha1(data).hexdigest(), round(exaggeration, 3))
        with GPU_LOCK:
            t0 = time.time()
            if key != _cond_key:
                tts.prepare_conditionals(ref_path, exaggeration=0.35)
                _cond_key = key
            wav = tts.generate(
                text,
                language_id=language,
                exaggeration=exaggeration,
                cfg_weight=cfg_weight,
                temperature=temperature,
            )
            elapsed = time.time() - t0

        arr = wav.squeeze(0).detach().cpu().numpy() if hasattr(wav, "detach") else wav
        buf = io.BytesIO()
        sf.write(buf, arr, tts.sr, format="WAV", subtype="PCM_16")
        print(f"[GPU SENTEZ TAMAM] {elapsed:.2f}s | {text[:60]}...", flush=True)
        return Response(
            content=buf.getvalue(),
            media_type="audio/wav",
            headers={"X-Generation-Time": f"{elapsed:.2f}"},
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": repr(e)})
"""
    with open("server.py", "w", encoding="utf-8") as f:
        f.write(SERVER_PY)

    import requests
    subprocess.run("pkill -9 -f 'uvicorn server:app'; pkill -9 -f cloudflared", shell=True)
    time.sleep(1)

    def tail(path, n=60):
        try:
            return "".join(open(path, encoding="utf-8", errors="replace").readlines()[-n:])
        except FileNotFoundError:
            return ""

    notify("STATUS: [4/4] Chatterbox GPU modeli bellege yukleniyor (~30 sn)...")
    server_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--host", "127.0.0.1", "--port", "8000"],
        stdout=open("server.log", "w"),
        stderr=subprocess.STDOUT,
        env=dict(os.environ, TRANSFORMERS_NO_TORCHVISION="1"),
    )

    t0 = time.time()
    ready = False
    while time.time() - t0 < 600:
        if server_proc.poll() is not None:
            break
        try:
            r = requests.get("http://127.0.0.1:8000/", timeout=3)
            if r.status_code == 200:
                ready = True
                break
        except Exception:
            pass
        time.sleep(2)

    if not ready:
        err_log = tail("server.log", 80)
        notify("ERROR: Sunucu baslatilamadi: " + err_log[-600:])
        print("❌ Sunucu başlatılamadı!\n" + err_log, flush=True)
        while True:
            time.sleep(10)
    else:
        info = requests.get("http://127.0.0.1:8000/").json()
        print(f"✅ GPU Model Hazır! Cihaz: {info.get('gpu_name')} ({info.get('vram_gb')} GB VRAM)", flush=True)

        def open_and_publish():
            log = open("tunnel.log", "w")
            tp = subprocess.Popen(
                ["./cloudflared", "tunnel", "--no-autoupdate", "--url", "http://127.0.0.1:8000"],
                stdout=log,
                stderr=subprocess.STDOUT,
            )
            url = None
            for _ in range(60):
                m = re.search(r"https://[a-z0-9-]+\.trycloudflare\.com", tail("tunnel.log", 200))
                if m:
                    url = m.group(0)
                    break
                time.sleep(1)
            if url:
                notify(url)
            return tp, url

        tunnel_proc, tunnel_url = open_and_publish()
        if not tunnel_url:
            notify("ERROR: Tunel acilamadi: " + tail("tunnel.log", 30)[-300:])
            while True:
                time.sleep(10)
        else:
            print("\n" + "=" * 75, flush=True)
            print("🎉 BAĞLANTI KURULDU! ANTIGRAVITY BU ADRESİ OTOMATİK ALGILADI!", flush=True)
            print(f"👉 CANLI GPU ADRESİNİZ: {tunnel_url}", flush=True)
            print("=" * 75 + "\n", flush=True)
            while True:
                time.sleep(25)
                if tunnel_url:
                    notify(tunnel_url)
                if server_proc.poll() is not None:
                    notify("ERROR: Sunucu durdu: " + tail("server.log", 30)[-300:])
                    break
                if tunnel_proc.poll() is not None:
                    tunnel_proc, tunnel_url = open_and_publish()
except Exception as e:
    notify("ERROR: Beklenmeyen hata: " + repr(e) + " | " + traceback.format_exc()[-400:])
    while True:
        time.sleep(10)
