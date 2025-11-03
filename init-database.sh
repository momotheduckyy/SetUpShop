#!/bin/bash

# Database initialization script for SetUpShop
# Runs all database schema setup scripts

echo "Starting database initialization..."
echo ""

# Initialize equipment database
echo "1. Initializing equipment database..."
python3 equipment_db_init.py
if [ $? -eq 0 ]; then
    echo "   ✓ Equipment database initialized successfully"
else
    echo "   ✗ Failed to initialize equipment database"
    exit 1
fi
echo ""

# Initialize users database
echo "2. Initializing users database..."
python3 repo/users_db.py
if [ $? -eq 0 ]; then
    echo "   ✓ Users database initialized successfully"
else
    echo "   ✗ Failed to initialize users database"
    exit 1
fi
echo ""

# Initialize shop spaces database
echo "3. Initializing shop spaces database..."
python3 repo/repo/shop_space_init.py
if [ $? -eq 0 ]; then
    echo "   ✓ Shop spaces database initialized successfully"
else
    echo "   ✗ Failed to initialize shop spaces database"
    exit 1
fi
echo ""

# Seed all databases with sample data
echo "4. Seeding databases with sample data..."
python3 seed.py
if [ $? -eq 0 ]; then
    echo "   ✓ Databases seeded successfully"
else
    echo "   ✗ Failed to seed databases"
    exit 1
fi
echo ""

echo "All databases initialized and seeded successfully!"
