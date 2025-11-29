"""
Unit tests for Shop Spaces navigation functionality
Tests the backend API endpoints that support the ShopSpaces component
and its navigation features (including back button to dashboard)

Author: Ben
Feature: SET-62 - Back button from My Shop Spaces to Dashboard
Checkpoint: 3
"""
import pytest
import sys
import json
from pathlib import Path

# Add repo and backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "repo"))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from repo.shop_space_functions import (
    create_shop_space,
    get_shop_spaces_by_username,
    get_shop_space_by_id,
    delete_shop_space
)
from users_functions import add_user, delete_user
import uuid


@pytest.fixture
def test_user():
    """Create a test user for shop space tests"""
    unique_id = str(uuid.uuid4())[:8]
    user = add_user(
        username=f"shoptest_{unique_id}",
        name="Shop Test User",
        email=f"shoptest_{unique_id}@example.com",
        password="testpass123"
    )
    yield user
    # Cleanup
    if user and 'id' in user:
        delete_user(user['id'])


@pytest.fixture
def test_shop(test_user):
    """Create a test shop space for testing"""
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


class TestShopSpacesRetrieval:
    """Test retrieving shop spaces for navigation functionality"""

    def test_get_all_shops_returns_list(self, test_user, test_shop):
        """Test 1: get_shop_spaces_by_username returns a list"""
        result = get_shop_spaces_by_username(test_user['username'])
        assert isinstance(result, list)

    def test_get_all_shops_contains_created_shop(self, test_user, test_shop):
        """Test 2: Retrieved shop list contains the created shop"""
        shops = get_shop_spaces_by_username(test_user['username'])
        shop_ids = [shop['shop_id'] for shop in shops]
        assert test_shop['shop_id'] in shop_ids

    def test_get_all_shops_has_required_fields(self, test_user, test_shop):
        """Test 3: Shop objects have required fields for navigation UI"""
        shops = get_shop_spaces_by_username(test_user['username'])
        assert len(shops) > 0

        shop = shops[0]
        # Fields required by ShopSpaces.jsx component
        assert 'shop_id' in shop or 'id' in shop
        assert 'shop_name' in shop
        assert 'length' in shop
        assert 'width' in shop
        assert 'height' in shop


class TestShopSpaceNavigation:
    """Test navigation between dashboard and shop spaces"""

    def test_shop_exists_for_navigation(self, test_user, test_shop):
        """Test 4: Shop can be retrieved by ID for navigation"""
        shop = get_shop_space_by_id(test_shop['shop_id'])
        assert shop is not None
        assert shop['shop_id'] == test_shop['shop_id']

    def test_shop_has_name_for_display(self, test_user, test_shop):
        """Test 5: Shop has name field for UI display"""
        shop = get_shop_space_by_id(test_shop['shop_id'])
        assert 'shop_name' in shop
        assert shop['shop_name'] == "Test Workshop"

    def test_shop_has_dimensions_for_display(self, test_user, test_shop):
        """Test 6: Shop has dimension fields for UI display"""
        shop = get_shop_space_by_id(test_shop['shop_id'])
        assert 'length' in shop
        assert 'width' in shop
        assert 'height' in shop
        assert shop['length'] == 40
        assert shop['width'] == 30
        assert shop['height'] == 10


class TestBackButtonFunctionality:
    """Test backend support for back button navigation"""

    def test_user_can_list_shops_from_dashboard(self, test_user, test_shop):
        """Test 7: User can retrieve shop list when navigating from dashboard"""
        # Simulates clicking "View Shops" button on dashboard
        shops = get_shop_spaces_by_username(test_user['username'])
        assert isinstance(shops, list)
        assert len(shops) >= 1

    def test_empty_shop_list_returns_gracefully(self, test_user):
        """Test 8: Empty shop list returns empty array (not error) for new users"""
        # User with no shops should get empty list, not error
        shops = get_shop_spaces_by_username(test_user['username'])
        assert isinstance(shops, list)
        # New user should have no shops
        assert len(shops) == 0

    def test_multiple_shops_all_retrievable(self, test_user):
        """Test 9: Multiple shops can be created and retrieved for navigation"""
        # Create multiple shops
        shop1 = create_shop_space(
            username=test_user['username'],
            shop_name="Workshop 1",
            length=20,
            width=20,
            height=10
        )
        shop2 = create_shop_space(
            username=test_user['username'],
            shop_name="Workshop 2",
            length=30,
            width=25,
            height=12
        )

        # Retrieve all shops
        shops = get_shop_spaces_by_username(test_user['username'])

        assert len(shops) >= 2
        shop_names = [shop['shop_name'] for shop in shops]
        assert "Workshop 1" in shop_names
        assert "Workshop 2" in shop_names

        # Cleanup
        delete_shop_space(shop1['shop_id'])
        delete_shop_space(shop2['shop_id'])

    def test_shop_username_matches_logged_in_user(self, test_user, test_shop):
        """Test 10: Shop is associated with correct user for proper navigation"""
        shop = get_shop_space_by_id(test_shop['shop_id'])
        assert 'username' in shop
        assert shop['username'] == test_user['username']


class TestNavigationDataIntegrity:
    """Test data integrity for navigation between pages"""

    def test_shop_data_persists_across_retrieval(self, test_user, test_shop):
        """Test 11: Shop data remains consistent across multiple retrievals"""
        # First retrieval
        shop1 = get_shop_space_by_id(test_shop['shop_id'])

        # Second retrieval
        shop2 = get_shop_space_by_id(test_shop['shop_id'])

        # Data should be identical
        assert shop1['shop_id'] == shop2['shop_id']
        assert shop1['shop_name'] == shop2['shop_name']
        assert shop1['length'] == shop2['length']
        assert shop1['width'] == shop2['width']

    def test_shop_list_updates_after_deletion(self, test_user):
        """Test 12: Shop list updates correctly after shop deletion"""
        # Create a shop
        shop = create_shop_space(
            username=test_user['username'],
            shop_name="Temporary Shop",
            length=15,
            width=15,
            height=10
        )

        # Verify it appears in list
        shops_before = get_shop_spaces_by_username(test_user['username'])
        shop_ids_before = [s['shop_id'] for s in shops_before]
        assert shop['shop_id'] in shop_ids_before

        # Delete the shop
        delete_shop_space(shop['shop_id'])

        # Verify it's removed from list
        shops_after = get_shop_spaces_by_username(test_user['username'])
        shop_ids_after = [s['shop_id'] for s in shops_after]
        assert shop['shop_id'] not in shop_ids_after


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
