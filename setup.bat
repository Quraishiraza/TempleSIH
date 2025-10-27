@echo off
REM Trinetra Setup Script for Windows
REM Smart India Hackathon 2025

echo ================================================================
echo          TRINETRA - AUTOMATED SETUP (Windows)
echo ================================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found. Please install Node.js v18+
    pause
    exit /b 1
)
echo [OK] Node.js found
node -v

REM Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)
echo [OK] Python found
python --version

echo.
echo Installing dependencies...
echo.

REM Frontend
echo 1. Setting up Frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo [X] Frontend setup failed
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend ready
echo.

REM Data Server
echo 2. Setting up Data Server...
cd data-server
call npm install
if %errorlevel% neq 0 (
    echo [X] Data Server setup failed
    pause
    exit /b 1
)
cd ..
echo [OK] Data Server ready
echo.

REM ML Service
echo 3. Setting up ML Service...
cd ml-service
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [X] ML Service setup failed
    pause
    exit /b 1
)
call deactivate
cd ..
echo [OK] ML Service ready
echo.

REM YOLO Service
echo 4. Setting up YOLO Service...
cd yolo-service
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [X] YOLO Service setup failed
    pause
    exit /b 1
)
call deactivate
cd ..
echo [OK] YOLO Service ready
echo.

echo ================================================================
echo          SETUP COMPLETE!
echo ================================================================
echo.
echo To start the application, open 4 command prompts and run:
echo.
echo Terminal 1 (Frontend):
echo   cd frontend ^&^& npm run dev
echo.
echo Terminal 2 (Data Server):
echo   cd data-server ^&^& node server.js
echo.
echo Terminal 3 (ML Service):
echo   cd ml-service ^&^& venv\Scripts\activate ^&^& python app.py
echo.
echo Terminal 4 (YOLO Service):
echo   cd yolo-service ^&^& venv\Scripts\activate ^&^& python app_video3.py
echo.
echo Then open: http://localhost:3000
echo Login: al1@gamil.com / password
echo.
echo For detailed instructions, see SETUP_INSTRUCTIONS.md
echo.
pause

