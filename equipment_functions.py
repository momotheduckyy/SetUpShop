import sqlite3  # import sqlite
from datetime import date, timedelta
from pathlib import Path

# Match user format; have equipment go in database
DB_PATH = Path(__file__).parent.parent / "db" / "equipment.db"
USERS_DB_PATH = Path(__file__).parent.parent / "db" / "users.db"

# Basic database connection functions
def _connect():
    """Create connection to equipment database"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

 #Create connection to users database for validation
def _connect_users():
    conn = sqlite3.connect(USERS_DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

def _row_to_dict(row):
    """Convert SQLite row to dictionary"""
    return dict(row) if row else None

#Check if user exists using get_user_by_id function
def _validate_user_exists(user_id):
    try:
        # Import get user id function
        import sys
        sys.path.append(str(Path(__file__).parent))
        from users_functions import get_user_by_id
        
        user = get_user_by_id(user_id)
        return user is not None
    except ImportError:
        # Fallback: check users database directly
        with _connect_users() as conn:
            cursor = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,))
            return cursor.fetchone() is not None

def _calculate_next_maintenance_date(purchase_date, maintenance_interval_days):
    """Calculate when next maintenance is due"""
    if isinstance(purchase_date, str):
        purchase_date = date.fromisoformat(purchase_date)
    return purchase_date + timedelta(days=maintenance_interval_days)

# EQUIPMENT CATALOG FUNCTIONS (browse available equipment types)

def get_equipment_catalog():
    """Get all available equipment types"""
    with _connect() as conn:
        cursor = conn.execute("SELECT * FROM equipment_types ORDER BY equipment_name")
        equipment = cursor.fetchall()
        return [_row_to_dict(item) for item in equipment]

 #Get specific equipment type from catalog
def get_equipment_type_by_id(equipment_type_id):
    with _connect() as conn:
        cursor = conn.execute("SELECT * FROM equipment_types WHERE id = ?", (equipment_type_id,))
        equipment = cursor.fetchone()
        return _row_to_dict(equipment)

def add_equipment_type(equipment_name, description, width, height, depth, maintenance_interval_days):
    """Add new equipment type to catalog (for admin use)"""
    with _connect() as conn:
        cursor = conn.execute(
            """INSERT INTO equipment_types (equipment_name, description, width, height, depth, maintenance_interval_days) 
               VALUES (?, ?, ?, ?, ?, ?)""",
            (equipment_name, description, width, height, depth, maintenance_interval_days)
        )
        conn.commit()
        equipment_type_id = cursor.lastrowid
        return get_equipment_type_by_id(equipment_type_id)

# USER EQUIPMENT FUNCTIONS (equipment instances that users own)

def add_equipment_to_user(user_id, equipment_type_id, notes=None, purchase_date=None):
    """User purchases equipment type - creates their own instance with maintenance tracking"""
    if not _validate_user_exists(user_id):
        raise ValueError(f"User with ID {user_id} does not exist")
    
    # Check if equipment type exists
    equipment_type = get_equipment_type_by_id(equipment_type_id)
    if not equipment_type:
        raise ValueError(f"Equipment type with ID {equipment_type_id} does not exist")
    
    # Use provided date or current date
    if purchase_date is None:
        purchase_date = date.today()
    elif isinstance(purchase_date, str):
        purchase_date = date.fromisoformat(purchase_date)
    
    # Calculate next maintenance date
    next_maintenance_date = _calculate_next_maintenance_date(
        purchase_date, 
        equipment_type['maintenance_interval_days']
    )
    
    with _connect() as conn:
        cursor = conn.execute(
            """INSERT INTO user_equipment (equipment_type_id, user_id, date_purchased, next_maintenance_date, notes) 
               VALUES (?, ?, ?, ?, ?)""",
            (equipment_type_id, user_id, purchase_date, next_maintenance_date, notes)
        )
        conn.commit()
        user_equipment_id = cursor.lastrowid
        return get_user_equipment_by_id(user_equipment_id)

#idemtify ewuipment instance with type details
def get_user_equipment_by_id(user_equipment_id):
    with _connect() as conn:
        cursor = conn.execute(
            """SELECT ue.*, et.equipment_name, et.description, et.width, et.height, et.depth, et.maintenance_interval_days
               FROM user_equipment ue
               JOIN equipment_types et ON ue.equipment_type_id = et.id
               WHERE ue.id = ?""",
            (user_equipment_id,)
        )
        equipment = cursor.fetchone()
        return _row_to_dict(equipment)

def get_equipment_by_user(user_id):
    """Get all equipment owned by a specific user"""
    with _connect() as conn:
        cursor = conn.execute(
            """SELECT ue.*, et.equipment_name, et.description, et.width, et.height, et.depth, et.maintenance_interval_days
               FROM user_equipment ue
               JOIN equipment_types et ON ue.equipment_type_id = et.id
               WHERE ue.user_id = ? 
               ORDER BY ue.date_purchased DESC""",
            (user_id,)
        )
        equipment = cursor.fetchall()
        return [_row_to_dict(item) for item in equipment]

def perform_maintenance(user_equipment_id, maintenance_date=None):
    """Record that maintenance was performed and calculate next maintenance date"""
    if maintenance_date is None:
        maintenance_date = date.today()
    elif isinstance(maintenance_date, str):
        maintenance_date = date.fromisoformat(maintenance_date)
    
    # Get equipment details to calculate next maintenance
    equipment = get_user_equipment_by_id(user_equipment_id)
    if not equipment:
        raise ValueError(f"Equipment with ID {user_equipment_id} not found")
    
    # Calculate next maintenance date
    next_maintenance_date = _calculate_next_maintenance_date(
        maintenance_date, 
        equipment['maintenance_interval_days']
    )
    
    with _connect() as conn:
        cursor = conn.execute(
            """UPDATE user_equipment 
               SET last_maintenance_date = ?, next_maintenance_date = ?
               WHERE id = ?""",
            (maintenance_date, next_maintenance_date, user_equipment_id)
        )
        conn.commit()
        if cursor.rowcount > 0:
            return get_user_equipment_by_id(user_equipment_id)
        return None

#Delete user's equipment instance
def delete_user_equipment(user_equipment_id):
    with _connect() as conn:
        cursor = conn.execute("DELETE FROM user_equipment WHERE id = ?", (user_equipment_id,))
        conn.commit()
        return cursor.rowcount > 0


def get_all_user_equipment():
    """Get all equipment owned by all users"""
    with _connect() as conn:
        cursor = conn.execute(
            """SELECT ue.*, et.equipment_name, et.description, et.width, et.height, et.depth, et.maintenance_interval_days
               FROM user_equipment ue
               JOIN equipment_types et ON ue.equipment_type_id = et.id
               ORDER BY ue.user_id, ue.date_purchased DESC"""
        )
        equipment = cursor.fetchall()
        return [_row_to_dict(item) for item in equipment]

def get_maintenance_summary(user_id):
    """Get maintenance summary for a user"""
    overdue = len(get_overdue_maintenance(user_id))
    due_soon = len(get_maintenance_due(user_id, days_ahead=30))  # Next 30 days
    total_equipment = len(get_equipment_by_user(user_id))
    
    return {
        "user_id": user_id,
        "total_equipment": total_equipment,
        "overdue_maintenance": overdue,
        "due_within_30_days": due_soon
    }

# HELPER FUNCTIONS

def days_to_readable_interval(days):
    """Convert days to human-readable format"""
    if days >= 365:
        years = days / 365
        if years == int(years):
            return f"{int(years)} year{'s' if years != 1 else ''}"
        else:
            return f"{years:.1f} years"
    elif days >= 30:
        months = days / 30
        if months == int(months):
            return f"{int(months)} month{'s' if months != 1 else ''}"
        else:
            return f"{months:.1f} months"
    elif days == 7:
        return "weekly"
    else:
        return f"{days} day{'s' if days != 1 else ''}"