import sqlite3
from pathlib import Path

# Match the pattern from shop_space_functions.py
DB_PATH = Path(__file__).parent.parent / "db" / "shop_spaces.db"

#SQL to create shop space
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

def init_shop_spaces_db(db_path: Path = DB_PATH):
    db_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(db_path) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        conn.executescript(DDL)
        print(f"Initialized shop spaces database at {db_path}")

if __name__ == "__main__":
    init_shop_spaces_db()
