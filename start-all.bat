@echo off
title CrisisConnect Local Runner (Without Docker)
echo ============================================================
echo   CrisisConnect - Launching Full Stack Locally
echo ============================================================
echo.

REM Auto-detect Node.js / npm in common Windows install locations if not in PATH
if exist "C:\Program Files\nodejs\npm.cmd" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "C:\Program Files (x86)\nodejs\npm.cmd" set "PATH=C:\Program Files (x86)\nodejs;%PATH%"
if exist "%LOCALAPPDATA%\Programs\nodejs\npm.cmd" set "PATH=%LOCALAPPDATA%\Programs\nodejs;%PATH%"


REM Setup .env files if not already present
if not exist "server\.env" if exist "server\.env.example" copy "server\.env.example" "server\.env" >nul
if not exist "client\.env" if exist "client\.env.example" copy "client\.env.example" "client\.env" >nul
if not exist "ai-service\.env" if exist "ai-service\.env.example" copy "ai-service\.env.example" "ai-service\.env" >nul

REM 1. Start Python AI Microservice in a new terminal
echo [1/3] Starting Python FastAPI AI Microservice on port 8000...
start "CrisisConnect - Python AI Service" cmd /k "cd ai-service && echo [*] Installing/verifying Python requirements... && python -m pip install -r requirements.txt && echo [*] Starting FastAPI server on http://localhost:8000 ... && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================================
    echo [!] WARNING: Node.js / npm was NOT found on your system PATH!
    echo     Please install Node.js LTS version from:
    echo     https://nodejs.org
    echo     Make sure to check Add to PATH during installation.
    echo ============================================================
    echo.
)

REM 2. Start Node.js Express & Socket.io Server in a new terminal
echo [2/3] Starting Node.js Backend Server on port 5000...
start "CrisisConnect - Node Backend" cmd /k "cd server && echo [*] Checking Node dependencies... && (if not exist node_modules (echo [*] Downloading server packages... && npm install --no-audit --no-fund --progress=false)) && echo [*] Starting Node.js Express Server... && npm start"

REM 3. Start React Frontend Client in a new terminal
echo [3/3] Starting React Client on port 5173...
start "CrisisConnect - React Client" cmd /k "cd client && echo [*] Checking React dependencies... && (if not exist node_modules (echo [*] Downloading client packages... && npm install --no-audit --no-fund --progress=false)) && echo [*] Launching Vite Dev Server... && npm run dev"




echo.
echo ============================================================
echo   Services are starting!
echo   - Frontend:   http://localhost:5173
echo   - Node API:   http://localhost:5000/api
echo   - Python AI:  http://localhost:8000/docs
echo ============================================================
echo.
pause
