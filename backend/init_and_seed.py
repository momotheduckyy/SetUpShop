#!/usr/bin/env python3
"""
Initialize database schemas and seed with sample data for Render deployment
This combines all initialization steps from init-database.sh
"""
import sys
import sqlite3
import os
from pathlib import Path
from datetime import date, timedelta

# Add repo directory to path
sys.path.append(str(Path(__file__).parent.parent / "repo"))

# Get DB_PATH from environment variable (Render sets this)
DB_DIR = os.getenv('DB_PATH', '/tmp/db')
DB_DIR_PATH = Path(DB_DIR)

# Create database directory
DB_DIR_PATH.mkdir(parents=True, exist_ok=True)

print(f"📁 Using database directory: {DB_DIR_PATH}")

# Database paths
EQUIPMENT_DB_PATH = DB_DIR_PATH / "equipment.db"
USERS_DB_PATH = DB_DIR_PATH / "users.db"
SHOP_SPACES_DB_PATH = DB_DIR_PATH / "shop_spaces.db"

# ============================================================================
# STEP 1: Initialize Equipment Database
# ============================================================================
def init_equipment_db():
    """Initialize equipment database schema"""
    print("\n1️⃣  Initializing equipment database...")

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

    with sqlite3.connect(EQUIPMENT_DB_PATH) as conn:
        conn.executescript(EQUIPMENT_SCHEMA)

    print(f"   ✅ Equipment database created at: {EQUIPMENT_DB_PATH}")

# ============================================================================
# STEP 2: Initialize Users Database
# ============================================================================
def init_users_db():
    """Initialize users database schema"""
    print("\n2️⃣  Initializing users database...")

    USERS_SCHEMA = """
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      shop_spaces TEXT DEFAULT '[]'
    );
    """

    with sqlite3.connect(USERS_DB_PATH) as conn:
        conn.executescript(USERS_SCHEMA)

    print(f"   ✅ Users database created at: {USERS_DB_PATH}")

# ============================================================================
# STEP 3: Initialize Shop Spaces Database
# ============================================================================
def init_shop_spaces_db():
    """Initialize shop spaces database schema"""
    print("\n3️⃣  Initializing shop spaces database...")

    SHOP_SPACES_SCHEMA = """
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS shop_spaces (
      shop_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      creation_timestamp TEXT NOT NULL,
      length REAL NOT NULL,
      width REAL NOT NULL,
      height REAL NOT NULL,
      equipment TEXT DEFAULT '[]'
    );
    """

    with sqlite3.connect(SHOP_SPACES_DB_PATH) as conn:
        conn.executescript(SHOP_SPACES_SCHEMA)

    print(f"   ✅ Shop spaces database created at: {SHOP_SPACES_DB_PATH}")

