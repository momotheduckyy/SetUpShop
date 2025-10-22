#!/bin/bash

# Start the Flask backend server

echo "Starting Set Up Shop Backend Server..."
echo "========================================"

cd backend

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Flask not found. Installing dependencies..."
    pip3 install -r requirements.txt
fi

echo ""
echo "Starting server on http://localhost:5001"
echo "Press Ctrl+C to stop"
echo ""

python3 server.py
