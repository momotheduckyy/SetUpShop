#!/usr/bin/env python3
"""
Migration script to add missing columns to equipment_types table
Run this if your equipment_types table is missing color, manufacturer, or model columns
"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "db" / "equipment.db"

def column_exists(cursor, table_name, column_name):
    """Check if a column exists in a table"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = [row[1] for row in cursor.fetchall()]
    return column_name in columns

def migrate():
    """Add missing columns to equipment_types table"""
    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        print("Run ./init-database.sh first")
        return

    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()

        # Check and add color column
        if not column_exists(cursor, 'equipment_types', 'color'):
            print("Adding 'color' column to equipment_types...")
            cursor.execute("ALTER TABLE equipment_types ADD COLUMN color TEXT DEFAULT '#aaa'")
            print("  ✓ Added 'color' column")
        else:
            print("  ✓ 'color' column already exists")

        # Check and add manufacturer column
        if not column_exists(cursor, 'equipment_types', 'manufacturer'):
            print("Adding 'manufacturer' column to equipment_types...")
            cursor.execute("ALTER TABLE equipment_types ADD COLUMN manufacturer TEXT")
            print("  ✓ Added 'manufacturer' column")
        else:
            print("  ✓ 'manufacturer' column already exists")

        # Check and add model column
        if not column_exists(cursor, 'equipment_types', 'model'):
            print("Adding 'model' column to equipment_types...")
            cursor.execute("ALTER TABLE equipment_types ADD COLUMN model TEXT")
            print("  ✓ Added 'model' column")
        else:
            print("  ✓ 'model' column already exists")

        conn.commit()
        print("\nMigration completed successfully!")

if __name__ == "__main__":
    migrate()
