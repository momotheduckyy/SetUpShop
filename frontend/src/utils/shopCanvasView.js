// frontend/src/utils/shopCanvasView.js

import {
  drawEquipmentPictogram,
  drawEquipmentUseArea,
} from "./equipmentPictograms";

// Compute how the shop fits into the canvas and returns view parameters
export function computeViewForShop(canvas, parent, shop, paddingRatio = 0.9) {
  if (!canvas || !parent || !shop) return null;

  const { width: parentW, height: parentH } = parent.getBoundingClientRect();
  if (parentW === 0 || parentH === 0) return null;

  const shopWidth = shop.widthFt;
  const shopDepth = shop.depthFt;

  const scaleX = (parentW * paddingRatio) / shopWidth;
  const scaleY = (parentH * paddingRatio) / shopDepth;
  const scale = Math.min(scaleX, scaleY);

  const drawnWidth = shopWidth * scale;
  const drawnHeight = shopDepth * scale;

  const offsetX = (parentW - drawnWidth) / 2;
  const offsetY = (parentH - drawnHeight) / 2;

  canvas.width = parentW;
  canvas.height = parentH;

  return { scale, offsetX, offsetY, drawnWidth, drawnHeight };
}

export function drawGridAndBorder(ctx, shop, view) {
  const { scale, offsetX, offsetY } = view;
  const shopWidth = shop.widthFt;
  const shopDepth = shop.depthFt;

  ctx.save();

  // Work in "feet space": 1 unit = 1 foot
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Grid
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1 / scale;

  for (let x = 0; x <= shopWidth; x += 1) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, shopDepth);
    ctx.stroke();
  }

  for (let y = 0; y <= shopDepth; y += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(shopWidth, y);
    ctx.stroke();
  }

  // Dark border around the grid rectangle
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2 / scale;
  ctx.strokeRect(0, 0, shopWidth, shopDepth);

  ctx.restore();
}

export function drawEquipmentAndGhost(ctx, shop, view, options) {
  const {
    selectedId,
    showUseAreas,
    clearanceIssueIds,
    draggingEq,
    dragPreviewPos,
  } = options;

  const { scale, offsetX, offsetY } = view;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Equipment
  for (const eq of shop.equipment_list) {
    const w = eq.widthFt;
    const h = eq.depthFt;
    const x = eq.x;
    const y = eq.y;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((eq.rotationDeg || 0) * Math.PI) / 180);

    if (showUseAreas) {
      drawEquipmentUseArea(ctx, eq, w, h);
    }

    // Body
    ctx.fillStyle = eq.color || "#aaa";
    ctx.fillRect(-w / 2, -h / 2, w, h);

    // Outline
    const isSelected = eq.id === selectedId;
    const hasClearanceIssue = clearanceIssueIds.includes(eq.id);

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1 / scale;

    if (hasClearanceIssue) {
      ctx.strokeStyle = "#f97316"; // orange
      ctx.lineWidth = 2 / scale;
    }

    if (isSelected) {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 3 / scale;
    }

    ctx.strokeRect(-w / 2, -h / 2, w, h);

    // Pictogram
    drawEquipmentPictogram(ctx, eq, w, h);

    ctx.restore();
  }

  // Ghost preview for equipment being dragged from sidebar
  if (draggingEq && dragPreviewPos) {
    const w = draggingEq.widthFt;
    const h = draggingEq.depthFt;
    const { x, y } = dragPreviewPos;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(((draggingEq.rotationDeg || 0) * Math.PI) / 180);

    if (showUseAreas) {
      drawEquipmentUseArea(ctx, draggingEq, w, h);
    }

    ctx.globalAlpha = 0.5;
    ctx.fillStyle = draggingEq.color || "#888";
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1 / scale;
    ctx.strokeRect(-w / 2, -h / 2, w, h);

    ctx.restore();
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
}

export function drawRulers(ctx, shop, view) {
  const { scale, offsetX, offsetY, drawnWidth, drawnHeight } = view;
  const shopWidth = shop.widthFt;
  const shopDepth = shop.depthFt;

  ctx.save();
  ctx.fillStyle = "#1d1d1f";
  ctx.strokeStyle = "#1d1d1f";
  ctx.font = "12px sans-serif";
  ctx.lineWidth = 1;

  // Bottom ruler (width)
  const rulerBottomY = offsetY + drawnHeight + 20;
  ctx.beginPath();
  ctx.moveTo(offsetX, rulerBottomY);
  ctx.lineTo(offsetX + drawnWidth, rulerBottomY);
  ctx.stroke();

  for (let i = 0; i <= shopWidth; i += 5) {
    const x = offsetX + i * scale;
    ctx.beginPath();
    ctx.moveTo(x, rulerBottomY - 5);
    ctx.lineTo(x, rulerBottomY + 5);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${i}ft`, x, rulerBottomY + 8);
  }

  // Right ruler (depth)
  const rulerRightX = offsetX + drawnWidth + 20;
  ctx.beginPath();
  ctx.moveTo(rulerRightX, offsetY);
  ctx.lineTo(rulerRightX, offsetY + drawnHeight);
  ctx.stroke();

  for (let i = 0; i <= shopDepth; i += 5) {
    const y = offsetY + i * scale;
    ctx.beginPath();
    ctx.moveTo(rulerRightX - 5, y);
    ctx.lineTo(rulerRightX + 5, y);
    ctx.stroke();

    ctx.save();
    ctx.translate(rulerRightX + 8, y);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${i}ft`, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

export function computeCrownPosition(shop, selectedId, view) {
  if (selectedId == null || typeof shop.getEquipmentById !== "function") {
    return null;
  }

  const eq = shop.getEquipmentById(selectedId);
  if (!eq) return null;

  const { scale, offsetX, offsetY } = view;

  const cx = offsetX + eq.x * scale;
  const cy = offsetY + eq.y * scale;
  const hPx = eq.depthFt * scale;

  return {
    x: cx,
    y: cy - hPx / 2 - 24, // 24px above tool
  };
}

// One top-level renderer that orchestrates everything
export function renderShopScene({
  canvas,
  shop,
  selectedId,
  showUseAreas,
  clearanceIssueIds,
  draggingEq,
  dragPreviewPos,
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { view: null, crownPos: null };

  const parent = canvas.parentElement;
  const view = computeViewForShop(canvas, parent, shop);
  if (!view) return { view: null, crownPos: null };

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawGridAndBorder(ctx, shop, view);
  drawEquipmentAndGhost(ctx, shop, view, {
    selectedId,
    showUseAreas,
    clearanceIssueIds,
    draggingEq,
    dragPreviewPos,
  });
  drawRulers(ctx, shop, view);

  const crownPos = computeCrownPosition(shop, selectedId, view);
  return { view, crownPos };
}
