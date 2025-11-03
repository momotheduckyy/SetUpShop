import sys
from pathlib import Path
from random import uniform, choice

# Add repo directory to Python path so we can import functions
repo_path = Path(__file__).parent / "repo"
sys.path.insert(0, str(repo_path))

from shop_space_functions import create_shop_space, get_all_shop_spaces
from users_functions import check_usernames  # Use this to get all users

# List of random shop names to assign
SHOP_NAMES = [
    "Main Workshop", "Tool Shed", "Garage Bay", "Industrial Zone",
    "Fabrication Lab", "Assembly Station", "Machine Shop", "Welding Bay",
    "Paint Booth", "Wood Shop", "Metal Works", "Prototype Lab"
]

def seed_shop_spaces():
    """Create random shop spaces for all existing users"""
    
    # Check if shop spaces already exist to avoid duplicates
    existing_shops = get_all_shop_spaces()
    if existing_shops:
        print(f"Shop spaces already seeded ({len(existing_shops)} spaces found)")
        return
    
    # Get all users by searching for empty string (matches all users)
    users = check_usernames("")
    if not users:
        print("No users found. Run seed.py first to create users")
        return
    
    print(f"Creating shop spaces for {len(users)} users...")
    created_count = 0
    
    # Create 2-3 shop spaces per user
    for user in users:
        username = user['username']
        num_spaces = choice([2, 3])  # Random number of shops per user
        
        for i in range(num_spaces):
            # Pick a shop name from the list
            shop_name = SHOP_NAMES[created_count % len(SHOP_NAMES)]
            
            # Generate random dimensions (in feet)
            length = round(uniform(30.0, 80.0), 1)  # 30-80 feet
            width = round(uniform(20.0, 60.0), 1)   # 20-60 feet
            height = round(uniform(10.0, 15.0), 1)  # 10-15 feet
            
            try:
                # Create the shop space in database
                create_shop_space(username, shop_name, length, width, height)
                print(f"  ✓ Created '{shop_name}' for {username}")
                created_count += 1
            except Exception as e:
                print(f"  ✗ Failed: {e}")
    
    print(f"\n✅ Seeded {created_count} shop spaces")

if __name__ == "__main__":
    seed_shop_spaces()
