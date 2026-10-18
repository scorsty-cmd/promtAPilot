"""Opsiyonel sesli mod: mikrofon ile dinleme ve sesli yanıt.

Gerekli paketler: pip install SpeechRecognition pyaudio pyttsx3
"""

import re


class Voice:
    def __init__(self, language: str = "tr-TR"):
        import pyttsx3
        import speech_recognition as sr

        self.sr = sr
        self.language = language
        self.recognizer = sr.Recognizer()
        self.recognizer.pause_threshold = 0.9
        self.engine = pyttsx3.init()
        self.engine.setProperty("rate", 185)
        for v in self.engine.getProperty("voices"):
            if "tr" in (v.id + v.name).lower() or "turk" in v.name.lower():
                self.engine.setProperty("voice", v.id)
                break

    def listen(self, timeout: float = 8, phrase_limit: float = 30) -> str | None:
        with self.sr.Microphone() as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.4)
            try:
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_limit)
            except self.sr.WaitTimeoutError:
                return None
        try:
            return self.recognizer.recognize_google(audio, language=self.language)
        except (self.sr.UnknownValueError, self.sr.RequestError):
            return None

    def speak(self, text: str) -> None:
        clean = re.sub(r"```.*?```", " (kod ekranda) ", text, flags=re.S)
        clean = re.sub(r"[*_#`>|]", "", clean)
        clean = re.sub(r"https?://\S+", "bağlantı", clean)
        if clean.strip():
            self.engine.say(clean[:1500])
            self.engine.runAndWait()
