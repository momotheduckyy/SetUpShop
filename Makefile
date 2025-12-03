# Makefile at repo root

# Initialize all databases (schemas + equipment catalog only)
init-db:
	python3 equipment_seed.py

# Reset all databases (DELETES data) and re-initialize
reset-db:
	rm -f db/users.db db/equipment.db db/shop_spaces.db
	python3 equipment_seed.py

# Run only the backend (Flask)
backend:
	cd backend && python3 server.py

# Run only the frontend (Vite)
frontend:
	cd frontend && npm run dev

# Run backend + frontend together (ensure DBs exist first)
dev:
	python3 equipment_seed.py
	cd backend && python3 server.py & \
	cd frontend && npm run dev

# Stop backend process cleanly
dev-stop:
	pkill -f "backend/server.py" || true
