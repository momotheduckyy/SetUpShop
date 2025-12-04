from dataclasses import dataclass
from datetime import datetime

@dataclass
class Position:
    """Represents a 3D position in the shop space"""
    x: float
    y: float
    z: float
    
    def to_dict(self):
        """Convert position to dictionary for JSON"""
        return {
            "x": self.x,
            "y": self.y,
            "z": self.z
        }

@dataclass
class EquipmentPlacement:
    """Represents equipment placement with position and metadata"""
    equipment_id: int
    position: Position
    rotation_deg: float = 0.0
    date_added: str = None
    
    def __post_init__(self):
        """Automatically set date if not provided"""
        if self.date_added is None:
            self.date_added = datetime.now().isoformat()
    
    def to_dict(self):
        """Convert placement to dictionary for database storage"""
        return {
            "equipment_id": self.equipment_id,
            "date_added": self.date_added,
            "x_coordinate": self.position.x,
            "y_coordinate": self.position.y,
            "z_coordinate": self.position.z,
            "rotation_deg": self.rotation_deg,
        }
    
    @classmethod
    def from_dict(cls, data):
        """Create EquipmentPlacement from dictionary"""
        position = Position(
            x=data['x_coordinate'],
            y=data['y_coordinate'],
            z=data['z_coordinate']
        )
        return cls(
            equipment_id=data['equipment_id'],
            position=position,
            rotation_deg=data.get('rotation_deg', 0.0),
            date_added=data.get('date_added')
        )
