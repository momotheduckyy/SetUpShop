"""
User Router Module
This module provides REST API endpoints for user management and authentication.
It handles user registration, login, profile management, and user search.
It uses Flask Blueprint to organize routes under /api/users prefix.
"""

from flask import Blueprint, request, jsonify
# Import database functions from db_functions directory
from db_functions.users_functions import (
    add_user,
    auth_user,
    delete_user,
    check_usernames,
    get_user_by_id
)

# Create Blueprint for user routes
# Blueprint helps organize related routes together
# url_prefix adds '/api/users' to the start of all routes in this blueprint
user_bp = Blueprint('users', __name__, url_prefix='/api/users')

# ========== USER REGISTRATION AND AUTHENTICATION ENDPOINTS ==========
# These endpoints handle user signup and login

@user_bp.route('/register', methods=['POST'])
def register():
    """
    POST /api/users/register
    Register a new user account

    Request Body (JSON):
        username (str): Required - Unique username for the account
        name (str): Required - Full name of the user
        email (str): Required - Unique email address
        password (str): Required - Password (will be hashed before storage)

    Returns:
        JSON: Created user data (without password)
        Status 201: User created successfully
        Status 400: Missing required fields or duplicate username/email
        Status 500: Server error
    """
    try:
        # Parse JSON request body
        data = request.get_json()

        # Define required fields for user registration
        required_fields = ['username', 'name', 'email', 'password']

        # Validate that all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Create new user in database
        # Password will be hashed by add_user function for security
        user = add_user(
            data['username'],
            data['name'],
            data['email'],
            data['password']
        )

        # Return created user data (password excluded by _row_to_dict)
        return jsonify(user), 201
    except Exception as e:
        # Catch database integrity errors (duplicate username/email)
        return jsonify({"error": str(e)}), 400

@user_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/users/login
    Authenticate a user and log them in
    Accepts either username or email as identifier

    Request Body (JSON):
        identifier (str): Required - Username or email address
        password (str): Required - User's password

    Returns:
        JSON: User data (without password) if authentication successful
        Status 200: Login successful
        Status 400: Missing required fields
        Status 401: Invalid credentials (wrong username/email or password)
        Status 500: Server error
    """
    try:
        # Parse JSON request body
        data = request.get_json()

        # Validate required fields
        if 'identifier' not in data or 'password' not in data:
            return jsonify({"error": "Missing identifier or password"}), 400

        # Attempt to authenticate user
        # auth_user checks if username/email exists and password is correct
        user = auth_user(data['identifier'], data['password'])

        if user:
            # Authentication successful - return user data
            return jsonify(user), 200
        else:
            # Authentication failed - invalid credentials
            return jsonify({"error": "Invalid username/email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== USER PROFILE ENDPOINTS ==========
# These endpoints manage user profile data

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """
    GET /api/users/<user_id>
    Get user profile information by user ID

    Args:
        user_id (int): The unique ID of the user

    Returns:
        JSON: User profile data (without password)
        Status 200: Success
        Status 404: User not found
        Status 500: Server error
    """
    try:
        # Retrieve user from database
        user = get_user_by_id(user_id)
        if user:
            return jsonify(user), 200
        # Return 404 if user doesn't exist
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user_bp.route('/<int:user_id>', methods=['DELETE'])
def remove_user(user_id):
    """
    DELETE /api/users/<user_id>
    Delete a user account permanently
    WARNING: This will remove the user and may affect related data

    Args:
        user_id (int): The unique ID of the user to delete

    Returns:
        JSON: Success message
        Status 200: User deleted successfully
        Status 404: User not found
        Status 500: Server error
    """
    try:
        # Attempt to delete the user
        success = delete_user(user_id)
        if success:
            return jsonify({"message": "User deleted successfully"}), 200
        # Return 404 if user doesn't exist
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== USER SEARCH ENDPOINTS ==========
# These endpoints allow searching for users

@user_bp.route('/search', methods=['GET'])
def search_users():
    """
    GET /api/users/search?q=<search_term>
    Search for users by username or name (partial match)
    Useful for finding other users or checking username availability

    Query Parameters:
        q (str): Required - Search term to match against username or name

    Returns:
        JSON: List of users matching the search term (without passwords)
        Status 200: Success (returns empty list if no matches)
        Status 400: Missing search term
        Status 500: Server error

    Example:
        GET /api/users/search?q=john
        Returns all users with "john" in their username or name
    """
    try:
        # Get search term from query parameters
        search_term = request.args.get('q')

        # Validate search term is provided
        if not search_term:
            return jsonify({"error": "Search term 'q' is required"}), 400

        # Search for users matching the term
        # Performs case-insensitive partial match on username and name
        users = check_usernames(search_term)
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
