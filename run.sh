#!/bin/bash

echo "========================================"
echo "  🎭 Drama BGM Player - Starting Server"
echo "========================================"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 not found. Install Python 3 and try again."
    exit 1
fi

# Install requirements
echo "Installing dependencies..."
pip3 install -r requirements.txt --quiet

echo ""
echo "Starting server at http://localhost:5000"
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

python3 app.py
