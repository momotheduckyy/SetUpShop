# equipment_seed.py
"""
Non-destructive seeding for equipment_types only.

- Creates equipment.db + equipment_types table if needed.
- Seeds a small canonical catalog matching frontend/src/lib/data/equipmentCatalog.js.
- Does NOT touch users.db, shop_spaces.db, or user_equipment.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).parent
repo_path = ROOT / "repo"
if repo_path.exists():
    sys.path.insert(0, str(repo_path))

from equipment_library_db import add_equipment_type, get_equipment_catalog
import equipment_db_init  # creates equipment.db and equipment_types table


EQUIPMENT_CATALOG = [
    {
        "name": "Table Saw",
        "description": "SawStop PCS31230 table saw.",
        "width_ft": 6,
        "depth_ft": 3,
        "maintenance_interval_days": 90,
    },
    {
        "name": "Jointer",
        "description": "Powermatic PJ-882HH jointer.",
        "width_ft": 4,
        "depth_ft": 2,
        "maintenance_interval_days": 120,
    },
    {
        "name": "Planer",
        "description": "DeWalt DW735X planer.",
        "width_ft": 3,
        "depth_ft": 2,
        "maintenance_interval_days": 60,
    },
    {
        "name": "Band Saw",
        "description": "Rikon 10-326 band saw.",
        "width_ft": 3,
        "depth_ft": 3,
        "maintenance_interval_days": 180,
    },
]


def seed_equipment_catalog():
    # Ensure DB + table exist
    equipment_db_init.init_equipment_db()

    # Don’t duplicate if something’s already there
    existing = get_equipment_catalog()
    if existing:
        print("equipment_types already populated; skipping seed.")
        return

    for item in EQUIPMENT_CATALOG:
        width_in = int(item["width_ft"] * 12)
        depth_in = int(item["depth_ft"] * 12)
        height_in = 36  # default standing tool height, tweak as needed

        add_equipment_type(
            equipment_name=item["name"],
            description=item["description"],
            width=width_in,
            height=height_in,
            depth=depth_in,
            maintenance_interval_days=item["maintenance_interval_days"],
        )

    print("Seeded equipment_types from EQUIPMENT_CATALOG.")


if __name__ == "__main__":
    seed_equipment_catalog()
