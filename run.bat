@echo off
echo ========================================
echo  Drama BGM Player - Starting Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from python.org and try again.
    pause
    exit /b 1
)

REM Check if requirements are installed
echo Installing dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ERROR: Failed to install dependencies.
    echo Try running: pip install Flask
    pause
    exit /b 1
)

echo.
echo Starting the server...
echo The browser will open automatically.
echo Press Ctrl+C to stop the server.
echo ========================================
echo.

python app.py
