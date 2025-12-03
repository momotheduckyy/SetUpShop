import sqlite3
import json
from datetime import datetime
from pathlib import Path
from models.placement import Position, EquipmentPlacement 

# Database paths - following existing project structure
DB_PATH = Path(__file__).parent.parent / "db" / "shop_spaces.db"
USERS_DB_PATH = Path(__file__).parent.parent / "db" / "users.db"
EQUIPMENT_DB_PATH = Path(__file__).parent.parent / "db" / "equipment.db"

# Database schema for shop spaces
DDL = """
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

# Basic database connection functions
def _connect(db_path):
    """Create a database connection"""
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def _connect_shop_spaces():
    """Create connection to shop spaces database"""
    return _connect(DB_PATH)

def _connect_users():
    """Create connection to users database for validation"""
    return _connect(USERS_DB_PATH)

def _connect_equipment():
    """Create connection to equipment database for validation"""
    return _connect(EQUIPMENT_DB_PATH)

def _row_to_dict(row):
    """Convert SQLite row to dictionary with equipment parsing"""
    if row is None:
        return None
    result = dict(row)
    # Parse equipment JSON string back to list
    if 'equipment' in result and result['equipment']:
        result['equipment'] = json.loads(result['equipment'])
    else:
        result['equipment'] = []
    return result

def _generate_shop_id(username, shop_name):
    """Generate unique shop ID: username_shopname_timestamp"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    shop_id = f"{username}_{shop_name}_{timestamp}"
    return shop_id

def _validate_username_exists(username):
    """Check if username exists in users database"""
    try:
        with _connect_users() as conn:
            cursor = conn.execute("SELECT username FROM users WHERE username = ?", (username,))
            return cursor.fetchone() is not None
    except Exception:
        return False

def _validate_equipment_exists(equipment_id):
    """Check if equipment exists in equipment database"""
    try:
        with _connect_equipment() as conn:
            cursor = conn.execute("SELECT id FROM user_equipment WHERE id = ?", (equipment_id,))
            return cursor.fetchone() is not None
    except Exception:
        return False

def _validate_equipment_belongs_to_user(equipment_id, username):
    """Check if equipment exists and belongs to the user who owns the shop"""
    try:
        # First get user_id from username
        with _connect_users() as conn:
            cursor = conn.execute("SELECT id FROM users WHERE username = ?", (username,))
            user_row = cursor.fetchone()
            if not user_row:
                return False
            user_id = user_row['id']

        # Then check if equipment belongs to that user
        with _connect_equipment() as conn:
            cursor = conn.execute(
                "SELECT id FROM user_equipment WHERE id = ? AND user_id = ?",
                (equipment_id, user_id)
            )
            return cursor.fetchone() is not None
    except Exception:
        return False

def init_shop_spaces_db(db_path: Path = DB_PATH):
    """Initialize the shop spaces database with required tables"""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.executescript(DDL)

# SHOP SPACE CRUD FUNCTIONS

