from flask import Blueprint, request, jsonify
import sys
from pathlib import Path

# Add repo directory to Python path
sys.path.append(str(Path(__file__).parent.parent.parent / "repo"))

from shop_space_functions import (
    create_shop_space,
    get_shop_space_by_id,
    get_shop_spaces_by_username,
    add_equipment_to_shop_space,
    remove_equipment_from_shop_space,
    update_shop_space_dimensions,
    delete_shop_space,
    get_all_shop_spaces
)
from models.placement import Position, EquipmentPlacement
shop_bp = Blueprint('shops', __name__)

@shop_bp.route('/', methods=['GET'])
def get_all_shops():
    """Get all shop spaces"""
    try:
        shops = get_all_shop_spaces()
        return jsonify({"shops": shops}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@shop_bp.route('/<shop_id>/equipment', methods=['POST'])
def add_equipment_to_shop(shop_id):
    """Add equipment to shop space"""
    try:
        data = request.get_json()
        
        # Create Position object from coordinates
        position = Position(
            x=data.get('x_coordinate'),
            y=data.get('y_coordinate'),
            z=data.get('z_coordinate')
        )
        
        # Create EquipmentPlacement object
        placement = EquipmentPlacement(
            equipment_id=data.get('equipment_id'),
            position=position
        )
        
        # Validate required fields
        if placement.equipment_id is None:
            return jsonify({"error": "Equipment ID is required"}), 400
        
        if any(coord is None for coord in [position.x, position.y, position.z]):
            return jsonify({"error": "All coordinates are required"}), 400
        
        # Call function with clean interface (only 2 parameters!)
        shop = add_equipment_to_shop_space(shop_id, placement)
        
        if shop:
            return jsonify({
                "message": "Equipment added to shop successfully",
                "shop": shop
            }), 200
        else:
            return jsonify({"error": "Failed to add equipment"}), 500
            
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_bp.route('/<shop_id>', methods=['GET'])
def get_shop(shop_id):
    """Get shop space by ID"""
    try:
        shop = get_shop_space_by_id(shop_id)
        if shop:
            return jsonify({"shop": shop}), 200
        else:
            return jsonify({"error": "Shop not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_bp.route('/user/<username>', methods=['GET'])
def get_user_shops(username):
    """Get all shop spaces for a username"""
    try:
        shops = get_shop_spaces_by_username(username)
        return jsonify({"shops": shops}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_bp.route('/<shop_id>', methods=['PUT'])
def update_shop_dimensions(shop_id):
    """Update shop space dimensions"""
    try:
        data = request.get_json()
        shop = update_shop_space_dimensions(
            shop_id,
            length=data.get('length'),
            width=data.get('width'),
            height=data.get('height')
        )

        if shop:
            return jsonify({
                "message": "Shop dimensions updated successfully",
                "shop": shop
            }), 200
        else:
            return jsonify({"error": "Shop not found"}), 404

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@shop_bp.route('/<shop_id>', methods=['DELETE'])
def delete_shop(shop_id):
    """Delete a shop space"""
    try:
        success = delete_shop_space(shop_id)
        if success:
            return jsonify({"message": "Shop deleted successfully"}), 200
        else:
            return jsonify({"error": "Shop not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#removed old equipment_from_shop_space route (there was an updated one above from refactor assignment)

@shop_bp.route('/<shop_id>/equipment/<int:equipment_id>', methods=['DELETE'])
def remove_equipment_from_shop(shop_id, equipment_id):
    """Remove equipment from shop space"""
    try:
        shop = remove_equipment_from_shop_space(shop_id, equipment_id)

        if shop:
            return jsonify({
                "message": "Equipment removed from shop successfully",
                "shop": shop
            }), 200
        else:
            return jsonify({"error": "Shop not found"}), 404

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
