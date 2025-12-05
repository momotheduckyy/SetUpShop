import sqlite3, json
import hashlib
import os
from pathlib import Path

# Support environment variable for production deployment
DB_DIR = os.getenv('DB_PATH', str(Path(__file__).parent.parent / "db"))
DB_PATH = Path(DB_DIR) / "users.db"

#basic functions -------------------------------------------------------------------
#create new connection to the database, ensure foreign keys are enabled, configure row_factory to return dict-like rows
def _connect():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn

#passowrd hashing function for security
def _hash_password(password):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

#function to compare hashed password to plaintext password
def _verify_password(stored_password, provided_password):
    return stored_password == _hash_password(provided_password) 

#row to dict conversion function 
def _row_to_dict(row):
    if row is None:
        return None
    result = dict(row)
    if 'shop_spaces' in result and result['shop_spaces']:
        result['shop_spaces'] = json.loads(result['shop_spaces'])
    else:
        result['shop_spaces'] = []
    
    result.pop('password', None)  # Remove password before returning
    return result


#user functions -------------------------------------------------------------------
#function to add a new user 
def add_user(username, name, email, password):
    hashed_password = _hash_password(password)
    with _connect() as conn:
        cursor = conn.execute(
            "INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)",
            (username, name, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        user = get_user_by_id(user_id)
        return _row_to_dict(user) #convert row to dict and return user data

#function to authenticate a user
def auth_user(identifier, password):
    try:
        with _connect() as conn:
            cursor = conn.execute(
                "SELECT * FROM users WHERE username = ? OR email = ?", #allow login by username or email
                (identifier, identifier)
            )
            user = cursor.fetchone()
            if not user:
                return None # User not found
            if _verify_password(user['password'], password): #verify password 
                user = _row_to_dict(user)
                return user #convert row to dict and return user data
            return None
    except sqlite3.IntegrityError as e:
        print("Error: duplicate username or email.", e)
        return None
    

#function to delete a user 
def delete_user(user_id):
    with _connect() as conn:
        cursor = conn.execute(
            "DELETE FROM users WHERE id = ?",
            (user_id,)
        )
        conn.commit()
        return cursor.rowcount > 0  # Return True if a row was deleted

#function to search for users whose username or name contains the query string
def check_usernames(search_term):
    with _connect() as conn:
        cursor = conn.execute(
            "SELECT * FROM users WHERE username LIKE ? OR name LIKE ?", #search for partial matches
            (f"%{search_term}%", f"%{search_term}%")
        )
        users = cursor.fetchall()
        return [_row_to_dict(user) for user in users] #convert each row to dict and return list of users

#function to get user by id
def get_user_by_id(user_id):
    with _connect() as conn:
        cursor = conn.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,)
        )
        user = cursor.fetchone()
        return _row_to_dict(user) #convert row to dict and return user data

    