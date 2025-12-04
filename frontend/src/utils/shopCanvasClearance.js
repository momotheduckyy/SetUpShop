// frontend/src/utils/shopCanvasClearance.js

import { getEquipmentUseAreaRect } from "./equipmentPictograms";
import { boxesOverlap, getEquipmentBoundingBox } from "./collisionUtils";

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

// Axis-aligned bounding box for the *clearance zone* of a piece of equipment
export function getClearanceBoundingBox(eq) {
  if (!eq) return null;

  const w = eq.widthFt;
  const h = eq.depthFt;

  const rect = getEquipmentUseAreaRect(eq, w, h);
  if (!rect) return null; // no clearance zone for this tool

  const { areaX, areaY, areaW, areaH } = rect;
  const theta = degToRad(eq.rotationDeg || 0);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  // Center of the clearance rect in *local* (tool) coordinates
  const cxLocal = areaX + areaW / 2;
  const cyLocal = areaY + areaH / 2;

  // Rotate + translate into shop coords (feet)
  const cxWorld = eq.x + (cxLocal * cosT - cyLocal * sinT);
  const cyWorld = eq.y + (cxLocal * sinT + cyLocal * cosT);

  // Rotated extents projected to axes
  const hw = areaW / 2;
  const hh = areaH / 2;

  const ex = Math.abs(cosT) * hw + Math.abs(sinT) * hh;
  const ey = Math.abs(sinT) * hw + Math.abs(cosT) * hh;

  return {
    left: cxWorld - ex,
    right: cxWorld + ex,
    top: cyWorld - ey,
    bottom: cyWorld + ey,
  };
}

// Pure function: which tools have clearance issues?
// Criteria:
//  1) Clearance box goes outside shop (0..widthFt, 0..depthFt)
//  2) Clearance box overlaps the *body* (footprint) of another tool
export function computeClearanceIssueIds(shop, showUseAreas) {
  if (!shop || !showUseAreas) return [];

  const eqs = shop.equipment_list || [];
  if (!eqs.length) return [];

  const shopWidth = shop.widthFt;
  const shopDepth = shop.depthFt;

  const issueIds = new Set();

  for (const eq of eqs) {
    const clearanceBox = getClearanceBoundingBox(eq);
    if (!clearanceBox) continue;

    // 1) Clearance vs walls
    if (
      clearanceBox.left < 0 ||
      clearanceBox.right > shopWidth ||
      clearanceBox.top < 0 ||
      clearanceBox.bottom > shopDepth
    ) {
      issueIds.add(eq.id);
    }

    // 2) Clearance vs *other equipment bodies*
    for (const other of eqs) {
      if (!other) continue;
      if (other.id === eq.id) continue; // skip self

      const bodyBox = getEquipmentBoundingBox(other, other.x, other.y);

      if (boxesOverlap(clearanceBox, bodyBox)) {
        // Mark both tools as "offending"
        issueIds.add(eq.id);
        issueIds.add(other.id);
      }
    }
  }

  return Array.from(issueIds);
}
