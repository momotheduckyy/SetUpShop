# Database Migration Guide

## Problem: Missing Columns in equipment_types Table

If you're getting errors about missing `color`, `manufacturer`, or `model` columns in the `equipment_types` table, it's because you have an old database schema.

### Why This Happens

The `equipment_db_init.py` file uses `CREATE TABLE IF NOT EXISTS`, which means:
- If the table already exists, it won't modify it
- Old database files keep their old structure
- New columns aren't added automatically

### Solution Options

#### Option 1: Fresh Database (Easiest - Recommended for Development)

**Warning:** This deletes all your data!

```bash
# Delete old databases
rm -f db/equipment.db db/shop_spaces.db db/users.db

# Reinitialize with new schema
./init-database.sh
```

#### Option 2: Migration Script (Keeps Your Data)

Run the migration script to add missing columns:

```bash
python3 migrate_add_equipment_columns.py
```

This script will:
- Check which columns are missing
- Add only the missing columns
- Keep all your existing data

#### Option 3: Manual Migration (Advanced)

If you want to do it manually:

```bash
# Add missing columns
sqlite3 db/equipment.db "ALTER TABLE equipment_types ADD COLUMN color TEXT DEFAULT '#aaa';"
sqlite3 db/equipment.db "ALTER TABLE equipment_types ADD COLUMN manufacturer TEXT;"
sqlite3 db/equipment.db "ALTER TABLE equipment_types ADD COLUMN model TEXT;"
```

### Verify Your Schema

Check that all columns exist:

```bash
sqlite3 db/equipment.db "PRAGMA table_info(equipment_types);"
```

You should see these columns:
- id
- equipment_name
- description
- width
- height
- depth
- maintenance_interval_days
- created_at
- **color** ← Should be here
- **manufacturer** ← Should be here
- **model** ← Should be here

### For Future: Better Migration Strategy

To avoid this issue in the future, consider:
1. Using a proper migration tool (like Alembic for Python)
2. Version-controlling your database schema
3. Having numbered migration scripts (001_initial.sql, 002_add_colors.sql, etc.)
