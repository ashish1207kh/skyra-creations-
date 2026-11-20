@echo off
echo ========================================================
echo       Starting Skyra Creations Platform (Vercel Stack)
echo       Frontend + Vercel Serverless API on Vite
echo ========================================================
echo.
cd /d "%~dp0"
echo Launching development server on http://localhost:5173 ...
call npm.cmd run dev
pause
