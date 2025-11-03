# tests/conftest.py
import os
import sqlite3
import tempfile
import pytest
from pathlib import Path
import uuid

# ⚠️ Update this import path if your file lives elsewhere
import repo.shop_space_functions as shop

@pytest.fixture(scope="session")
def tmp_db_dir():
    with tempfile.TemporaryDirectory(prefix="setupshop_tests_") as d:
        yield Path(d)

@pytest.fixture(scope="session", autouse=True)
def patch_db_paths(tmp_db_dir):
    """Redirect module-level DB paths to temp files and init schemas."""
    # Point the module to temp DB files
    shop.DB_PATH = tmp_db_dir / "shop_spaces.db"
    shop.USERS_DB_PATH = tmp_db_dir / "users.db"
    shop.EQUIPMENT_DB_PATH = tmp_db_dir / "equipment.db"

    # ---- init USERS DB (minimal schema used by _validate_username_exists) ----
    with sqlite3.connect(shop.USERS_DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
              username TEXT PRIMARY KEY
              -- other columns not needed for tests
            );
        """)
        conn.commit()

    # ---- init EQUIPMENT DB (minimal schema used by _validate_equipment_exists) ----
    with sqlite3.connect(shop.EQUIPMENT_DB_PATH) as conn:
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS user_equipment (
              id INTEGER PRIMARY KEY,
              name TEXT
            );
        """)
        conn.commit()

    # ---- init SHOP SPACES DB using the module's DDL ----
    shop.init_shop_spaces_db(db_path=shop.DB_PATH)

    yield  # tests run here

@pytest.fixture
def conn_users():
    with sqlite3.connect(shop.USERS_DB_PATH) as c:
        c.row_factory = sqlite3.Row
        yield c

@pytest.fixture
def conn_equipment():
    with sqlite3.connect(shop.EQUIPMENT_DB_PATH) as c:
        c.row_factory = sqlite3.Row
        yield c

@pytest.fixture
def conn_shop():
    with sqlite3.connect(shop.DB_PATH) as c:
        c.row_factory = sqlite3.Row
        yield c

@pytest.fixture
def seed_user(conn_users):
    username = f"alice_{uuid.uuid4().hex[:8]}"
    conn_users.execute("INSERT INTO users(username) VALUES (?)", (username,))
    conn_users.commit()
    return username

@pytest.fixture
def seed_equipment(conn_equipment):
    cur = conn_equipment.execute(
        "INSERT INTO user_equipment(name) VALUES (?)",
        ("Bandsaw",)
    )
    conn_equipment.commit()
    return cur.lastrowid  # integer id

@pytest.fixture
def seed_shop_space(seed_user):
    # create a minimal shop space via the real API so tests use real shape
    created = shop.create_shop_space(
        username=seed_user,
        shop_name="MySpace",
        length=10.0,
        width=8.0,
        height=3.0,
    )
    return created  # dict with shop_id + fields
