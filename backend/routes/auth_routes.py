from flask import Blueprint, request, jsonify
import sys
from pathlib import Path

# Add repo directory to Python path
sys.path.append(str(Path(__file__).parent.parent.parent / "repo"))

from users_functions import add_user, auth_user, get_user_by_id, check_usernames

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        username = data.get('username')
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # Validate required fields
        if not all([username, name, email, password]):
            return jsonify({"error": "All fields are required"}), 400

        # Create user
        user = add_user(username, name, email, password)

        if user:
            return jsonify({
                "message": "User registered successfully",
                "user": user
            }), 201
        else:
            return jsonify({"error": "Failed to create user"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate a user"""
    try:
        data = request.get_json()
        identifier = data.get('identifier')  # username or email
        password = data.get('password')

        # Validate required fields
        if not all([identifier, password]):
            return jsonify({"error": "Identifier and password are required"}), 400

        # Authenticate user
        user = auth_user(identifier, password)

        if user:
            return jsonify({
                "message": "Login successful",
                "user": user
            }), 200
        else:
            return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    try:
        user = get_user_by_id(user_id)

        if user:
            return jsonify({"user": user}), 200
        else:
            return jsonify({"error": "User not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/search', methods=['GET'])
def search_users():
    """Search users by username or name"""
    try:
        search_term = request.args.get('q', '')

        if not search_term:
            return jsonify({"error": "Search term required"}), 400

        users = check_usernames(search_term)

        return jsonify({"users": users}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
