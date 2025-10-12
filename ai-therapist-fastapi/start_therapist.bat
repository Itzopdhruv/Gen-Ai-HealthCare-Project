@echo off
echo 🚀 Starting AI Therapist with Groq...
echo.

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Check if virtual environment is activated
if not defined VIRTUAL_ENV (
    echo ❌ Virtual environment not activated!
    echo Please run: venv\Scripts\activate.bat
    pause
    exit /b 1
)

echo ✅ Virtual environment activated

REM Install/update dependencies
echo 📦 Installing dependencies...
pip install -r requirements.txt

REM Test setup
echo 🧪 Testing setup...
python test_setup.py

REM Start the AI Therapist
echo 🚀 Starting AI Therapist...
echo 🌐 Will be available at: http://localhost:8001
echo 📚 API docs at: http://localhost:8001/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main_simple.py

pause
