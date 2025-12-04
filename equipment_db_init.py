# equipment_db_init.py
# Standalone initializer for the ES database.
# Creates db/equipment.db and required tables.

import sqlite3
from pathlib import Path

# Where we store the equipment database
DB_PATH = Path(__file__).parent / "db" / "equipment.db"

EQUIPMENT_SCHEMA = """
PRAGMA foreign_keys = ON;

-- Equipment types catalog (types of equipment available)
CREATE TABLE IF NOT EXISTS equipment_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_name TEXT NOT NULL UNIQUE,
    description TEXT,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    depth INTEGER NOT NULL,
    maintenance_interval_days INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    color TEXT DEFAULT '#aaa',
    manufacturer TEXT,
    model TEXT,
    image_path TEXT
);

-- Actual equipment that users own
CREATE TABLE IF NOT EXISTS user_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_type_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    date_purchased TEXT NOT NULL,
    last_maintenance_date TEXT,
    next_maintenance_date TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id) ON DELETE CASCADE
);
"""

def init_equipment_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(EQUIPMENT_SCHEMA)

    print(f"Equipment DB initialized at: {DB_PATH.resolve()}")

if __name__ == "__main__":
    init_equipment_db()

