# Set Up Shop - Backend

Flask backend API for the Set Up Shop workshop designer application.

## Getting Started

### Installation

```bash
cd backend
pip install -r requirements.txt
```

### Running the Server

```bash
python server.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /user/<user_id>` - Get user by ID
- `GET /search?q=<term>` - Search users

### Equipment (`/api/equipment`)
- `GET /catalog` - Get equipment catalog
- `GET /catalog/<equipment_type_id>` - Get equipment type details
- `POST /catalog` - Add new equipment type (admin)
- `GET /user/<user_id>` - Get user's equipment
- `POST /user/<user_id>` - Add equipment to user
- `GET /<equipment_id>` - Get equipment by ID
- `DELETE /<equipment_id>` - Delete equipment
- `POST /<equipment_id>/maintenance` - Record maintenance
- `GET /user/<user_id>/maintenance-summary` - Get maintenance summary

### Shop Spaces (`/api/shops`)
- `GET /` - Get all shop spaces
- `POST /` - Create new shop space
- `GET /<shop_id>` - Get shop by ID
- `GET /user/<username>` - Get user's shop spaces
- `PUT /<shop_id>` - Update shop dimensions
- `DELETE /<shop_id>` - Delete shop space
- `POST /<shop_id>/equipment` - Add equipment to shop
- `DELETE /<shop_id>/equipment/<equipment_id>` - Remove equipment from shop

## Database Structure

The backend connects to existing SQLite databases:
- `db/users.db` - User accounts
- `db/equipment.db` - Equipment catalog and user equipment
- `db/shop_spaces.db` - Shop space layouts

All database functions are imported from the `repo/` directory.
