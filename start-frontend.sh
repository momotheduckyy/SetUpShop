#!/bin/bash

# Start the React frontend development server

echo "Starting Set Up Shop Frontend..."
echo "========================================"

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Dependencies not found. Installing..."
    npm install
fi

echo ""
echo "Starting development server on http://localhost:3000"
echo "Press Ctrl+C to stop"
echo ""

npm run dev