def create_shop_space(username, shop_name, length, width, height):
    """
    Create a new shop space with room dimensions
    
    Args:
        username (str): Username from users database
        shop_name (str): Name of the shop space
        length (float): Length dimension of the room
        width (float): Width dimension of the room  
        height (float): Height dimension of the room
        
    Returns:
        dict: Created shop space data or None if failed
    """
    # Validate username exists
    if not _validate_username_exists(username):
        raise ValueError(f"Username '{username}' does not exist in users database")
    
    # Generate unique shop ID
    shop_id = _generate_shop_id(username, shop_name)
    creation_timestamp = datetime.now().isoformat()
    
    # Initialize database if it doesn't exist
    init_shop_spaces_db()
    
    try:
        with _connect_shop_spaces() as conn:
            cursor = conn.execute(
                """INSERT INTO shop_spaces 
                   (shop_id, username, shop_name, creation_timestamp, length, width, height, equipment) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
                (shop_id, username, shop_name, creation_timestamp, length, width, height, "[]")
            )
            conn.commit()
            return get_shop_space_by_id(shop_id)
    except sqlite3.IntegrityError as e:
        raise ValueError(f"Error creating shop space: {e}")

def get_shop_space_by_id(shop_id):
    """
    Get shop space by its unique ID
    
    Args:
        shop_id (str): Unique shop identifier
        
    Returns:
        dict: Shop space data or None if not found
    """
    with _connect_shop_spaces() as conn:
        cursor = conn.execute("SELECT * FROM shop_spaces WHERE shop_id = ?", (shop_id,))
        shop_space = cursor.fetchone()
        return _row_to_dict(shop_space)

def get_shop_spaces_by_username(username):
    """
    Get all shop spaces owned by a specific username
    
    Args:
        username (str): Username to search for
        
    Returns:
        list: List of shop spaces owned by the user
    """
    with _connect_shop_spaces() as conn:
        cursor = conn.execute(
            "SELECT * FROM shop_spaces WHERE username = ? ORDER BY creation_timestamp DESC",
            (username,)
        )
        shop_spaces = cursor.fetchall()
        return [_row_to_dict(space) for space in shop_spaces]

def add_equipment_to_shop_space(shop_id, placement):
    """
    Add equipment to a shop space with placement coordinates

    Returns:
        dict: Updated shop space data or None if failed
    """
    # Validate shop space exists
    shop_space = get_shop_space_by_id(shop_id)
    if not shop_space:
        raise ValueError(f"Shop space with ID '{shop_id}' does not exist")

    # Validate equipment exists and belongs to the shop owner
    if not _validate_equipment_belongs_to_user(placement.equipment_id, shop_space['username']):
        raise ValueError(f"Equipment with ID {placement.equipment_id} does not exist or does not belong to user")

    # Add to existing equipment list
    current_equipment = shop_space['equipment']
    current_equipment.append(placement.to_dict())

    # Update database with new equipment list
    equipment_json = json.dumps(current_equipment)

    with _connect_shop_spaces() as conn:
        cursor = conn.execute(
            "UPDATE shop_spaces SET equipment = ? WHERE shop_id = ?",
            (equipment_json, shop_id)
        )
        conn.commit()
        if cursor.rowcount > 0:
            return get_shop_space_by_id(shop_id)
        return None

def remove_equipment_from_shop_space(shop_id, equipment_id):
    """
    Remove equipment from a shop space
    
    Args:
        shop_id (str): Shop space identifier
        equipment_id (int): Equipment ID to remove
        
    Returns:
        dict: Updated shop space data or None if failed
    """
    shop_space = get_shop_space_by_id(shop_id)
    if not shop_space:
        raise ValueError(f"Shop space with ID '{shop_id}' does not exist")
    
    # Filter out the equipment to remove
    current_equipment = shop_space['equipment']
    updated_equipment = [eq for eq in current_equipment if eq['equipment_id'] != equipment_id]
    
    # Update database
    equipment_json = json.dumps(updated_equipment)
    
    with _connect_shop_spaces() as conn:
        cursor = conn.execute(
            "UPDATE shop_spaces SET equipment = ? WHERE shop_id = ?",
            (equipment_json, shop_id)
        )
        conn.commit()
        if cursor.rowcount > 0:
            return get_shop_space_by_id(shop_id)
        return None

def update_equipment_position(shop_id, equipment_id, x=None, y=None, z=None):
    """
    Update the position of equipment in a shop space

    Args:
        shop_id (str): Shop space identifier
        equipment_id (int): Equipment ID to update
        x (float, optional): New x coordinate
        y (float, optional): New y coordinate
        z (float, optional): New z coordinate

    Returns:
        dict: Updated shop space data or None if failed
    """
    shop_space = get_shop_space_by_id(shop_id)
    if not shop_space:
        raise ValueError(f"Shop space with ID '{shop_id}' does not exist")

    # Find and update the equipment
    current_equipment = shop_space['equipment']
    equipment_found = False

    for eq in current_equipment:
        if eq['equipment_id'] == equipment_id:
            equipment_found = True
            if x is not None:
                eq['x_coordinate'] = x
            if y is not None:
                eq['y_coordinate'] = y
            if z is not None:
                eq['z_coordinate'] = z
            break

    if not equipment_found:
        raise ValueError(f"Equipment with ID {equipment_id} not found in shop")

    # Update database
    equipment_json = json.dumps(current_equipment)

    with _connect_shop_spaces() as conn:
        cursor = conn.execute(
            "UPDATE shop_spaces SET equipment = ? WHERE shop_id = ?",
            (equipment_json, shop_id)
        )
        conn.commit()
        if cursor.rowcount > 0:
            return get_shop_space_by_id(shop_id)
        return None

def update_shop_space_dimensions(shop_id, length=None, width=None, height=None, shop_name=None):
    """
    Update room dimensions and name of a shop space

    Args:
        shop_id (str): Shop space identifier
        length (float, optional): New length dimension
        width (float, optional): New width dimension
        height (float, optional): New height dimension
        shop_name (str, optional): New shop name

    Returns:
        dict: Updated shop space data or None if failed
    """
    shop_space = get_shop_space_by_id(shop_id)
    if not shop_space:
        raise ValueError(f"Shop space with ID '{shop_id}' does not exist")

    # Use existing values if new ones not provided
    new_length = length if length is not None else shop_space['length']
    new_width = width if width is not None else shop_space['width']
    new_height = height if height is not None else shop_space['height']
    new_shop_name = shop_name if shop_name is not None else shop_space['shop_name']

    with _connect_shop_spaces() as conn:
        cursor = conn.execute(
            "UPDATE shop_spaces SET shop_name = ?, length = ?, width = ?, height = ? WHERE shop_id = ?",
            (new_shop_name, new_length, new_width, new_height, shop_id)
        )
        conn.commit()
        if cursor.rowcount > 0:
            return get_shop_space_by_id(shop_id)
        return None

def delete_shop_space(shop_id):
    """
    Delete a shop space completely
    
    Args:
        shop_id (str): Shop space identifier to delete
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    with _connect_shop_spaces() as conn:
        cursor = conn.execute("DELETE FROM shop_spaces WHERE shop_id = ?", (shop_id,))
        conn.commit()
        return cursor.rowcount > 0

def get_all_shop_spaces():
    """
    Get all shop spaces in the database
    
    Returns:
        list: List of all shop spaces
    """
    with _connect_shop_spaces() as conn:
        cursor = conn.execute("SELECT * FROM shop_spaces ORDER BY creation_timestamp DESC")
        shop_spaces = cursor.fetchall()
        return [_row_to_dict(space) for space in shop_spaces]

# Initialize database when module is imported
if __name__ == "__main__":
    init_shop_spaces_db()
    print(f"Initialized shop spaces database at {DB_PATH}")
