# -*- coding: utf-8 -*-
"""Operis AI & Fuat Babadag — 7/24 Bulut Sosyal Medya Otopilotu (GitHub Actions).

Bilgisayar kapali olsa bile her gun Buffer kuyruklarini kontrol eder:
1. LinkedIn (Fuat Babadag): Onümüzdeki 7 gun boyunca her gun TSI 09:00 (UTC 06:00) icin
   eksik gun varsa Groq / OpenAI ile B2B AI icerigi uretir ve Buffer'a zamanlar.
2. Instagram (@operis_ai): Onümüzdeki 10 gun boyunca her gun TSI 16:30 (UTC 13:30) icin
   eksik gun varsa GitHub Release'deki 14 HD kurumsal hikayeden siradakini zamanlar.
"""
from __future__ import annotations

import datetime
import json
import os
import sys
import time
import requests

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BUFFER_URL = "https://api.buffer.com/"
ORG_ID = "6ad1d81fb6b63bd0b20142a1"
LINKEDIN_CHANNEL_ID = "6ad1de25778b240e2f26902a"
INSTAGRAM_CHANNEL_ID = "6ae1dcd92f1f5ed648fabd7e"

REPO = "scorsty-cmd/promtAPilot"
RELEASE_TAG = "operis-ig-2026-10-28"

STORIES = [
    "Story_01_Canli_Demo_Tanitim.jpg",
    "Story_02_Nasil_Calisir_3_Adim.jpg",
    "Story_03_Otel_Komisyon_Tasarrufu.jpg",
    "Story_04_Sonuclar_Veriler.jpg",
    "Story_05_SSS_Sik_Sorulanlar.jpg",
    "Story_06_Gece_02_Senaryosu.jpg",
    "Story_07_4_Dil_Destegi.jpg",
    "Story_08_Sesli_Mesaj_Whisper.jpg",
    "Story_09_Oda_Fotografi_Katalog.jpg",
    "Story_10_Kurumsal_Web_Sitesi_RoI.jpg",
    "Story_11_Sirket_Grup_Konaklama.jpg",
    "Story_12_Eski_Bot_vs_Operis.jpg",
    "Story_13_Yonetici_WhatsApp_Ozeti.jpg",
    "Story_14_14_Gun_Ucretsiz_Pilot.jpg",
]

GUN_TEMALARI = {
    0: "Pazartesi — Haftalık Yapay Zeka Haberleri, Trend Analizi ve İş Dünyasına Etkisi",
    1: "Salı — İş Süreçlerinde Yapay Zeka & Otomasyon Vaka Analizi (Öncesi / Sonrası Rakamlarla)",
    2: "Çarşamba — Build In Public & Araç İncelemesi (n8n, LLM Entegrasyonları, Akıllı Asistanlar)",
    3: "Perşembe — KOBİ ve Girişimciler İçin Operasyonel Verimlilik & Zaman Tasarrufu Tavsiyesi",
    4: "Cuma — Tartışma & Etkileşim Sorusu (Haftanın değerlendirmesi ve sektör anketi)",
    5: "Cumartesi — Hafta Sonu Vizyonu: İnsan + AI Çarpanı, Geleceğin Meslekleri ve Liderlik",
    6: "Pazar — Haftalık Özet, Pazar Motivasyonu ve Yeni Hafta Hazırlığı",
}


def get_scheduled_dates(token: str, channel_id: str) -> set[str]:
    q = """
    query($first: Int!, $input: PostsInput!) {
      posts(first: $first, input: $input) {
        edges {
          node {
            id
            dueAt
          }
        }
      }
    }
    """
    r = requests.post(
        BUFFER_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={
            "query": q,
            "variables": {
                "first": 20,
                "input": {
                    "organizationId": ORG_ID,
                    "filter": {"channelIds": [channel_id], "status": ["scheduled"]},
                },
            },
        },
        timeout=25,
    )
    r.raise_for_status()
    edges = r.json().get("data", {}).get("posts", {}).get("edges", [])
    dates = set()
    for e in edges:
        due = (e.get("node") or {}).get("dueAt")
        if due:
            dates.add(due.split("T")[0])
    return dates


