@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo J.A.R.V.I.S. kuruluyor...
python -m venv .venv || (echo Python bulunamadi. https://python.org adresinden Python 3.10+ kurun. & pause & exit /b 1)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul
pip install -r requirements.txt
set /p SES="Sesli mod paketleri de kurulsun mu? (e/h): "
if /i "%SES%"=="e" pip install SpeechRecognition pyaudio pyttsx3
if not exist .env copy .env.example .env >nul
echo.
echo Kurulum tamam. Simdi .env dosyasini acip ANTHROPIC_API_KEY degerini yazin.
notepad .env
pause
