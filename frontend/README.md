# Set Up Shop - Frontend

React frontend application for the Set Up Shop workshop designer.

## Getting Started

### Installation

```bash
cd frontend
npm install
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- User authentication (login/register)
- Modern, responsive design with gradient theming
- Connected to backend API for user management
- Dashboard with equipment and shop space management interface

## API Integration

The frontend connects to the Flask backend running on `http://localhost:5000/api`

All API calls are handled through the `src/services/api.js` module.
