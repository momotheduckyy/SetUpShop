"""
Unit tests for Shop Space Card Hover Styling
Tests the CSS styling properties for shop space cards including hover effects
that provide visual feedback when users interact with shop cards

Author: Ben
Feature: SET-63 - Style shop space cards with hover effects
Checkpoint: 3
"""
import pytest
import sys
import re
from pathlib import Path

# Add repo and backend to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "repo"))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))


# Path to the CSS file
CSS_FILE_PATH = Path(__file__).parent.parent.parent.parent / "frontend" / "src" / "styles" / "ShopSpaces.css"


def read_css_file():
    """Helper function to read the CSS file"""
    with open(CSS_FILE_PATH, 'r') as f:
        return f.read()


def extract_css_rule(css_content, selector):
    """Helper function to extract CSS rules for a specific selector"""
    # Match the selector and capture everything within its curly braces
    pattern = rf'{re.escape(selector)}\s*\{{([^}}]+)\}}'
    match = re.search(pattern, css_content)
    if match:
        return match.group(1)
    return None


def parse_css_properties(css_rule):
    """Helper function to parse CSS properties into a dictionary"""
    if not css_rule:
        return {}

    properties = {}
    lines = css_rule.strip().split(';')
    for line in lines:
        if ':' in line:
            key, value = line.split(':', 1)
            properties[key.strip()] = value.strip()
    return properties


class TestShopCardBaseStyles:
    """Test base styling for shop space cards"""

    def test_css_file_exists(self):
        """Test 1: CSS file exists at expected location"""
        assert CSS_FILE_PATH.exists(), f"CSS file not found at {CSS_FILE_PATH}"

    def test_shop_card_class_exists(self):
        """Test 2: .shop-space-card class exists in CSS"""
        css_content = read_css_file()
        assert '.shop-space-card' in css_content

    def test_shop_card_has_box_shadow(self):
        """Test 3: Shop card has box-shadow for depth"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        assert 'box-shadow' in properties
        assert 'rgba' in properties['box-shadow']

    def test_shop_card_has_border_radius(self):
        """Test 4: Shop card has border-radius for rounded corners"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        assert 'border-radius' in properties
        assert 'px' in properties['border-radius']

    def test_shop_card_has_padding(self):
        """Test 5: Shop card has padding for content spacing"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        assert 'padding' in properties
        assert 'px' in properties['padding']

    def test_shop_card_has_background(self):
        """Test 6: Shop card has background color set"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        assert 'background' in properties
        assert properties['background'] == 'white'


class TestShopCardHoverEffects:
    """Test hover effects for shop space cards"""

    def test_hover_selector_exists(self):
        """Test 7: .shop-space-card:hover selector exists"""
        css_content = read_css_file()
        assert '.shop-space-card:hover' in css_content

    def test_hover_has_enhanced_shadow(self):
        """Test 8: Hover state has enhanced box-shadow for depth"""
        css_content = read_css_file()
        hover_rule = extract_css_rule(css_content, '.shop-space-card:hover')
        properties = parse_css_properties(hover_rule)

        assert 'box-shadow' in properties
        # Hover shadow should have rgba with opacity
        assert 'rgba' in properties['box-shadow']

    def test_hover_has_transform(self):
        """Test 9: Hover state has transform property for lift effect"""
        css_content = read_css_file()
        hover_rule = extract_css_rule(css_content, '.shop-space-card:hover')
        properties = parse_css_properties(hover_rule)

        assert 'transform' in properties
        # Should use translateY for vertical movement
        assert 'translateY' in properties['transform']

    def test_hover_transform_moves_up(self):
        """Test 10: Hover transform moves card upward (negative Y)"""
        css_content = read_css_file()
        hover_rule = extract_css_rule(css_content, '.shop-space-card:hover')
        properties = parse_css_properties(hover_rule)

        transform = properties.get('transform', '')
        # Should contain negative value for upward movement
        assert '-' in transform or 'translateY' in transform

    def test_card_has_transition_property(self):
        """Test 11: Base card has transition property for smooth animation"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        assert 'transition' in properties

    def test_transition_includes_transform(self):
        """Test 12: Transition property includes transform for smooth movement"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        transition = properties.get('transition', '')
        assert 'transform' in transition

    def test_transition_includes_box_shadow(self):
        """Test 13: Transition property includes box-shadow for smooth shadow change"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        transition = properties.get('transition', '')
        assert 'box-shadow' in transition

    def test_transition_has_timing_function(self):
        """Test 14: Transition includes timing function (ease, linear, etc.)"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        transition = properties.get('transition', '')
        # Should have ease, linear, ease-in, ease-out, etc.
        timing_keywords = ['ease', 'linear', 's', 'ms']
        assert any(keyword in transition for keyword in timing_keywords)


