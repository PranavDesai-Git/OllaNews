@echo off
echo Starting OllaNews...

REM Change to project root
cd %~dp0..

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Open browser
start http://localhost:5000

REM Run the Flask app
python app.py