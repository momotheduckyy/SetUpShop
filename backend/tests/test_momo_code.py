"""
Simple tests for equipment_library_db.py helper functions
"""
import pytest
import sys
from pathlib import Path
from datetime import date, timedelta

# Add repo to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "repo"))

from equipment_library_db import (
    days_to_readable_interval,
    _calculate_next_maintenance_date,
    _row_to_dict,
    add_equipment_type,
    get_equipment_by_user,
    perform_maintenance,
    delete_user_equipment
)


class TestDaysToReadableInterval:
    """Test the days_to_readable_interval conversion function"""
    
    def test_weekly_conversion(self):
        """Test 1: 7 days converts to 'weekly'"""
        assert days_to_readable_interval(7) == "weekly"
    
    def test_one_year_conversion(self):
        """Test 2: 365 days converts to '1 year'"""
        result = days_to_readable_interval(365)
        assert result == "1 year"
    
    def test_multiple_years_conversion(self):
        """Test 3: 730 days converts to '2 years'"""
        result = days_to_readable_interval(730)
        assert "2 years" in result
    
    def test_one_month_conversion(self):
        """Test 4: 30 days converts to '1 month'"""
        result = days_to_readable_interval(30)
        assert result == "1 month"
    
    def test_single_day_uses_singular(self):
        """Test 5: 1 day uses singular form 'day' not 'days'"""
        result = days_to_readable_interval(1)
        assert result == "1 day"
        assert "days" not in result


class TestMaintenanceDateCalculation:
    """Test the _calculate_next_maintenance_date function"""
    
    def test_calculate_from_date_object(self):
        """Test 6: Calculate next date from date object"""
        start = date(2025, 1, 1)
        result = _calculate_next_maintenance_date(start, 30)
        assert result == date(2025, 1, 31)
    
    def test_calculate_from_string_date(self):
        """Test 7: Calculate next date from ISO string date"""
        start = "2025-01-01"
        result = _calculate_next_maintenance_date(start, 7)
        assert result == date(2025, 1, 8)
    
    def test_calculate_with_large_interval(self):
        """Test 8: Calculate with 365 day interval spans a year"""
        start = date(2025, 1, 1)
        result = _calculate_next_maintenance_date(start, 365)
        assert result == date(2026, 1, 1)


class TestUtilityFunctions:
    """Test utility helper functions"""
    
    def test_row_to_dict_returns_none_for_none_input(self):
        """Test 9: _row_to_dict returns None when given None"""
        result = _row_to_dict(None)
        assert result is None
    
    def test_functions_are_callable(self):
        """Test 10: Verify main functions exist and are callable"""
        assert callable(add_equipment_type)
        assert callable(get_equipment_by_user)
        assert callable(perform_maintenance)
        assert callable(delete_user_equipment)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
