// frontend/src/utils/shopCanvasHitTest.js

// Convert mouse event into shop coordinates (feet), using the current view
export function getShopCoordsFromEvent(e, canvas, view) {
  if (!canvas || !view) return null;

  const rect = canvas.getBoundingClientRect();
  const { scale, offsetX, offsetY } = view;

  const px = e.clientX - rect.left;
  const py = e.clientY - rect.top;

  const x = (px - offsetX) / scale;
  const y = (py - offsetY) / scale;

  return { x, y };
}

// Find the topmost equipment at a given (x, y) point in shop coordinates
export function findEquipmentAtPosition(shop, x, y) {
  if (!shop) return null;

  // Check from topmost to bottommost by reversing the array
  const reversed = [...shop.equipment_list].reverse();

  for (const eq of reversed) {
    const w = eq.widthFt;
    const h = eq.depthFt;

    const left = eq.x - w / 2;
    const top = eq.y - h / 2;
    const right = left + w;
    const bottom = top + h;

    if (x >= left && x <= right && y >= top && y <= bottom) {
      return eq;
    }
  }

  return null;
}
