"""
Unit tests for Equipment Persistence in Shop Spaces
Tests the backend functionality for adding user equipment to shop spaces,
validating ownership, and ensuring equipment persists correctly.

Author: Ben
Feature: SET-67 - Equipment persistence from user inventory to shop spaces
Checkpoint: 3
"""
import pytest
import sys
import json
from pathlib import Path
from datetime import date

# Add repo and backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "repo"))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from shop_space_functions import (
    create_shop_space,
    get_shop_space_by_id,
    add_equipment_to_shop_space,
    delete_shop_space
)
from users_functions import add_user, delete_user
from equipment_library_db import (
    add_equipment_type,
    add_equipment_to_user,
    get_equipment_by_user,
    delete_user_equipment
)
from models.placement import Position, EquipmentPlacement
import uuid


@pytest.fixture
def test_user():
    """Create a test user for equipment tests"""
    unique_id = str(uuid.uuid4())[:8]
    user = add_user(
        username=f"equiptest_{unique_id}",
        name="Equipment Test User",
        email=f"equiptest_{unique_id}@example.com",
        password="testpass123"
    )
    yield user
    # Cleanup
    if user and 'id' in user:
        delete_user(user['id'])


@pytest.fixture
def test_equipment_type():
    """Create a test equipment type in catalog"""
    unique_id = str(uuid.uuid4())[:8]
    equipment_type = add_equipment_type(
        equipment_name=f"Test Saw {unique_id}",
        description="Test equipment for unit tests",
        width=5,
        height=4,
        depth=3,
        maintenance_interval_days=90
    )
    yield equipment_type
    # Equipment types are not cleaned up as they're catalog items


@pytest.fixture
def test_user_equipment(test_user, test_equipment_type):
    """Create user equipment instance"""
    equipment = add_equipment_to_user(
        user_id=test_user['id'],
        equipment_type_id=test_equipment_type['id'],
        notes="Test equipment instance",
        purchase_date=date.today()
    )
    yield equipment
    # Cleanup
    if equipment and 'id' in equipment:
        delete_user_equipment(equipment['id'])


@pytest.fixture
def test_shop(test_user):
    """Create a test shop space"""
    shop = create_shop_space(
        username=test_user['username'],
        shop_name="Test Workshop",
        length=40,
        width=30,
        height=10
    )
    yield shop
    # Cleanup
    if shop and 'shop_id' in shop:
        delete_shop_space(shop['shop_id'])


class TestEquipmentTypeSchema:
    """Test equipment_types table has required fields for shop editor"""

    def test_equipment_type_has_color(self, test_equipment_type):
        """Test 1: Equipment type includes color field"""
        # Color may be default '#aaa' if not specified
        assert 'color' in test_equipment_type or test_equipment_type.get('color') is not None

    def test_equipment_type_has_dimensions(self, test_equipment_type):
        """Test 2: Equipment type has width, height, depth for canvas"""
        assert 'width' in test_equipment_type
        assert 'height' in test_equipment_type
        assert 'depth' in test_equipment_type
        assert test_equipment_type['width'] == 5
        assert test_equipment_type['height'] == 4
        assert test_equipment_type['depth'] == 3


class TestUserEquipmentRetrieval:
    """Test retrieving user equipment with full details"""

    def test_get_user_equipment_returns_list(self, test_user, test_user_equipment):
        """Test 3: get_equipment_by_user returns a list"""
        equipment = get_equipment_by_user(test_user['id'])
        assert isinstance(equipment, list)
        assert len(equipment) >= 1

    def test_user_equipment_includes_type_details(self, test_user, test_user_equipment):
        """Test 4: User equipment includes equipment_type details via JOIN"""
        equipment = get_equipment_by_user(test_user['id'])
        assert len(equipment) > 0

        eq = equipment[0]
        # Should have user_equipment fields
        assert 'id' in eq
        assert 'user_id' in eq
        assert 'equipment_type_id' in eq

        # Should have equipment_types fields (from JOIN)
        assert 'equipment_name' in eq
        assert 'width' in eq
        assert 'height' in eq
        assert 'depth' in eq

    def test_user_equipment_includes_display_fields(self, test_user, test_user_equipment):
        """Test 5: User equipment includes color, manufacturer, model for UI"""
        equipment = get_equipment_by_user(test_user['id'])
        eq = equipment[0]

        # New fields added for shop editor
        assert 'color' in eq
        assert 'manufacturer' in eq
        assert 'model' in eq


