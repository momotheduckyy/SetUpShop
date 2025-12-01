from flask import Blueprint, request, jsonify
import sys
from pathlib import Path

# Add repo directory to Python path
sys.path.append(str(Path(__file__).parent.parent.parent / "repo"))

from equipment_library_db import (
    get_equipment_catalog,
    get_equipment_type_by_id,
    add_equipment_type,
    get_equipment_by_user,
    add_equipment_to_user,
    get_user_equipment_by_id,
    perform_maintenance,
    delete_user_equipment,
    get_maintenance_summary
)

equipment_bp = Blueprint('equipment', __name__)

# Equipment Catalog Routes
@equipment_bp.route('/catalog', methods=['GET'])
def get_catalog():
    """Get all available equipment types"""
    try:
        catalog = get_equipment_catalog()
        return jsonify({"equipment": catalog}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/catalog/<int:equipment_type_id>', methods=['GET'])
def get_equipment_type(equipment_type_id):
    """Get specific equipment type from catalog"""
    try:
        equipment_type = get_equipment_type_by_id(equipment_type_id)
        if equipment_type:
            return jsonify({"equipment_type": equipment_type}), 200
        else:
            return jsonify({"error": "Equipment type not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/catalog', methods=['POST'])
def add_catalog_equipment():
    """Add new equipment type to catalog (admin)"""
    try:
        data = request.get_json()
        equipment = add_equipment_type(
            equipment_name=data.get('equipment_name'),
            description=data.get('description'),
            width=data.get('width'),
            height=data.get('height'),
            depth=data.get('depth'),
            maintenance_interval_days=data.get('maintenance_interval_days')
        )
        return jsonify({"equipment_type": equipment}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# User Equipment Routes
@equipment_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_equipment(user_id):
    """Get all equipment owned by a user"""
    try:
        equipment = get_equipment_by_user(user_id)
        return jsonify({"equipment": equipment}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/user/<int:user_id>', methods=['POST'])
def add_user_equipment(user_id):
    """User purchases equipment"""
    try:
        data = request.get_json()
        equipment = add_equipment_to_user(
            user_id=user_id,
            equipment_type_id=data.get('equipment_type_id'),
            notes=data.get('notes'),
            purchase_date=data.get('purchase_date')
        )
        return jsonify({
            "message": "Equipment added successfully",
            "equipment": equipment
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/<int:equipment_id>', methods=['GET'])
def get_equipment(equipment_id):
    """Get specific equipment instance"""
    try:
        equipment = get_user_equipment_by_id(equipment_id)
        if equipment:
            return jsonify({"equipment": equipment}), 200
        else:
            return jsonify({"error": "Equipment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/<int:equipment_id>', methods=['DELETE'])
def delete_equipment(equipment_id):
    """Delete user equipment"""
    try:
        success = delete_user_equipment(equipment_id)
        if success:
            return jsonify({"message": "Equipment deleted successfully"}), 200
        else:
            return jsonify({"error": "Equipment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Maintenance Routes
@equipment_bp.route('/<int:equipment_id>/maintenance', methods=['POST'])
def record_maintenance(equipment_id):
    """Record maintenance for equipment"""
    try:
        data = request.get_json()
        maintenance_date = data.get('maintenance_date')
        equipment = perform_maintenance(equipment_id, maintenance_date)

        if equipment:
            return jsonify({
                "message": "Maintenance recorded successfully",
                "equipment": equipment
            }), 200
        else:
            return jsonify({"error": "Equipment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/user/<int:user_id>/maintenance-summary', methods=['GET'])
def get_user_maintenance_summary(user_id):
    """Get maintenance summary for user"""
    try:
        summary = get_maintenance_summary(user_id)
        return jsonify({"summary": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/maintenance-schedule/<int:user_id>', methods=['GET'])
def get_maintenance_schedule_route(user_id):
    """Get maintenance schedule with shop locations"""
    try:
        from equipment_library_db import get_maintenance_schedule_with_shops
        schedule = get_maintenance_schedule_with_shops(user_id)
        return jsonify(schedule), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@equipment_bp.route('/maintenance/complete/<int:equipment_id>', methods=['POST'])
def complete_maintenance(equipment_id):
    """Mark maintenance complete"""
    try:
        from equipment_library_db import perform_maintenance
        updated = perform_maintenance(equipment_id)
        return jsonify(updated), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
