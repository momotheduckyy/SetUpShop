"""
Unit tests for Create Shop Space functionality
Tests the backend functions that support creating new shop spaces
from the ShopSpaces component modal form

Author: Ben
Feature: SET-65 - Create New Shop Space button and modal
Checkpoint: 3
"""
import pytest
import sys
from pathlib import Path
import uuid

# Add repo and backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "repo"))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from repo.shop_space_functions import (
    create_shop_space,
    get_shop_space_by_id,
    get_shop_spaces_by_username,
    delete_shop_space
)
from users_functions import add_user, delete_user


@pytest.fixture
def test_user():
    """Create a test user for shop creation tests"""
    unique_id = str(uuid.uuid4())[:8]
    user = add_user(
        username=f"createtest_{unique_id}",
        name="Create Test User",
        email=f"createtest_{unique_id}@example.com",
        password="testpass123"
    )
    yield user
    # Cleanup
    if user and 'id' in user:
        delete_user(user['id'])


class TestCreateShopSpace:
    """Test creating new shop spaces via the modal form"""

    def test_create_shop_returns_dict(self, test_user):
        """Test 1: create_shop_space returns a dictionary with shop data"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="My New Workshop",
            length=40,
            width=30,
            height=10
        )

        assert isinstance(shop, dict)
        assert 'shop_id' in shop
        assert 'shop_name' in shop
        assert shop['shop_name'] == "My New Workshop"

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_shop_with_custom_dimensions(self, test_user):
        """Test 2: Shop can be created with custom dimensions"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Custom Size Shop",
            length=50,
            width=40,
            height=12
        )

        assert shop['length'] == 50
        assert shop['width'] == 40
        assert shop['height'] == 12

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_shop_generates_unique_id(self, test_user):
        """Test 3: Each created shop gets a unique shop_id"""
        shop1 = create_shop_space(
            username=test_user['username'],
            shop_name="Shop One",
            length=30,
            width=20,
            height=10
        )

        shop2 = create_shop_space(
            username=test_user['username'],
            shop_name="Shop Two",
            length=30,
            width=20,
            height=10
        )

        assert shop1['shop_id'] != shop2['shop_id']

        # Cleanup
        delete_shop_space(shop1['shop_id'])
        delete_shop_space(shop2['shop_id'])

    def test_create_shop_initializes_empty_equipment(self, test_user):
        """Test 4: New shop starts with empty equipment list"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Empty Shop",
            length=40,
            width=30,
            height=10
        )

        assert 'equipment' in shop
        assert isinstance(shop['equipment'], list)
        assert len(shop['equipment']) == 0

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_shop_associates_with_username(self, test_user):
        """Test 5: Created shop is associated with correct username"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="User's Shop",
            length=40,
            width=30,
            height=10
        )

        assert shop['username'] == test_user['username']

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_shop_appears_in_user_list(self, test_user):
        """Test 6: Created shop appears in user's shop list"""
        # Get initial count
        initial_shops = get_shop_spaces_by_username(test_user['username'])
        initial_count = len(initial_shops)

        # Create new shop
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Listed Shop",
            length=40,
            width=30,
            height=10
        )

        # Check it appears in list
        updated_shops = get_shop_spaces_by_username(test_user['username'])
        assert len(updated_shops) == initial_count + 1

        shop_ids = [s['shop_id'] for s in updated_shops]
        assert shop['shop_id'] in shop_ids

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_shop_can_be_retrieved_by_id(self, test_user):
        """Test 7: Created shop can be retrieved by its ID"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Retrievable Shop",
            length=40,
            width=30,
            height=10
        )

        retrieved_shop = get_shop_space_by_id(shop['shop_id'])

        assert retrieved_shop is not None
        assert retrieved_shop['shop_id'] == shop['shop_id']
        assert retrieved_shop['shop_name'] == "Retrievable Shop"

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_shop_has_timestamp(self, test_user):
        """Test 8: Created shop has creation_timestamp field"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Timestamped Shop",
            length=40,
            width=30,
            height=10
        )

        assert 'creation_timestamp' in shop
        assert shop['creation_timestamp'] is not None
        assert isinstance(shop['creation_timestamp'], str)

        # Cleanup
        delete_shop_space(shop['shop_id'])

    def test_create_multiple_shops_for_same_user(self, test_user):
        """Test 9: User can create multiple shops"""
        shop1 = create_shop_space(
            username=test_user['username'],
            shop_name="First Shop",
            length=40,
            width=30,
            height=10
        )

        shop2 = create_shop_space(
            username=test_user['username'],
            shop_name="Second Shop",
            length=50,
            width=40,
            height=12
        )

        shops = get_shop_spaces_by_username(test_user['username'])
        assert len(shops) >= 2

        shop_names = [s['shop_name'] for s in shops]
        assert "First Shop" in shop_names
        assert "Second Shop" in shop_names

        # Cleanup
        delete_shop_space(shop1['shop_id'])
        delete_shop_space(shop2['shop_id'])

    def test_create_shop_with_decimal_dimensions(self, test_user):
        """Test 10: Shop can be created with decimal dimension values"""
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Decimal Shop",
            length=40.5,
            width=30.75,
            height=10.25
        )

        assert shop['length'] == 40.5
        assert shop['width'] == 30.75
        assert shop['height'] == 10.25

        # Cleanup
        delete_shop_space(shop['shop_id'])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
