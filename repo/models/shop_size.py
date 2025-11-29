from dataclasses import dataclass, field
from typing import List, Dict, Any


@dataclass
class ShopSize:
  """
  Represents the size/shape of a shop.

  For now, it's just a rectangular prism (length/width/height),
  but shape_type + vertices let us support more complex shapes later.
  """
  length: float
  width: float
  height: float
  shape_type: str = "rectangle"      # e.g. "rectangle", "polygon"
  vertices: List[Dict[str, float]] = field(default_factory=list)

  @classmethod
  def from_dict(cls, data: Dict[str, Any]) -> "ShopSize":
    """
    Build from JSON-style dict. Supports both snake_case and camelCase keys.
    """
    # allow both { length, width, height } and { lengthFt, widthFt, heightFt }
    length = data.get("length") or data.get("lengthFt")
    width = data.get("width") or data.get("widthFt")
    height = data.get("height") or data.get("heightFt")

    shape_type = data.get("shape_type") or data.get("shapeType") or "rectangle"
    vertices = data.get("vertices") or []

    if length is None or width is None or height is None:
      raise ValueError("ShopSize requires length, width, and height")

    return cls(
      length=float(length),
      width=float(width),
      height=float(height),
      shape_type=shape_type,
      vertices=vertices,
    )

  def to_db_dimensions(self):
    """
    Helper if your DB layer still expects raw dimensions.
    """
    return self.length, self.width, self.height
