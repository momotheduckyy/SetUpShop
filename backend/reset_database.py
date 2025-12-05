#!/usr/bin/env python3
"""
Reset database by clearing all data and reseeding
Use this when you want to start fresh with clean sample data
"""
import os
import sys
from pathlib import Path

# Get DB_PATH from environment variable
DB_DIR = os.getenv('DB_PATH', '/tmp/db')
DB_DIR_PATH = Path(DB_DIR)

print("=" * 60)
print("🗑️  Database Reset Script")
print("=" * 60)
print(f"\n📁 Database directory: {DB_DIR_PATH}")

# Delete all database files
print("\n🗑️  Deleting existing database files...")
deleted_count = 0
for db_file in DB_DIR_PATH.glob("*.db"):
    print(f"   Deleting: {db_file.name}")
    db_file.unlink()
    deleted_count += 1

if deleted_count > 0:
    print(f"✅ Deleted {deleted_count} database file(s)")
else:
    print("⚠️  No database files found to delete")

# Now run the init and seed script
print("\n🌱 Running init_and_seed.py to create fresh databases...")
print("=" * 60)

# Import and run the init_and_seed script
sys.path.insert(0, str(Path(__file__).parent))
from init_and_seed import main as init_and_seed_main

init_and_seed_main()

print("\n" + "=" * 60)
print("✅ Database reset complete!")
print("=" * 60)
