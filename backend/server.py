from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
from pathlib import Path

# Add repo directory to Python path for imports
sys.path.append(str(Path(__file__).parent.parent / "repo"))

from users_functions import add_user, auth_user, get_user_by_id, check_usernames
from equipment_library_db import (
    get_equipment_catalog,
    get_equipment_by_user,
    add_equipment_to_user,
    get_user_equipment_by_id,
    perform_maintenance,
    delete_user_equipment
)
from shop_space_functions import (
    create_shop_space,
    get_shop_space_by_id,
    get_shop_spaces_by_username,
    add_equipment_to_shop_space,
    remove_equipment_from_shop_space,
    update_shop_space_dimensions,
    delete_shop_space
)

app = Flask(__name__)

# CORS configuration for production
# Allow requests from production frontend URL or localhost for development
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
CORS(app, origins=[FRONTEND_URL, 'http://localhost:5173'])

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Set Up Shop API is running"}), 200

# Import routes
from routes.auth_routes import auth_bp
from routes.equipment_routes import equipment_bp
from routes.shop_routes import shop_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(equipment_bp, url_prefix='/api/equipment')
app.register_blueprint(shop_bp, url_prefix='/api/shops')

if __name__ == '__main__':
    # Use environment variable for port (Render sets this automatically)
    port = int(os.getenv('PORT', 5001))
    # Disable debug in production
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
