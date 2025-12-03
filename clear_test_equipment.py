#!/usr/bin/env python3
"""
Script to clear test equipment from the equipment database
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "db" / "equipment.db"

def clear_test_equipment():
    """Delete all test/sample equipment from the database"""

    if not DB_PATH.exists():
        print(f"Database not found at {DB_PATH}")
        return

    try:
        with sqlite3.connect(DB_PATH, timeout=10.0) as conn:
            cursor = conn.cursor()

            # Get count before deletion
            cursor.execute("SELECT COUNT(*) FROM equipment_types WHERE equipment_name LIKE 'Test Saw%' OR equipment_name LIKE 'Other Saw%'")
            count_before = cursor.fetchone()[0]

            print(f"Found {count_before} test equipment entries to delete")

            if count_before == 0:
                print("No test equipment found. Database is clean!")
                return

            # Delete test equipment
            cursor.execute("""
                DELETE FROM equipment_types
                WHERE equipment_name LIKE 'Test Saw%'
                   OR equipment_name LIKE 'Other Saw%'
            """)

            # Also clean up any orphaned user_equipment entries
            cursor.execute("""
                DELETE FROM user_equipment
                WHERE equipment_type_id NOT IN (SELECT id FROM equipment_types)
            """)

            conn.commit()

            # Verify deletion
            cursor.execute("SELECT COUNT(*) FROM equipment_types")
            count_after = cursor.fetchone()[0]

            print(f"\n✓ Successfully deleted {count_before} test equipment entries")
            print(f"✓ {count_after} equipment types remain in the database")

            # Show remaining equipment
            cursor.execute("SELECT id, equipment_name FROM equipment_types ORDER BY id")
            remaining = cursor.fetchall()

            if remaining:
                print("\nRemaining equipment types:")
                for eq_id, eq_name in remaining:
                    print(f"  {eq_id}: {eq_name}")

    except sqlite3.OperationalError as e:
        if "locked" in str(e):
            print("\n✗ Database is locked. Please stop the backend server first:")
            print("  1. Stop the Flask server (Ctrl+C in the terminal running it)")
            print("  2. Run this script again")
        else:
            print(f"Error: {e}")
    except Exception as e:
        print(f"Error clearing test equipment: {e}")

if __name__ == "__main__":
    print("Clearing test equipment from database...\n")
    clear_test_equipment()
