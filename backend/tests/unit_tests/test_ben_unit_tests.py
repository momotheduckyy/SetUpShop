"""
Unit tests for users database functions
Tests cover the main CRUD operations and helper functions in users_functions.py

Author: Ben
Branch: SET-51-ben-unit-tests
"""
import pytest
import sys
import sqlite3
import tempfile
from pathlib import Path

# Add repo to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "repo"))

from users_functions import (
    _hash_password,
    _verify_password,
    _row_to_dict,
    add_user,
    auth_user,
    delete_user,
    check_usernames,
    get_user_by_id
)


class TestPasswordHashing:
    """Test password hashing and verification functions"""

    def test_hash_password_returns_string(self):
        """Test 1: Hash function returns a string"""
        result = _hash_password("testpassword123")
        assert isinstance(result, str)

    def test_hash_password_is_deterministic(self):
        """Test 2: Same password produces same hash"""
        password = "mySecurePass123"
        hash1 = _hash_password(password)
        hash2 = _hash_password(password)
        assert hash1 == hash2

    def test_verify_password_correct(self):
        """Test 3: Verify password returns True for correct password"""
        password = "testpass"
        hashed = _hash_password(password)
        assert _verify_password(hashed, password) is True

    def test_verify_password_incorrect(self):
        """Test 4: Verify password returns False for incorrect password"""
        password = "correctpass"
        hashed = _hash_password(password)
        assert _verify_password(hashed, "wrongpass") is False


class TestRowToDict:
    """Test the row to dict conversion helper function"""

    def test_row_to_dict_returns_none_for_none(self):
        """Test 5: _row_to_dict returns None when given None input"""
        result = _row_to_dict(None)
        assert result is None

    def test_row_to_dict_removes_password(self):
        """Test 6: _row_to_dict removes password field from result"""
        # Create a mock row object
        class MockRow:
            def __init__(self):
                self.data = {
                    'id': 1,
                    'username': 'testuser',
                    'name': 'Test User',
                    'email': 'test@example.com',
                    'password': 'hashed_password',
                    'shop_spaces': '[]'
                }

            def keys(self):
                return self.data.keys()

            def __getitem__(self, key):
                return self.data[key]

        mock_row = MockRow()
        result = _row_to_dict(mock_row)

        assert 'password' not in result
        assert 'username' in result


class TestAddUser:
    """Test user creation functionality"""

    def test_add_user_returns_dict(self):
        """Test 7: add_user returns a dictionary with user data"""
        import uuid
        unique_id = str(uuid.uuid4())[:8]

        result = add_user(
            username=f"testuser_{unique_id}",
            name="Test User",
            email=f"test_{unique_id}@example.com",
            password="password123"
        )

        assert isinstance(result, dict)
        assert 'id' in result
        assert 'username' in result
        assert 'email' in result
        assert 'password' not in result  # Password should be excluded

        # Cleanup
        if result and 'id' in result:
            delete_user(result['id'])


class TestGetUserById:
    """Test retrieving users by ID"""

    def test_get_user_by_id_returns_user(self):
        """Test 8: get_user_by_id retrieves the correct user"""
        import uuid
        unique_id = str(uuid.uuid4())[:8]

        # Create a test user
        new_user = add_user(
            username=f"getbyid_{unique_id}",
            name="GetById Test",
            email=f"getbyid_{unique_id}@example.com",
            password="testpass"
        )

        # Retrieve the user
        retrieved_user = get_user_by_id(new_user['id'])

        assert retrieved_user is not None
        assert retrieved_user['id'] == new_user['id']
        assert retrieved_user['username'] == new_user['username']

        # Cleanup
        delete_user(new_user['id'])


class TestAuthUser:
    """Test user authentication functionality"""

    def test_auth_user_with_correct_password(self):
        """Test 9: auth_user returns user data with correct credentials"""
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        password = "securepass123"

        # Create a test user
        new_user = add_user(
            username=f"authtest_{unique_id}",
            name="Auth Test",
            email=f"auth_{unique_id}@example.com",
            password=password
        )

        # Authenticate with username
        auth_result = auth_user(new_user['username'], password)

        assert auth_result is not None
        assert auth_result['id'] == new_user['id']
        assert auth_result['username'] == new_user['username']

        # Cleanup
        delete_user(new_user['id'])


class TestDeleteUser:
    """Test user deletion functionality"""

    def test_delete_user_removes_user(self):
        """Test 10: delete_user successfully removes user from database"""
        import uuid
        unique_id = str(uuid.uuid4())[:8]

        # Create a test user
        new_user = add_user(
            username=f"deletetest_{unique_id}",
            name="Delete Test",
            email=f"delete_{unique_id}@example.com",
            password="temppass"
        )

        user_id = new_user['id']

        # Delete the user
        delete_result = delete_user(user_id)
        assert delete_result is True

        # Verify user is deleted
        retrieved_user = get_user_by_id(user_id)
        assert retrieved_user is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
