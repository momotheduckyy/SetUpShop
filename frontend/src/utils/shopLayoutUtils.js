

/**
 * Snap a coordinate in feet to the grid.
 * @param {number} x
 * @param {number} y
 * @param {number} gridSizeFt size of each grid square in feet
 * @returns {{x:number,y:number}}
 */
export function snapToGrid(x, y, gridSizeFt = 0.5) {
  if (!gridSizeFt || gridSizeFt <= 0) {
    return { x, y };
  }

  const snappedX = Math.round(x / gridSizeFt) * gridSizeFt;
  const snappedY = Math.round(y / gridSizeFt) * gridSizeFt;

  return { x: snappedX, y: snappedY };
}

/**
 * Clamp a coordinate so it stays inside the shop bounds.
 */
// shopLayoutUtils.js

/**
 * Clamp an equipment position so it stays inside the shop.
 *
 * Usage now:
 *   // old style (center-only clamp, ignores size/rotation)
 *   clampToShopBounds(x, y, shop);
 *
 *   // new style (full size + rotation aware)
 *   clampToShopBounds(x, y, shop, eq);
 *
 * eq is expected to have: widthFt, depthFt, rotationDeg (optional)
 */
export function clampToShopBounds(x, y, shop, eq) {
  if (!shop || !eq) return { x, y };

  const shopW = shop.widthFt;
  const shopD = shop.depthFt;

  const w = eq.widthFt;
  const h = eq.depthFt;
  const rad = (eq.rotationDeg || 0) * Math.PI / 180;

  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const halfW = w / 2;
  const halfH = h / 2;

  // --- Rotated bounding box extents ---
  const rotatedHalfWidth =
    Math.abs(halfW * cos) + Math.abs(halfH * sin);

  const rotatedHalfHeight =
    Math.abs(halfW * sin) + Math.abs(halfH * cos);

  // --- Allowed ranges for center ---
  const minX = rotatedHalfWidth;
  const maxX = shopW - rotatedHalfWidth;

  const minY = rotatedHalfHeight;
  const maxY = shopD - rotatedHalfHeight;

  // --- Clamp center ---
  const clampedX = Math.min(Math.max(x, minX), maxX);
  const clampedY = Math.min(Math.max(y, minY), maxY);

  return { x: clampedX, y: clampedY };
}




/**
 * Convenience helper: snap to the grid and then clamp to the shop.
 */
export function normalizePosition(x, y, shop, gridSizeFt, eq) {
  const snapped = snapToGrid(x, y, gridSizeFt);
  return clampToShopBounds(snapped.x, snapped.y, shop, eq);
}