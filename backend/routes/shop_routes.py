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
    update_equipment_position,
    delete_shop_space,
    get_all_shop_spaces,
)
from models.placement import Position, EquipmentPlacement
from models.shop_size import ShopSize   # 👈 correct import

shop_bp = Blueprint("shops", __name__)


@shop_bp.route("/", methods=["GET"])
def get_all_shops():
    """Get all shop spaces"""
    try:
        shops = get_all_shop_spaces()
        return jsonify({"shops": shops}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@shop_bp.route("/", methods=["POST"])
def create_shop():
    """Create a new shop space"""
    try:
        data = request.get_json() or {}

        username = data.get("username")
        shop_name = data.get("shop_name")

        # 🔑 Prefer nested shop_size object if present
        shop_size_data = data.get("shop_size") or data.get("shopSize")
        if shop_size_data:
            shop_size = ShopSize.from_dict(shop_size_data)
            length, width, height = shop_size.to_db_dimensions()
        else:
            # fallback: old-style top-level length/width/height
            length = data.get("length")
            width = data.get("width")
            height = data.get("height")

        # basic validation
        if not username or not shop_name:
            return jsonify({"error": "username and shop_name are required"}), 400

        if any(v is None for v in [length, width, height]):
            return jsonify(
                {"error": "length, width, and height are required"}
            ), 400

        shop = create_shop_space(
            username=username,
            shop_name=shop_name,
            length=length,
            width=width,
            height=height,
        )

        return jsonify(
            {
                "message": "Shop created successfully",
                "shop": shop,
            }
        ), 201

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
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
    """Update shop space dimensions and equipment positions"""
    try:
        data = request.get_json()

        # Update shop dimensions and name
        shop = update_shop_space_dimensions(
            shop_id,
            length=data.get('length'),
            width=data.get('width'),
            height=data.get('height'),
            shop_name=data.get('shop_name')
        )

        if not shop:
            return jsonify({"error": "Shop not found"}), 404

        # Update equipment positions if provided
        equipment_updates = data.get('equipment_positions')
        if equipment_updates:
            for eq_update in equipment_updates:
                equipment_id = eq_update.get('equipment_id')
                x = eq_update.get('x')
                y = eq_update.get('y')
                z = eq_update.get('z', 0)
                rotation_deg = eq_update.get('rotation_deg', 0)

                if equipment_id is not None:
                    try:
                        update_equipment_position(shop_id, equipment_id, x, y, z, rotation_deg=rotation_deg)
                    except ValueError as e:
                        # Log the error but don't fail the entire save
                        print(f"Warning: Could not update equipment {equipment_id}: {e}")

            # Refetch shop to get updated equipment positions
            shop = get_shop_space_by_id(shop_id)

        return jsonify({
            "message": "Shop updated successfully",
            "shop": shop
        }), 200

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
