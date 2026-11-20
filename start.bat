@echo off
echo ========================================================
echo       Starting Skyra Creations Platform
echo ========================================================
echo.
cd /d "%~dp0backend"
echo Launching unified FastAPI server on http://127.0.0.1:8000 ...
py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