class TestAddEquipmentToShop:
    """Test adding user equipment to shop spaces"""

    def test_add_equipment_creates_placement(self, test_shop, test_user_equipment):
        """Test 6: Equipment can be added to shop with coordinates"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )

        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement)

        assert updated_shop is not None
        assert 'equipment' in updated_shop
        assert len(updated_shop['equipment']) == 1

    def test_equipment_placement_has_coordinates(self, test_shop, test_user_equipment):
        """Test 7: Equipment placement stores x, y, z coordinates"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=200, y=250, z=0)
        )

        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement)
        equipment_list = updated_shop['equipment']

        assert len(equipment_list) == 1
        eq = equipment_list[0]
        assert eq['x_coordinate'] == 200
        assert eq['y_coordinate'] == 250
        assert eq['z_coordinate'] == 0

    def test_equipment_placement_has_equipment_id(self, test_shop, test_user_equipment):
        """Test 8: Equipment placement references user_equipment ID"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )

        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement)
        equipment_list = updated_shop['equipment']

        eq = equipment_list[0]
        assert 'equipment_id' in eq
        assert eq['equipment_id'] == test_user_equipment['id']

    def test_multiple_equipment_can_be_added(self, test_shop, test_user, test_equipment_type):
        """Test 9: Multiple equipment items can be added to same shop"""
        # Add first equipment
        equipment1 = add_equipment_to_user(
            user_id=test_user['id'],
            equipment_type_id=test_equipment_type['id'],
            notes="First equipment"
        )

        placement1 = EquipmentPlacement(
            equipment_id=equipment1['id'],
            position=Position(x=100, y=100, z=0)
        )
        add_equipment_to_shop_space(test_shop['shop_id'], placement1)

        # Add second equipment
        equipment2 = add_equipment_to_user(
            user_id=test_user['id'],
            equipment_type_id=test_equipment_type['id'],
            notes="Second equipment"
        )

        placement2 = EquipmentPlacement(
            equipment_id=equipment2['id'],
            position=Position(x=300, y=200, z=0)
        )
        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement2)

        assert len(updated_shop['equipment']) == 2

        # Cleanup
        delete_user_equipment(equipment1['id'])
        delete_user_equipment(equipment2['id'])


class TestEquipmentOwnershipValidation:
    """Test equipment ownership validation"""

    def test_cannot_add_nonexistent_equipment(self, test_shop):
        """Test 10: Cannot add equipment that doesn't exist"""
        placement = EquipmentPlacement(
            equipment_id=99999,  # Non-existent ID
            position=Position(x=100, y=150, z=0)
        )

        with pytest.raises(ValueError, match="does not exist"):
            add_equipment_to_shop_space(test_shop['shop_id'], placement)

    def test_cannot_add_other_users_equipment(self, test_shop):
        """Test 11: Cannot add equipment belonging to another user"""
        # Create another user with equipment
        other_user = add_user(
            username=f"other_{uuid.uuid4().hex[:8]}",
            name="Other User",
            email=f"other_{uuid.uuid4().hex[:8]}@example.com",
            password="testpass123"
        )

        equipment_type = add_equipment_type(
            equipment_name=f"Other Saw {uuid.uuid4().hex[:8]}",
            description="Equipment for other user",
            width=3,
            height=3,
            depth=3,
            maintenance_interval_days=90
        )

        other_equipment = add_equipment_to_user(
            user_id=other_user['id'],
            equipment_type_id=equipment_type['id'],
            notes="Other user's equipment"
        )

        # Try to add other user's equipment to test shop
        placement = EquipmentPlacement(
            equipment_id=other_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )

        with pytest.raises(ValueError, match="does not belong to user"):
            add_equipment_to_shop_space(test_shop['shop_id'], placement)

        # Cleanup
        delete_user_equipment(other_equipment['id'])
        delete_user(other_user['id'])


