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
from models.placement import Position, EquipmentPlacement


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
    # Dimensions are in inches (width, height, depth)
    if not get_equipment_catalog():
        add_equipment_type("Table Saw", "Professional table saw", 36, 36, 36, 90, "#f99", "DeWalt", "DW745")
        add_equipment_type("Band Saw", "14-inch band saw", 24, 48, 24, 180, "#9f9", "Grizzly", "G0555")
        add_equipment_type("Jointer", "8-inch jointer", 72, 36, 24, 120, "#99f", "Jet", "JJ-8")
        add_equipment_type("Planer", "13-inch thickness planer", 36, 24, 24, 60, "#ff9", "DeWalt", "DW735")
        add_equipment_type("Air Compressor", "60-gallon air compressor", 120, 60, 80, 365, "#aaa", "Quincy", "QT-54")
        add_equipment_type("Milling Machine", "Vertical milling machine", 200, 72, 150, 90, "#aaa", "Bridgeport", "Series I")
        add_equipment_type("Grinder", "8-inch bench grinder", 50, 12, 40, 180, "#aaa", "Baldor", "8120W")
    
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
    
    # Add equipment to shops using EquipmentPlacement objects
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
    
    print("Database seeded successfully!")


if __name__ == "__main__":
    seed_database()
