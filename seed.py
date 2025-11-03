import sys
from pathlib import Path
from datetime import date, timedelta

# Add repo directory to path to import the function modules
repo_path = Path(__file__).parent / "repo"
if repo_path.exists():
    sys.path.insert(0, str(repo_path))
else:
    sys.path.insert(0, str(Path(__file__).parent))

from users_functions import add_user, check_usernames
from equipment_library_db import (
    add_equipment_type, add_equipment_to_user, perform_maintenance,
    get_equipment_catalog, get_equipment_by_user
)
from shop_space_functions import create_shop_space, add_equipment_to_shop_space


def seed_database():
    """Seed all databases with sample data"""
    
    # Check if already seeded
    existing_users = check_usernames("")  # Empty string matches all users
    if existing_users:
        print("Db already seeded")
        return

    # Create users
    users = [
        add_user("jsmith", "John Smith", "john.smith@example.com", "password123"),
        add_user("mjones", "Mary Jones", "mary.jones@example.com", "password456"),
        add_user("bwilson", "Bob Wilson", "bob.wilson@example.com", "password789"),
    ]
    
    # Add equipment types if catalog is empty
    if not get_equipment_catalog():
        add_equipment_type("Industrial Oven", "High-temperature oven", 200, 150, 120, 3650)
        add_equipment_type("Lathe", "Precision metal lathe", 180, 100, 80, 7)
        add_equipment_type("Drill Press", "Variable speed drill press", 60, 120, 40, 30)
        add_equipment_type("Welding Machine", "MIG welding machine", 100, 80, 60, 365)
    
    # Add equipment to users
    today = date.today()
    
    # John's equipment
    eq1 = add_equipment_to_user(users[0]['id'], 2, "Primary lathe", (today - timedelta(days=365)).isoformat())
    eq2 = add_equipment_to_user(users[0]['id'], 3, "Drill press", (today - timedelta(days=180)).isoformat())
    
    # Mary's equipment
    eq3 = add_equipment_to_user(users[1]['id'], 1, "Heat treatment oven", (today - timedelta(days=730)).isoformat())
    eq4 = add_equipment_to_user(users[1]['id'], 4, "Welding station", (today - timedelta(days=200)).isoformat())
    
    # Bob's equipment
    eq5 = add_equipment_to_user(users[2]['id'], 2, "Large lathe", (today - timedelta(days=400)).isoformat())
    eq6 = add_equipment_to_user(users[2]['id'], 3, "Floor drill press", (today - timedelta(days=150)).isoformat())
    
    # Perform maintenance on some equipment
    perform_maintenance(eq1['id'], (today - timedelta(days=3)).isoformat())
    perform_maintenance(eq3['id'], (today - timedelta(days=365)).isoformat())
    
    # Create shop spaces
    shop1 = create_shop_space("jsmith", "HomeShop", 500.0, 400.0, 300.0)
    shop2 = create_shop_space("mjones", "MainFacility", 800.0, 600.0, 350.0)
    shop3 = create_shop_space("bwilson", "FabShop", 700.0, 500.0, 320.0)
    
    # Add equipment to shops
    add_equipment_to_shop_space(shop1['shop_id'], eq1['id'], 50.0, 50.0, 0.0)
    add_equipment_to_shop_space(shop1['shop_id'], eq2['id'], 250.0, 50.0, 0.0)
    
    add_equipment_to_shop_space(shop2['shop_id'], eq3['id'], 100.0, 100.0, 0.0)
    add_equipment_to_shop_space(shop2['shop_id'], eq4['id'], 400.0, 150.0, 0.0)
    
    add_equipment_to_shop_space(shop3['shop_id'], eq5['id'], 150.0, 100.0, 0.0)
    add_equipment_to_shop_space(shop3['shop_id'], eq6['id'], 350.0, 150.0, 0.0)
    
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed_database()
