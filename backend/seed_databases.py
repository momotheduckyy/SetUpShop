#!/usr/bin/env python3
"""
Seed databases with initial demo data for Render deployment
"""
import sys
from pathlib import Path

# Add repo directory to path
sys.path.append(str(Path(__file__).parent.parent / "repo"))

from users_functions import add_user
from equipment_library_db import add_equipment_type

def seed_databases():
    """Initialize databases with demo data"""
    print("🌱 Seeding databases...")

    # Create demo user
    try:
        print("\n📝 Creating demo user...")
        demo_user = add_user(
            username="demo",
            name="Demo User",
            email="demo@setupshop.com",
            password="demo123"
        )
        if demo_user:
            print(f"✅ Demo user created: {demo_user['username']}")
        else:
            print("⚠️  Demo user might already exist")
    except Exception as e:
        print(f"⚠️  Error creating demo user: {e}")

    # Add sample equipment types
    print("\n🔧 Adding sample equipment...")
    equipment_samples = [
        {
            "name": "Table Saw",
            "manufacturer": "Demo Corp",
            "model_number": "TS-1000",
            "category": "Power Tools",
            "width": 30,
            "length": 60,
            "height": 40,
            "maintenance_interval_days": 90,
            "image_url": "/equipment-images/table-saw.jpg"
        },
        {
            "name": "Drill Press",
            "manufacturer": "Demo Corp",
            "model_number": "DP-500",
            "category": "Power Tools",
            "width": 20,
            "length": 20,
            "height": 60,
            "maintenance_interval_days": 180,
            "image_url": "/equipment-images/drill-press.jpg"
        },
        {
            "name": "Workbench",
            "manufacturer": "Demo Corp",
            "model_number": "WB-100",
            "category": "Furniture",
            "width": 36,
            "length": 72,
            "height": 36,
            "maintenance_interval_days": 365,
            "image_url": "/equipment-images/workbench.jpg"
        }
    ]

    for equipment in equipment_samples:
        try:
            result = add_equipment_type(**equipment)
            if result:
                print(f"✅ Added: {equipment['name']}")
            else:
                print(f"⚠️  {equipment['name']} might already exist")
        except Exception as e:
            print(f"⚠️  Error adding {equipment['name']}: {e}")

    print("\n✨ Database seeding complete!")
    print("\n📋 Demo credentials:")
    print("   Username: demo")
    print("   Password: demo123")

if __name__ == "__main__":
    seed_databases()
