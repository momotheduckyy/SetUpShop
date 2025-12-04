// Convert degrees → radians
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

// Given width/depth in feet, center (x,y) in feet, and rotation in deg,
// compute an axis-aligned bounding box that fully contains the rotated rect.
export function getEquipmentBoundingBox(eq, x, y) {
  const w = eq.widthFt;
  const h = eq.depthFt;
  const theta = degToRad(eq.rotationDeg || 0);

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  // Half extents in local space
  const hw = w / 2;
  const hh = h / 2;

  // Rotated extents projected onto x and y axes
  const ex = Math.abs(cosT) * hw + Math.abs(sinT) * hh;
  const ey = Math.abs(sinT) * hw + Math.abs(cosT) * hh;

  return {
    left:   x - ex,
    right:  x + ex,
    top:    y - ey,
    bottom: y + ey,
  };
}

// Axis-aligned bounding box overlap test
export function boxesOverlap(a, b) {
  return !(
    a.right  <= b.left  ||
    a.left   >= b.right ||
    a.bottom <= b.top   ||
    a.top    >= b.bottom
  );
}

// Check if eq can be placed at (x,y) without overlapping other equipment in the shop.
// ignoreId: optional eq.id to skip (for moves, so we don't collide with ourselves).
export function canPlaceEquipment(shop, eq, x, y, ignoreId = null) {
  if (!shop || !shop.equipment_list) return true;

  const candidateBox = getEquipmentBoundingBox(eq, x, y);

  for (const other of shop.equipment_list) {
    if (!other) continue;
    if (ignoreId != null && other.id === ignoreId) continue;

    const otherBox = getEquipmentBoundingBox(
      other,
      other.x,
      other.y
    );

    if (boxesOverlap(candidateBox, otherBox)) {
      return false; // collision!
    }
  }

  return true;
}
