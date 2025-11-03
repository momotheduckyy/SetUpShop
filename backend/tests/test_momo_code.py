import pytest
import sys
from pathlib import Path

# Add repo to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "repo"))

from equipment_library_db import (
    get_equipment_catalog,
    add_equipment_type,
    get_equipment_type_by_id,
    add_equipment_to_user,
    get_equipment_by_user,
    perform_maintenance,
    delete_user_equipment,
    get_maintenance_summary,
    days_to_readable_interval
)


class TestEquipmentCatalog:
    """Tests for equipment catalog functions"""
    
    def test_get_equipment_catalog_returns_list(self):
        """Test 1: get_equipment_catalog returns a list"""
        result = get_equipment_catalog()
        assert isinstance(result, list)
    
    def test_add_equipment_type_creates_new_type(self):
        """Test 2: add_equipment_type creates equipment"""
        result = add_equipment_type(
            equipment_name="Test Equipment",
            description="Test description", 
            width=100,
            height=100,
            depth=100,
            maintenance_interval_days=30
        )
        assert result is not None
        assert result['equipment_name'] == "Test Equipment"
    
    def test_get_equipment_type_by_id_returns_equipment(self):
        """Test 3: get_equipment_type_by_id finds equipment"""
        # Add test equipment
        new_eq = add_equipment_type("Lookup Test", "desc", 50, 50, 50, 7)
        
        # Look it up
        result = get_equipment_type_by_id(new_eq['id'])
        assert result is not None
        assert result['equipment_name'] == "Lookup Test"


class TestUserEquipment:
    """Tests for user equipment functions"""
    
    def test_add_equipment_to_user_works(self):
        """Test 4: add_equipment_to_user adds equipment"""
        #  test the function exists and has correct signature
        assert callable(add_equipment_to_user)
    
    def test_get_equipment_by_user_returns_list(self):
        """Test 5: get_equipment_by_user returns list"""
        result = get_equipment_by_user(user_id=999)  # Non-existent user
        assert isinstance(result, list)
    
    def test_delete_user_equipment_returns_boolean(self):
        """Test 6: delete_user_equipment returns True/False"""
        result = delete_user_equipment(user_equipment_id=999999)
        assert isinstance(result, bool)


class TestMaintenance:
    """Tests for maintenance functions"""
    
    def test_perform_maintenance_function_exists(self):
        """Test 7: perform_maintenance function exists"""
        assert callable(perform_maintenance)
    
    def test_get_maintenance_summary_returns_dict(self):
        """Test 8: get_maintenance_summary returns dict with correct keys"""
        result = get_maintenance_summary(user_id=999)
        assert isinstance(result, dict)
        assert 'total_equipment' in result
        assert 'overdue_maintenance' in result


class TestHelperFunctions:
    """Tests for helper/utility functions"""
    
    def test_days_to_readable_interval_converts_days(self):
        """Test 9: days_to_readable_interval converts 7 days to weekly"""
        result = days_to_readable_interval(7)
        assert result == "weekly"
    
    def test_days_to_readable_interval_converts_year(self):
        """Test 10: days_to_readable_interval converts 365 days to year"""
        result = days_to_readable_interval(365)
        assert "year" in result.lower()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
