@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "LIST="
for %%i in (0 1 2 3 4 5 6) do (
  set "F="
  for %%f in ("MG1177.part%%i*") do set "F=%%~nxf"
  if not defined F (
    echo HATA: MG1177.part%%i bulunamadi. 7 parcanin hepsini bu klasore indirin.
    pause
    exit /b 1
  )
  if defined LIST (set "LIST=!LIST!+"!F!"") else (set "LIST="!F!"")
)
copy /b !LIST! "Montgisard_1177.mp4"
if exist "Montgisard_1177.mp4" (echo TAMAM: Montgisard_1177.mp4 hazir.) else (echo HATA: birlestirme basarisiz.)
pause
