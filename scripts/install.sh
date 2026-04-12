#!/bin/bash

# Change to project root
cd "$(dirname "$0")/.."

echo "Installing Python dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo "Installing Ollama..."
curl -fsSL https://ollama.ai/install.sh | sh

echo "Pulling Gemma3:1b model..."
ollama pull gemma3:1b

echo "Installation complete!"