class TestEquipmentPersistence:
    """Test equipment persistence across shop retrievals"""

    def test_equipment_persists_after_save(self, test_shop, test_user_equipment):
        """Test 12: Equipment persists when shop is retrieved again"""
        # Add equipment
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=175, y=225, z=0)
        )
        add_equipment_to_shop_space(test_shop['shop_id'], placement)

        # Retrieve shop again
        retrieved_shop = get_shop_space_by_id(test_shop['shop_id'])

        assert retrieved_shop is not None
        assert len(retrieved_shop['equipment']) == 1
        eq = retrieved_shop['equipment'][0]
        assert eq['equipment_id'] == test_user_equipment['id']
        assert eq['x_coordinate'] == 175
        assert eq['y_coordinate'] == 225

    def test_equipment_coordinates_persist_exactly(self, test_shop, test_user_equipment):
        """Test 13: Equipment coordinates persist with exact values"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=123.456, y=789.012, z=0)
        )
        add_equipment_to_shop_space(test_shop['shop_id'], placement)

        retrieved_shop = get_shop_space_by_id(test_shop['shop_id'])
        eq = retrieved_shop['equipment'][0]

        # Check coordinates are preserved
        assert eq['x_coordinate'] == 123.456
        assert eq['y_coordinate'] == 789.012
        assert eq['z_coordinate'] == 0

    def test_multiple_equipment_persist_in_order(self, test_shop, test_user, test_equipment_type):
        """Test 14: Multiple equipment items persist in order added"""
        equipment_ids = []

        # Add 3 equipment items
        for i in range(3):
            equipment = add_equipment_to_user(
                user_id=test_user['id'],
                equipment_type_id=test_equipment_type['id'],
                notes=f"Equipment {i+1}"
            )
            equipment_ids.append(equipment['id'])

            placement = EquipmentPlacement(
                equipment_id=equipment['id'],
                position=Position(x=100 * (i+1), y=150 * (i+1), z=0)
            )
            add_equipment_to_shop_space(test_shop['shop_id'], placement)

        # Retrieve and verify
        retrieved_shop = get_shop_space_by_id(test_shop['shop_id'])
        assert len(retrieved_shop['equipment']) == 3

        # Verify order and positions
        for i, eq in enumerate(retrieved_shop['equipment']):
            assert eq['equipment_id'] == equipment_ids[i]
            assert eq['x_coordinate'] == 100 * (i+1)
            assert eq['y_coordinate'] == 150 * (i+1)

        # Cleanup
        for eq_id in equipment_ids:
            delete_user_equipment(eq_id)


class TestEquipmentDataIntegrity:
    """Test equipment data integrity and JSON storage"""

    def test_equipment_stored_as_json_array(self, test_shop, test_user_equipment):
        """Test 15: Equipment is stored as valid JSON array"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )
        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement)

        # Equipment should be a list
        assert isinstance(updated_shop['equipment'], list)

        # Should be serializable to JSON
        json_str = json.dumps(updated_shop['equipment'])
        assert json_str is not None

        # Should be deserializable
        deserialized = json.loads(json_str)
        assert isinstance(deserialized, list)
        assert len(deserialized) == 1

    def test_equipment_has_timestamp(self, test_shop, test_user_equipment):
        """Test 16: Equipment placement includes date_added timestamp"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )
        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement)

        eq = updated_shop['equipment'][0]
        assert 'date_added' in eq
        assert eq['date_added'] is not None

        # Timestamp should be ISO format
        from datetime import datetime
        timestamp = datetime.fromisoformat(eq['date_added'])
        assert timestamp is not None

    def test_empty_shop_has_empty_equipment_list(self, test_shop):
        """Test 17: New shop starts with empty equipment list"""
        shop = get_shop_space_by_id(test_shop['shop_id'])

        assert 'equipment' in shop
        assert isinstance(shop['equipment'], list)
        assert len(shop['equipment']) == 0


class TestShopAndEquipmentIntegration:
    """Test integration between shops and equipment"""

    def test_shop_with_equipment_has_all_fields(self, test_shop, test_user_equipment):
        """Test 18: Shop with equipment includes both shop and equipment data"""
        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )
        updated_shop = add_equipment_to_shop_space(test_shop['shop_id'], placement)

        # Shop fields
        assert 'shop_id' in updated_shop
        assert 'shop_name' in updated_shop
        assert 'username' in updated_shop
        assert 'length' in updated_shop
        assert 'width' in updated_shop
        assert 'height' in updated_shop

        # Equipment array
        assert 'equipment' in updated_shop
        assert len(updated_shop['equipment']) > 0

        # Equipment fields
        eq = updated_shop['equipment'][0]
        assert 'equipment_id' in eq
        assert 'x_coordinate' in eq
        assert 'y_coordinate' in eq
        assert 'z_coordinate' in eq

    def test_deleting_shop_removes_equipment_references(self, test_user, test_user_equipment):
        """Test 19: Deleting shop removes equipment placements but not user equipment"""
        # Create shop with equipment
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Temporary Shop",
            length=30,
            width=20,
            height=10
        )

        placement = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=150, z=0)
        )
        add_equipment_to_shop_space(shop['shop_id'], placement)

        # Delete shop
        delete_shop_space(shop['shop_id'])

        # Shop should be gone
        deleted_shop = get_shop_space_by_id(shop['shop_id'])
        assert deleted_shop is None

        # But user equipment should still exist
        user_equipment = get_equipment_by_user(test_user['id'])
        equipment_ids = [eq['id'] for eq in user_equipment]
        assert test_user_equipment['id'] in equipment_ids

    def test_user_can_place_same_equipment_in_multiple_shops(
        self, test_user, test_user_equipment
    ):
        """Test 20: Same user equipment can be placed in multiple shops"""
        # Create two shops
        shop1 = create_shop_space(
            username=test_user['username'],
            shop_name="Workshop 1",
            length=30,
            width=20,
            height=10
        )

        shop2 = create_shop_space(
            username=test_user['username'],
            shop_name="Workshop 2",
            length=40,
            width=30,
            height=12
        )

        # Place same equipment in both shops at different positions
        placement1 = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=100, y=100, z=0)
        )
        add_equipment_to_shop_space(shop1['shop_id'], placement1)

        placement2 = EquipmentPlacement(
            equipment_id=test_user_equipment['id'],
            position=Position(x=300, y=200, z=0)
        )
        add_equipment_to_shop_space(shop2['shop_id'], placement2)

        # Both shops should have the equipment
        retrieved_shop1 = get_shop_space_by_id(shop1['shop_id'])
        retrieved_shop2 = get_shop_space_by_id(shop2['shop_id'])

        assert len(retrieved_shop1['equipment']) == 1
        assert len(retrieved_shop2['equipment']) == 1

        # Same equipment, different positions
        assert retrieved_shop1['equipment'][0]['equipment_id'] == test_user_equipment['id']
        assert retrieved_shop2['equipment'][0]['equipment_id'] == test_user_equipment['id']
        assert retrieved_shop1['equipment'][0]['x_coordinate'] == 100
        assert retrieved_shop2['equipment'][0]['x_coordinate'] == 300

        # Cleanup
        delete_shop_space(shop1['shop_id'])
        delete_shop_space(shop2['shop_id'])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