# ============================================================================
# STEP 4: Seed Databases with Sample Data
# ============================================================================
def seed_databases():
    """Seed all databases with sample data (matches local seed.py)"""
    print("\n4️⃣  Seeding databases with sample data...")

    # Import after databases are initialized
    from users_functions import add_user, check_usernames
    from equipment_library_db import (
        add_equipment_type, add_equipment_to_user, perform_maintenance,
        get_equipment_catalog
    )
    from shop_space_functions import create_shop_space, add_equipment_to_shop_space
    from models.placement import Position, EquipmentPlacement

    # Check if already seeded
    try:
        existing_users = check_usernames("")
        if existing_users:
            print("   ⚠️  Database already seeded with users:")
            for user in existing_users:
                print(f"      - {user['username']}")
            print("   ✅ Seeding skipped (already done)")
            return
    except Exception as e:
        print(f"   📝 No existing users found, proceeding with seeding...")

    # Create users
    print("   📝 Creating users...")
    users = [
        add_user("jsmith", "John Smith", "john.smith@example.com", "password123"),
        add_user("mjones", "Mary Jones", "mary.jones@example.com", "password456"),
        add_user("bwilson", "Bob Wilson", "bob.wilson@example.com", "password789"),
    ]
    print(f"   ✅ Created {len(users)} users")

    # Add equipment types
    print("   🔧 Adding equipment types...")
    if not get_equipment_catalog():
        add_equipment_type("Table Saw", '10" cabinet saw with 3 HP motor, 52" T-Glide fence, and SawStop safety brake.', 33.00, 34.00, 85.25, 30, "#f99", "SawStop", "PCS31230-TGP252", "Sawstop Tablesaw.jpeg")
        add_equipment_type("Band Saw", '15" bandsaw with 3 HP motor and 14" resaw capacity.', 34.38, 80.25, 30.25, 30, "#9f9", "Powermatic", "PM1500", "Powermatic band Saw.jpeg")
        add_equipment_type("Planer", 'Portable 13" planer with fan-assisted chip ejection and two-speed gearbox (96/179 CPI).', 22.00, 18.75, 22.00, 7, "#99f", "DeWALT", "DW735", "dewalt Planer.jpeg")
        add_equipment_type("Belt/Disc Sander", 'Combo sander with tilting belt and disc tables; dust port selector.', 36.00, 36.00, 36.00, 7, "#ff9", "Delta", "31-735", "Delta Combo Sander.jpeg")
        add_equipment_type("CNC Router", 'Heavy-duty 3-axis CNC router with 50" × 100" working area and 4 HP spindle.', 71, 54, 155, 30, "#cc0", "MultiCam", "Classic C-103", "MultiCAM Classic.jpeg")
        add_equipment_type("Drill Press", '16-speed drill press with 0.75 HP motor and tilting cast-iron table.', 20, 70, 28, 30, "#0cc", "DELTA", "18-900L", "Delta Drill Press.jpeg")
        add_equipment_type("Jointer", '8" jointer with 72" tables, 2 HP motor, and straight-knife cutterhead.', 25.625, 45.25, 70.875, 30, "#ccc", "JET", "JWJ-8CS", "jet jointer.jpeg")
        print("   ✅ Added 7 equipment types")

    # Add equipment to users
    print("   🛠️  Adding equipment to users...")
    today = date.today()

    # John's equipment
    eq1 = add_equipment_to_user(users[0]['id'], 2, "Primary bandsaw for resawing and curve cuts", (today - timedelta(days=365)).isoformat())
    eq2 = add_equipment_to_user(users[0]['id'], 3, "Thickness planer for milling rough stock", (today - timedelta(days=180)).isoformat())

    # Mary's equipment
    eq3 = add_equipment_to_user(users[1]['id'], 1, "Primary cabinet table saw with 52\" fence", (today - timedelta(days=730)).isoformat())
    eq4 = add_equipment_to_user(users[1]['id'], 4, "Combination belt/disc sander for edge sanding and cleanup", (today - timedelta(days=200)).isoformat())

    # Bob's equipment
    eq5 = add_equipment_to_user(users[2]['id'], 2, "Large bandsaw set up for general shop use", (today - timedelta(days=400)).isoformat())
    eq6 = add_equipment_to_user(users[2]['id'], 6, "Floor drill press for accurate hole drilling", (today - timedelta(days=150)).isoformat())
    print("   ✅ Added equipment to users")

    # Perform maintenance on some equipment
    print("   🔧 Recording maintenance history...")
    perform_maintenance(eq1['id'], (today - timedelta(days=3)).isoformat())
    perform_maintenance(eq3['id'], (today - timedelta(days=365)).isoformat())
    print("   ✅ Maintenance records added")

    # Create shop spaces
    print("   🏭 Creating shop spaces...")
    shop1 = create_shop_space("jsmith", "HomeShop", 500.0, 400.0, 300.0)
    shop2 = create_shop_space("mjones", "MainFacility", 800.0, 600.0, 350.0)
    shop3 = create_shop_space("bwilson", "FabShop", 700.0, 500.0, 320.0)
    print("   ✅ Created 3 shop spaces")

    # Add equipment to shops
    print("   📍 Placing equipment in shops...")
    placement1 = EquipmentPlacement(eq1['id'], Position(50.0, 50.0, 0.0))
    add_equipment_to_shop_space(shop1['shop_id'], placement1)

    placement2 = EquipmentPlacement(eq2['id'], Position(250.0, 50.0, 0.0))
    add_equipment_to_shop_space(shop1['shop_id'], placement2)

    placement3 = EquipmentPlacement(eq3['id'], Position(100.0, 100.0, 0.0))
    add_equipment_to_shop_space(shop2['shop_id'], placement3)

    placement4 = EquipmentPlacement(eq4['id'], Position(400.0, 150.0, 0.0))
    add_equipment_to_shop_space(shop2['shop_id'], placement4)

    placement5 = EquipmentPlacement(eq5['id'], Position(150.0, 100.0, 0.0))
    add_equipment_to_shop_space(shop3['shop_id'], placement5)

    placement6 = EquipmentPlacement(eq6['id'], Position(350.0, 150.0, 0.0))
    add_equipment_to_shop_space(shop3['shop_id'], placement6)
    print("   ✅ Equipment placed in shops")

# ============================================================================
# Main Execution
# ============================================================================
def main():
    """Run all initialization and seeding steps"""
    print("=" * 60)
    print("🚀 SetUpShop Database Initialization & Seeding")
    print("=" * 60)

    try:
        # Initialize all database schemas
        init_equipment_db()
        init_users_db()
        init_shop_spaces_db()

        # Seed with sample data
        seed_databases()

        print("\n" + "=" * 60)
        print("✨ Database initialization and seeding complete!")
        print("=" * 60)
        print("\n📋 Test credentials:")
        print("   Username: jsmith   | Password: password123")
        print("   Username: mjones   | Password: password456")
        print("   Username: bwilson  | Password: password789")
        print("\n🔗 Backend URL: https://setupshop-backend.onrender.com")
        print("🔗 Frontend URL: https://setupshop-frontend.onrender.com")
        print("\n")

    except Exception as e:
        print(f"\n❌ Error during initialization/seeding: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
