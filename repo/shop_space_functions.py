import sqlite3
import json
from datetime import datetime
from pathlib import Path

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
def _connect_shop_spaces():
    """Create connection to shop spaces database"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def _connect_users():
    """Create connection to users database for validation"""
    conn = sqlite3.connect(USERS_DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def _connect_equipment():
    """Create connection to equipment database for validation"""
    conn = sqlite3.connect(EQUIPMENT_DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

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

def add_equipment_to_shop_space(shop_id, equipment_id, x_coordinate, y_coordinate, z_coordinate):
    """
    Add equipment to a shop space with placement coordinates
    
    Args:
        shop_id (str): Shop space identifier
        equipment_id (int): Equipment ID from equipment database
        x_coordinate (float): X position coordinate
        y_coordinate (float): Y position coordinate  
        z_coordinate (float): Z position coordinate
        
    Returns:
        dict: Updated shop space data or None if failed
    """
    # Validate shop space exists
    shop_space = get_shop_space_by_id(shop_id)
    if not shop_space:
        raise ValueError(f"Shop space with ID '{shop_id}' does not exist")
    
    # Validate equipment exists
    if not _validate_equipment_exists(equipment_id):
        raise ValueError(f"Equipment with ID {equipment_id} does not exist")
    
    # Create equipment placement record
    equipment_placement = {
        "equipment_id": equipment_id,
        "date_added": datetime.now().isoformat(),
        "x_coordinate": x_coordinate,
        "y_coordinate": y_coordinate,
        "z_coordinate": z_coordinate
    }
    
    # Add to existing equipment list
    current_equipment = shop_space['equipment']
    current_equipment.append(equipment_placement)
    
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

def update_shop_space_dimensions(shop_id, length=None, width=None, height=None):
    """
    Update room dimensions of a shop space
    
    Args:
        shop_id (str): Shop space identifier
        length (float, optional): New length dimension
        width (float, optional): New width dimension
        height (float, optional): New height dimension
        
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
    
    with _connect_shop_spaces() as conn:
        cursor = conn.execute(
            "UPDATE shop_spaces SET length = ?, width = ?, height = ? WHERE shop_id = ?",
            (new_length, new_width, new_height, shop_id)
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