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
        add_equipment_type("Table Saw", '10" cabinet saw with 3 HP motor, 52" T-Glide fence, and SawStop safety brake.', 33.00, 34.00, 85.25, 30, "#f99", "SawStop", "PCS31230-TGP252", "Sawstop Tablesaw.jpeg")
        add_equipment_type("Band Saw", '15" bandsaw with 3 HP motor and 14" resaw capacity.', 34.38, 80.25, 30.25, 30, "#9f9", "Powermatic", "PM1500", "Powermatic band Saw.jpeg")
        add_equipment_type("Planer", 'Portable 13" planer with fan-assisted chip ejection and two-speed gearbox (96/179 CPI).', 22.00, 18.75, 22.00, 7, "#99f", "DeWALT", "DW735", "dewalt Planer.jpeg")
        add_equipment_type("Belt/Disc Sander", 'Combo sander with tilting belt and disc tables; dust port selector.', 36.00, 36.00, 36.00, 7, "#ff9", "Delta", "31-735", "Delta Combo Sander.jpeg")
        add_equipment_type("CNC Router", 'Heavy-duty 3-axis CNC router with 50" × 100" working area and 4 HP spindle.', 71, 54, 155, 30, "#cc0", "MultiCam", "Classic C-103", "MultiCAM Classic.jpeg")
        add_equipment_type("Drill Press", '16-speed drill press with 0.75 HP motor and tilting cast-iron table.', 20, 70, 28, 30, "#0cc", "DELTA", "18-900L", "Delta Drill Press.jpeg")
        add_equipment_type("Jointer", '8" jointer with 72" tables, 2 HP motor, and straight-knife cutterhead.', 25.625, 45.25, 70.875, 30, "#ccc", "JET", "JWJ-8CS", "jet jointer.jpeg")

        # Add equipment to users
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
