"""
Shop Space Router Module
This module provides REST API endpoints for shop space management.
Shop spaces represent physical workshop areas where users can place their equipment.
It uses Flask Blueprint to organize routes under /api/shop-spaces prefix.
"""

from flask import Blueprint, request, jsonify
# Import database functions from db_functions directory
from db_functions.shop_space_functions import (
    create_shop_space,
    get_shop_space_by_id,
    get_shop_spaces_by_username,
    add_equipment_to_shop_space,
    remove_equipment_from_shop_space,
    update_shop_space_dimensions,
    delete_shop_space,
    get_all_shop_spaces
)

# Create Blueprint for shop space routes
# Blueprint helps organize related routes together
# url_prefix adds '/api/shop-spaces' to the start of all routes in this blueprint
shop_space_bp = Blueprint('shop_spaces', __name__, url_prefix='/api/shop-spaces')

# ========== SHOP SPACE CRUD ENDPOINTS ==========
# These endpoints handle creating, reading, updating, and deleting shop spaces

@shop_space_bp.route('/', methods=['POST'])
def create_space():
    """
    POST /api/shop-spaces/
    Create a new shop space for a user with room dimensions

    Request Body (JSON):
        username (str): Required - Username from users database
        shop_name (str): Required - Name for the shop space
        length (float): Required - Length dimension of the room
        width (float): Required - Width dimension of the room
        height (float): Required - Height dimension of the room

    Returns:
        JSON: Newly created shop space with generated shop_id
        Status 201: Created successfully
        Status 400: Missing required fields or invalid username
        Status 500: Server error
    """
    try:
        # Parse JSON request body
        data = request.get_json()

        # Define required fields for creating shop space
        required_fields = ['username', 'shop_name', 'length', 'width', 'height']

        # Validate that all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Create new shop space in database
        shop_space = create_shop_space(
            data['username'],
            data['shop_name'],
            data['length'],
            data['width'],
            data['height']
        )
        # Return created resource with 201 status
        return jsonify(shop_space), 201
    except ValueError as e:
        # ValueError thrown for invalid username
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_space_bp.route('/<shop_id>', methods=['GET'])
def get_space(shop_id):
    """
    GET /api/shop-spaces/<shop_id>
    Retrieve a specific shop space by its unique ID

    Args:
        shop_id (str): The unique identifier for the shop space
                      Format: username_shopname_timestamp

    Returns:
        JSON: Shop space details including dimensions and equipment list
        Status 200: Success
        Status 404: Shop space not found
        Status 500: Server error
    """
    try:
        # Get shop space from database
        shop_space = get_shop_space_by_id(shop_id)
        if shop_space:
            return jsonify(shop_space), 200
        # Return 404 if shop space doesn't exist
        return jsonify({"error": "Shop space not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_space_bp.route('/user/<username>', methods=['GET'])
def get_user_spaces(username):
    """
    GET /api/shop-spaces/user/<username>
    Get all shop spaces owned by a specific user

    Args:
        username (str): The username to search for

    Returns:
        JSON: List of shop spaces owned by the user (newest first)
        Status 200: Success (returns empty list if no spaces found)
        Status 500: Server error
    """
    try:
        # Retrieve all shop spaces for the specified username
        shop_spaces = get_shop_spaces_by_username(username)
        return jsonify(shop_spaces), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_space_bp.route('/all', methods=['GET'])
def get_all_spaces():
    """
    GET /api/shop-spaces/all
    Get all shop spaces in the database (admin function)

    Returns:
        JSON: List of all shop spaces across all users
        Status 200: Success
        Status 500: Server error
    """
    try:
        # Retrieve all shop spaces
        shop_spaces = get_all_shop_spaces()
        return jsonify(shop_spaces), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_space_bp.route('/<shop_id>', methods=['DELETE'])
def delete_space(shop_id):
    """
    DELETE /api/shop-spaces/<shop_id>
    Delete a shop space completely

    Args:
        shop_id (str): The unique identifier for the shop space to delete

    Returns:
        JSON: Success message
        Status 200: Deleted successfully
        Status 404: Shop space not found
        Status 500: Server error
    """
    try:
        # Attempt to delete the shop space
        success = delete_shop_space(shop_id)
        if success:
            return jsonify({"message": "Shop space deleted successfully"}), 200
        return jsonify({"error": "Shop space not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== SHOP SPACE DIMENSION ENDPOINTS ==========
# These endpoints manage the physical dimensions of shop spaces

@shop_space_bp.route('/<shop_id>/dimensions', methods=['PATCH'])
def update_dimensions(shop_id):
    """
    PATCH /api/shop-spaces/<shop_id>/dimensions
    Update the room dimensions of a shop space
    All dimension fields are optional - only provided fields will be updated

    Args:
        shop_id (str): The unique identifier for the shop space

    Request Body (JSON):
        length (float): Optional - New length dimension
        width (float): Optional - New width dimension
        height (float): Optional - New height dimension

    Returns:
        JSON: Updated shop space with new dimensions
        Status 200: Success
        Status 400: Invalid shop space ID
        Status 404: Shop space not found
        Status 500: Server error
    """
    try:
        # Parse JSON request body
        data = request.get_json()

        # Update dimensions (function handles None values)
        shop_space = update_shop_space_dimensions(
            shop_id,
            data.get('length'),
            data.get('width'),
            data.get('height')
        )
        if shop_space:
            return jsonify(shop_space), 200
        return jsonify({"error": "Shop space not found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== EQUIPMENT PLACEMENT ENDPOINTS ==========
# These endpoints manage placing and removing equipment within shop spaces

@shop_space_bp.route('/<shop_id>/equipment', methods=['POST'])
def add_equipment(shop_id):
    """
    POST /api/shop-spaces/<shop_id>/equipment
    Add equipment to a shop space with 3D placement coordinates
    This links user equipment to a specific position in the shop space

    Args:
        shop_id (str): The unique identifier for the shop space

    Request Body (JSON):
        equipment_id (int): Required - ID of user equipment to add
        x_coordinate (float): Required - X position in the shop space
        y_coordinate (float): Required - Y position in the shop space
        z_coordinate (float): Required - Z position (height) in the shop space

    Returns:
        JSON: Updated shop space with equipment added
        Status 200: Success
        Status 400: Missing required fields or invalid shop/equipment ID
        Status 500: Server error
    """
    try:
        # Parse JSON request body
        data = request.get_json()

        # Define required fields for adding equipment
        required_fields = ['equipment_id', 'x_coordinate', 'y_coordinate', 'z_coordinate']

        # Validate that all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Add equipment to shop space with coordinates
        shop_space = add_equipment_to_shop_space(
            shop_id,
            data['equipment_id'],
            data['x_coordinate'],
            data['y_coordinate'],
            data['z_coordinate']
        )
        if shop_space:
            return jsonify(shop_space), 200
        return jsonify({"error": "Failed to add equipment"}), 500
    except ValueError as e:
        # ValueError thrown for invalid shop space or equipment ID
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_space_bp.route('/<shop_id>/equipment/<int:equipment_id>', methods=['DELETE'])
def remove_equipment(shop_id, equipment_id):
    """
    DELETE /api/shop-spaces/<shop_id>/equipment/<equipment_id>
    Remove equipment from a shop space
    This removes the placement but doesn't delete the equipment itself

    Args:
        shop_id (str): The unique identifier for the shop space
        equipment_id (int): The ID of the equipment to remove

    Returns:
        JSON: Updated shop space with equipment removed
        Status 200: Success
        Status 400: Invalid shop space ID
        Status 404: Shop space not found
        Status 500: Server error
    """
    try:
        # Remove equipment from shop space
        shop_space = remove_equipment_from_shop_space(shop_id, equipment_id)
        if shop_space:
            return jsonify(shop_space), 200
        return jsonify({"error": "Shop space not found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
