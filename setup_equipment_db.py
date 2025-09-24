import sqlite3 #import sqlite
from pathlib import Path

# Make equipment databse path
DB_PATH = Path(__file__).with_name("equipment.db")

# Updated equipment database schema with numerical maintenance intervals
DDL = """
-- Equipment types catalog (templates/types of equipment available)
CREATE TABLE IF NOT EXISTS equipment_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_name TEXT NOT NULL,
    description TEXT NOT NULL,
    width INTEGER NOT NULL,           -- dimensions 
    height INTEGER NOT NULL,
    depth INTEGER NOT NULL,
    maintenance_interval_days INTEGER NOT NULL,  -- maintenance interval in days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User equipment instances (actual equipment that users own)
CREATE TABLE IF NOT EXISTS user_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipment_type_id INTEGER NOT NULL,  -- which type of equipment from catalog
    user_id INTEGER NOT NULL,            -- which user owns this instance
    date_purchased DATE DEFAULT CURRENT_DATE,
    last_maintenance_date DATE,          -- when maintenance was last performed
    next_maintenance_date DATE,          -- when next maintenance is due
    notes TEXT,                          -- user notes about this specific item
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_type_id) REFERENCES equipment_types(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_equipment_user ON user_equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_user_equipment_type ON user_equipment(equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_user_equipment_next_maintenance ON user_equipment(next_maintenance_date);
"""

def init_equipment_db(db_path: Path = DB_PATH):
    """Initialize the equipment database with available equipment types"""
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.executescript(DDL)
        
        # Add the 4 equipment types with numerical maintenance intervals (in days)
        cursor = conn.execute("SELECT COUNT(*) FROM equipment_types")
        if cursor.fetchone()[0] == 0:
            equipment_types = [
                # (name, description, width, height, depth, maintenance_days)
                ("Industrial Oven", "High-temperature industrial oven for heat treatment and manufacturing", 200, 150, 120, 3650),  # 10 years
                ("Lathe", "Precision metal turning lathe for machining operations", 180, 100, 80, 7),      # weekly
                ("Drill Press", "Variable speed drill press for accurate hole drilling", 60, 120, 40, 30),     # monthly
                ("Welding Machine", "MIG welding machine for metal fabrication projects", 100, 80, 60, 365)    # annual
            ]
            
            conn.executemany(
                "INSERT INTO equipment_types (equipment_name, description, width, height, depth, maintenance_interval_days) VALUES (?, ?, ?, ?, ?, ?)",
                equipment_types
            )
            conn.commit()
            print(f"Added {len(equipment_types)} peices of equipment")
            
            # Display the maintenance schedule
            print("\nMaintenance Schedule:")
            for name, _, _, _, _, days in equipment_types:
                if days >= 365:
                    years = days / 365
                    print(f"  {name}: Every {years:.1f} year(s) ({days} days)")
                elif days >= 30:
                    months = days / 30
                    print(f"  {name}: Every {months:.1f} month(s) ({days} days)")
                else:
                    print(f"  {name}: Every {days} days")

if __name__ == "__main__":
    init_equipment_db()
    print(f"\nInitialized {DB_PATH}")

