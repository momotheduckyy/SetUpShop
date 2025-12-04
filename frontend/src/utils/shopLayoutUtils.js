

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
export function clampToShopBounds(x, y, shop) {
  if (!shop) {
    return { x, y };
  }

  const clampedX = Math.min(Math.max(x, 0), shop.widthFt);
  const clampedY = Math.min(Math.max(y, 0), shop.depthFt);

  return { x: clampedX, y: clampedY };
}

/**
 * Convenience helper: snap to the grid and then clamp to the shop.
 */
export function normalizePosition(x, y, shop, gridSizeFt) {
  const snapped = snapToGrid(x, y, gridSizeFt);
  return clampToShopBounds(snapped.x, snapped.y, shop);
}
