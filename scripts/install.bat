@echo off
REM Change to project root
cd %~dp0..

echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo Installing Ollama...
winget install Ollama.Ollama

echo Pulling Gemma3:1b model...
ollama pull gemma3:1b

echo Installation complete!
pause