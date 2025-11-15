# Makefile at repo root

# Run only the backend (Flask)
backend:
	cd backend && python3 server.py

# Run only the frontend (Vite)
frontend:
	cd frontend && npm run dev

# Run backend + frontend together
dev:
	cd backend && python3 server.py & \
	cd frontend && npm run dev

# Stop backend process cleanly
dev-stop:
	pkill -f "backend/server.py" || true
