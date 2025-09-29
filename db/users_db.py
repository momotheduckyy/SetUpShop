import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("users.db")
DDL = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  shop_spaces TEXT DEFAULT '[]'
);
"""

def init_db(db_path: Path = DB_PATH):
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.executescript(DDL)

if __name__ == "__main__":
    init_db()
    print(f"Initialized {DB_PATH}")