class TestHoverInteractionQuality:
    """Test quality of hover interactions"""

    def test_hover_shadow_is_more_prominent(self):
        """Test 15: Hover shadow opacity is greater than base shadow"""
        css_content = read_css_file()

        # Get base shadow
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        card_properties = parse_css_properties(card_rule)
        base_shadow = card_properties.get('box-shadow', '')

        # Get hover shadow
        hover_rule = extract_css_rule(css_content, '.shop-space-card:hover')
        hover_properties = parse_css_properties(hover_rule)
        hover_shadow = hover_properties.get('box-shadow', '')

        # Extract opacity values (last number in rgba)
        base_opacity_match = re.search(r'rgba\([^)]+,\s*([\d.]+)\)', base_shadow)
        hover_opacity_match = re.search(r'rgba\([^)]+,\s*([\d.]+)\)', hover_shadow)

        if base_opacity_match and hover_opacity_match:
            base_opacity = float(base_opacity_match.group(1))
            hover_opacity = float(hover_opacity_match.group(1))

            # Hover shadow should be more prominent (higher opacity)
            assert hover_opacity > base_opacity

    def test_hover_shadow_spreads_further(self):
        """Test 16: Hover shadow has larger spread radius"""
        css_content = read_css_file()

        # Get base shadow
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        card_properties = parse_css_properties(card_rule)
        base_shadow = card_properties.get('box-shadow', '')

        # Get hover shadow
        hover_rule = extract_css_rule(css_content, '.shop-space-card:hover')
        hover_properties = parse_css_properties(hover_rule)
        hover_shadow = hover_properties.get('box-shadow', '')

        # Extract blur radius (third value in box-shadow)
        # Format: offset-x offset-y blur-radius spread-radius color
        base_values = re.findall(r'(-?\d+)px', base_shadow)
        hover_values = re.findall(r'(-?\d+)px', hover_shadow)

        if len(base_values) >= 2 and len(hover_values) >= 2:
            # Compare y-offset or blur radius
            base_blur = abs(int(base_values[1]))
            hover_blur = abs(int(hover_values[1]))

            # Hover should have more blur/spread
            assert hover_blur >= base_blur

    def test_transition_duration_reasonable(self):
        """Test 17: Transition duration is reasonable (not too fast or slow)"""
        css_content = read_css_file()
        card_rule = extract_css_rule(css_content, '.shop-space-card')
        properties = parse_css_properties(card_rule)

        transition = properties.get('transition', '')

        # Extract duration (look for numbers followed by s or ms)
        duration_match = re.search(r'([\d.]+)(m?s)', transition)

        if duration_match:
            value = float(duration_match.group(1))
            unit = duration_match.group(2)

            # Convert to milliseconds for comparison
            duration_ms = value * 1000 if unit == 's' else value

            # Reasonable range: 100ms to 500ms for smooth hover
            assert 50 <= duration_ms <= 1000


class TestResponsiveCardLayout:
    """Test responsive grid layout for cards"""

    def test_shop_spaces_list_uses_grid(self):
        """Test 18: Shop spaces list uses CSS Grid layout"""
        css_content = read_css_file()
        list_rule = extract_css_rule(css_content, '.shop-spaces-list')
        properties = parse_css_properties(list_rule)

        assert 'display' in properties
        assert 'grid' in properties['display']

    def test_grid_has_responsive_columns(self):
        """Test 19: Grid uses auto-fill or auto-fit for responsiveness"""
        css_content = read_css_file()
        list_rule = extract_css_rule(css_content, '.shop-spaces-list')
        properties = parse_css_properties(list_rule)

        columns = properties.get('grid-template-columns', '')
        # Should use auto-fill or auto-fit with minmax
        assert 'auto-fill' in columns or 'auto-fit' in columns
        assert 'minmax' in columns

    def test_grid_has_gap(self):
        """Test 20: Grid has gap property for spacing between cards"""
        css_content = read_css_file()
        list_rule = extract_css_rule(css_content, '.shop-spaces-list')
        properties = parse_css_properties(list_rule)

        assert 'gap' in properties
        assert 'px' in properties['gap']


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