def generate_linkedin_post(tema: str, tarih_str: str) -> str:
    groq_key = os.environ.get("GROQ_API_KEY", "").strip()
    openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
    prompt = f"""Sen Fuat Babadag'in LinkedIn profilini yoneten profesyonel bir B2B / AI Otomasyon icerik stratejistisin.
Profil sahibi: KOBİ'lerin ve girişimcilerin iş süreçlerini yapay zeka, otomasyon (n8n, Python, LLM asistanları) ile hızlandıran, build in public mantığıyla canlı tecrübe aktaran bir teknoloji lideri.

Günün Teması: {tema}
Hedef Yayın Tarihi: {tarih_str}

Lütfen LinkedIn için viral, yüksek etkileşimli, samimi ama son derece otoriter ve profesyonel bir metin yaz.
Kurallar:
1. İlk 2 satır güçlü bir kanca (hook) olmalı. Okuyucuyu "daha fazlasını gör"e bastırmalı.
2. Boş motivasyon cümleleri değil; somut senaryolar, gerçekçi iş dünyası örnekleri ve net dersler içermeli.
3. Kısa paragraflar ve madde işaretleri kullan (okunabilirlik yüksek olsun).
4. Sonda güçlü bir soru veya tartışma açıcı cümle ile okuyucuyu yoruma davet et (Call to Action).
5. En sona 4-6 adet sektörel hashtag ekle (örn: #YapayZeka #Otomasyon #Verimlilik #Girişimcilik #B2B).
6. Sadece LinkedIn post metnini üret, başına veya sonuna açıklama koyma."""

    if groq_key:
        for model in ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]:
            try:
                r = requests.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": [
                            {"role": "system", "content": "Sen LinkedIn için en kaliteli B2B yapay zeka ve otomasyon içeriklerini üreten bir stratejistsin."},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1200,
                    },
                    timeout=30,
                )
                if r.status_code == 200:
                    return r.json()["choices"][0]["message"]["content"].strip()
            except Exception as ex:
                print(f"[LinkedIn] Groq {model} uyarisi: {ex}")

    if openai_key:
        r = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {openai_key}", "Content-Type": "application/json"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "Sen LinkedIn için en kaliteli B2B yapay zeka ve otomasyon içeriklerini üreten bir stratejistsin."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
            },
            timeout=30,
        )
        if r.status_code == 200:
            return r.json()["choices"][0]["message"]["content"].strip()

    raise RuntimeError("LinkedIn postu uretilemedi (GROQ_API_KEY ve OPENAI_API_KEY basarisiz).")


def create_buffer_post(token: str, inp: dict) -> dict:
    mut = """
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        __typename
        ... on PostActionSuccess {
          post { id status dueAt }
        }
        ... on MutationError {
          message
        }
      }
    }
    """
    r = requests.post(
        BUFFER_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"query": mut, "variables": {"input": inp}},
        timeout=30,
    )
    r.raise_for_status()
    return r.json().get("data", {}).get("createPost", {})


def sync_linkedin(token: str) -> None:
    existing = get_scheduled_dates(token, LINKEDIN_CHANNEL_ID)
    print(f"[LinkedIn] Mevcut planli gunler: {sorted(existing)}")
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for offset in range(1, 8):
        target = today + datetime.timedelta(days=offset)
        day_str = target.isoformat()
        if day_str in existing:
            continue
        due_at = f"{day_str}T06:00:00.000Z"  # TSI 09:00
        tema = GUN_TEMALARI.get(target.weekday(), "Yapay Zeka ve İş Dünyası")
        text = generate_linkedin_post(tema, day_str)
        res = create_buffer_post(
            token,
            {
                "channelId": LINKEDIN_CHANNEL_ID,
                "text": text,
                "mode": "customScheduled",
                "dueAt": due_at,
                "schedulingType": "automatic",
                "needsApproval": False,
                "saveToDraft": False,
                "assets": [],
            },
        )
        if "post" in res:
            print(f"[LinkedIn PLANLANDI] {day_str} 09:00 TSI -> ID={res['post']['id']}")
            time.sleep(2)
        else:
            print(f"[LinkedIn BILGI] Durdu: {res}")
            break


def sync_instagram(token: str) -> None:
    existing = get_scheduled_dates(token, INSTAGRAM_CHANNEL_ID)
    print(f"[Instagram] Mevcut planli gunler: {sorted(existing)}")
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for offset in range(1, 11):
        target = today + datetime.timedelta(days=offset)
        day_str = target.isoformat()
        if day_str in existing:
            continue
        due_at = f"{day_str}T13:30:00.000Z"  # TSI 16:30
        story_idx = target.timetuple().tm_yday % len(STORIES)
        dosya = STORIES[story_idx]
        url = f"https://github.com/{REPO}/releases/download/{RELEASE_TAG}/{dosya}"
        res = create_buffer_post(
            token,
            {
                "channelId": INSTAGRAM_CHANNEL_ID,
                "text": "",
                "mode": "customScheduled",
                "dueAt": due_at,
                "schedulingType": "automatic",
                "needsApproval": False,
                "assets": [{"image": {"url": url}}],
                "metadata": {"instagram": {"type": "story", "shouldShareToFeed": False}},
            },
        )
        if "post" in res:
            print(f"[Instagram PLANLANDI] {day_str} 16:30 TSI -> {dosya} (ID={res['post']['id']})")
            time.sleep(1)
        else:
            print(f"[Instagram BILGI] Kuyruk dolu/durdu: {res}")
            break


def main() -> None:
    token = os.environ.get("BUFFER_ACCESS_TOKEN", "").strip()
    if not token:
        raise RuntimeError("BUFFER_ACCESS_TOKEN tanimli degil!")
    sync_linkedin(token)
    sync_instagram(token)


if __name__ == "__main__":
    main()
