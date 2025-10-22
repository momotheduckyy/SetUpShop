# Set Up Shop - Quick Start Guide

This guide will help you get both the frontend and backend running.

## Project Structure

```
SetUpShop/
├── backend/          # Flask API server
│   ├── server.py     # Main server file
│   ├── routes/       # API route blueprints
│   │   ├── auth_routes.py
│   │   ├── equipment_routes.py
│   │   └── shop_routes.py
│   └── requirements.txt
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API client
│   │   └── styles/      # CSS files
│   ├── package.json
│   └── vite.config.js
├── repo/            # Database functions
│   ├── users_functions.py
│   ├── equipment_library_db.py
│   └── shop_space_functions.py
└── db/              # SQLite databases
    ├── users.db
    ├── equipment.db
    └── shop_spaces.db
```

## Setup Instructions

### Quick Start (Recommended)

Use the provided startup scripts:

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### Manual Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip3 install -r requirements.txt

# Start the Flask server
python3 server.py
```

The backend will run on `http://localhost:5001`

### 2. Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Using the Application

1. Open your browser to `http://localhost:3000`
2. You'll see the "Set Up Shop" login page
3. Click "Register" to create a new account
4. Fill in your details and register
5. You'll be automatically logged in and redirected to the dashboard

## API Testing

The authentication system is fully connected to your `users.db` database! You can test the API endpoints directly:

```bash
# Health check
curl http://localhost:5001/api/health

# Register a user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","name":"Test User","email":"test@example.com","password":"password123"}'

# Login with username
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"password123"}'

# Login with email
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password123"}'
```

**✅ Authentication Verified:**
- User registration creates entries in `db/users.db`
- Passwords are hashed with SHA256
- Login works with both username and email
- Invalid credentials are properly rejected

## Troubleshooting

### Backend Issues
- Make sure Flask and Flask-CORS are installed: `pip3 install -r requirements.txt`
- Check that port 5001 is available (changed from 5000 due to macOS AirPlay)
- Verify database files exist in the `db/` directory
- The backend server is already running if you see "Running on http://127.0.0.1:5001"

### Frontend Issues
- Make sure Node.js is installed (v16 or higher recommended)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that port 3000 is available
- Ensure the backend is running before starting the frontend

## Next Steps

- Implement equipment catalog browsing
- Add shop space creation and visualization
- Build equipment placement interface
- Add maintenance tracking features
