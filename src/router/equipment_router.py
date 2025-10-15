"""
Equipment Router Module
This module provides REST API endpoints for equipment catalog and user equipment management.
It uses Flask Blueprint to organize routes under /api/equipment prefix.
"""

from flask import Blueprint, request, jsonify
# Import database functions from db_functions directory
from db_functions.equipment_library_db import (
    get_equipment_catalog,
    get_equipment_type_by_id,
    add_equipment_type,
    add_equipment_to_user,
    get_user_equipment_by_id,
    get_equipment_by_user,
    perform_maintenance,
    delete_user_equipment,
    get_all_user_equipment,
    get_maintenance_summary
)

# Create Blueprint for equipment routes
# Blueprint helps organize related routes together
# url_prefix adds '/api/equipment' to the start of all routes in this blueprint
equipment_bp = Blueprint('equipment', __name__, url_prefix='/api/equipment')

# ========== EQUIPMENT CATALOG ENDPOINTS ==========
# These endpoints manage the equipment catalog (available equipment types)

@equipment_bp.route('/catalog', methods=['GET'])
def get_catalog():
    """
    GET /api/equipment/catalog
    Retrieve all available equipment types from the catalog

    Returns:
        JSON: List of all equipment types with their details
        Status 200: Success
        Status 500: Server error
    """
    try:
        # Call database function to get all equipment types
        catalog = get_equipment_catalog()
        # Return as JSON with 200 OK status
        return jsonify(catalog), 200
    except Exception as e:
        # If any error occurs, return error message with 500 status
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/catalog/<int:equipment_type_id>', methods=['GET'])
def get_catalog_item(equipment_type_id):
    """
    GET /api/equipment/catalog/<equipment_type_id>
    Retrieve a specific equipment type by its ID

    Args:
        equipment_type_id (int): The unique ID of the equipment type

    Returns:
        JSON: Equipment type details
        Status 200: Success
        Status 404: Equipment type not found
        Status 500: Server error
    """
    try:
        # Get specific equipment type from database
        equipment_type = get_equipment_type_by_id(equipment_type_id)
        if equipment_type:
            return jsonify(equipment_type), 200
        # Return 404 if equipment type doesn't exist
        return jsonify({"error": "Equipment type not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/catalog', methods=['POST'])
def add_catalog_item():
    """
    POST /api/equipment/catalog
    Add a new equipment type to the catalog (admin function)

    Request Body (JSON):
        equipment_name (str): Name of the equipment
        description (str): Description of the equipment
        width (float): Width dimension
        height (float): Height dimension
        depth (float): Depth dimension
        maintenance_interval_days (int): Days between maintenance

    Returns:
        JSON: Newly created equipment type
        Status 201: Created successfully
        Status 400: Missing required fields
        Status 500: Server error
    """
    try:
        # Get JSON data from request body
        data = request.get_json()

        # Define required fields for creating equipment type
        required_fields = ['equipment_name', 'description', 'width', 'height', 'depth', 'maintenance_interval_days']

        # Validate that all required fields are present
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Create new equipment type in database
        equipment_type = add_equipment_type(
            data['equipment_name'],
            data['description'],
            data['width'],
            data['height'],
            data['depth'],
            data['maintenance_interval_days']
        )
        # Return created resource with 201 status
        return jsonify(equipment_type), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== USER EQUIPMENT ENDPOINTS ==========
# These endpoints manage equipment instances that users own

@equipment_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_equipment(user_id):
    """
    GET /api/equipment/user/<user_id>
    Get all equipment owned by a specific user

    Args:
        user_id (int): The unique ID of the user

    Returns:
        JSON: List of equipment owned by the user
        Status 200: Success
        Status 500: Server error
    """
    try:
        # Retrieve all equipment for the specified user
        equipment = get_equipment_by_user(user_id)
        return jsonify(equipment), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/user/<int:user_id>', methods=['POST'])
def add_user_equipment(user_id):
    """
    POST /api/equipment/user/<user_id>
    Add equipment to a user (user purchases equipment)

    Args:
        user_id (int): The unique ID of the user

    Request Body (JSON):
        equipment_type_id (int): Required - ID of equipment type to add
        notes (str): Optional - Additional notes about the equipment
        purchase_date (str): Optional - Date purchased (ISO format YYYY-MM-DD)

    Returns:
        JSON: Newly created user equipment instance
        Status 201: Created successfully
        Status 400: Invalid request (missing fields or invalid user/equipment)
        Status 500: Server error
    """
    try:
        # Parse JSON request body
        data = request.get_json()

        # Validate required field
        if 'equipment_type_id' not in data:
            return jsonify({"error": "equipment_type_id is required"}), 400

        # Add equipment to user's inventory
        # .get() returns None if field doesn't exist (for optional fields)
        equipment = add_equipment_to_user(
            user_id,
            data['equipment_type_id'],
            data.get('notes'),
            data.get('purchase_date')
        )
        return jsonify(equipment), 201
    except ValueError as e:
        # ValueError thrown for invalid user or equipment type
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/user/equipment/<int:user_equipment_id>', methods=['GET'])
def get_equipment_instance(user_equipment_id):
    """
    GET /api/equipment/user/equipment/<user_equipment_id>
    Get details of a specific equipment instance

    Args:
        user_equipment_id (int): The unique ID of the user equipment instance

    Returns:
        JSON: Equipment instance details with type information
        Status 200: Success
        Status 404: Equipment not found
        Status 500: Server error
    """
    try:
        # Retrieve specific equipment instance
        equipment = get_user_equipment_by_id(user_equipment_id)
        if equipment:
            return jsonify(equipment), 200
        return jsonify({"error": "Equipment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/user/equipment/<int:user_equipment_id>', methods=['DELETE'])
def delete_equipment_instance(user_equipment_id):
    """
    DELETE /api/equipment/user/equipment/<user_equipment_id>
    Delete a user's equipment instance

    Args:
        user_equipment_id (int): The unique ID of the user equipment to delete

    Returns:
        JSON: Success message
        Status 200: Deleted successfully
        Status 404: Equipment not found
        Status 500: Server error
    """
    try:
        # Attempt to delete the equipment
        success = delete_user_equipment(user_equipment_id)
        if success:
            return jsonify({"message": "Equipment deleted successfully"}), 200
        return jsonify({"error": "Equipment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/all', methods=['GET'])
def get_all_equipment():
    """
    GET /api/equipment/all
    Get all user equipment instances across all users (admin function)

    Returns:
        JSON: List of all user equipment with details
        Status 200: Success
        Status 500: Server error
    """
    try:
        # Retrieve all equipment across all users
        equipment = get_all_user_equipment()
        return jsonify(equipment), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========== MAINTENANCE ENDPOINTS ==========
# These endpoints manage equipment maintenance tracking

@equipment_bp.route('/maintenance/<int:user_equipment_id>', methods=['POST'])
def record_maintenance(user_equipment_id):
    """
    POST /api/equipment/maintenance/<user_equipment_id>
    Record that maintenance was performed on equipment
    This updates last_maintenance_date and calculates next_maintenance_date

    Args:
        user_equipment_id (int): The unique ID of the user equipment

    Request Body (JSON):
        maintenance_date (str): Optional - Date maintenance performed (ISO format)
                               Defaults to today if not provided

    Returns:
        JSON: Updated equipment with new maintenance dates
        Status 200: Success
        Status 400: Invalid equipment ID
        Status 404: Equipment not found
        Status 500: Server error
    """
    try:
        # Get JSON data, default to empty dict if no body provided
        data = request.get_json() or {}

        # Perform maintenance and update dates
        equipment = perform_maintenance(
            user_equipment_id,
            data.get('maintenance_date')
        )
        if equipment:
            return jsonify(equipment), 200
        return jsonify({"error": "Equipment not found"}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/maintenance/summary/<int:user_id>', methods=['GET'])
def get_user_maintenance_summary(user_id):
    """
    GET /api/equipment/maintenance/summary/<user_id>
    Get maintenance summary statistics for a user
    Shows total equipment, overdue maintenance, and upcoming maintenance

    Args:
        user_id (int): The unique ID of the user

    Returns:
        JSON: {
            user_id: int,
            total_equipment: int,
            overdue_maintenance: int,
            due_within_30_days: int
        }
        Status 200: Success
        Status 500: Server error
    """
    try:
        # Get maintenance summary statistics
        summary = get_maintenance_summary(user_id)
        return jsonify(summary), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
