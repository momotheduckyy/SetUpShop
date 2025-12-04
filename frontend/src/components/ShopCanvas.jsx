// frontend/src/components/ShopCanvas.jsx

import { useEffect, useRef, useState } from "react";
import EquipmentCrown from "./EquipmentCrown";
import { drawEquipmentPictogram, drawEquipmentUseArea } from "../utils/equipmentPictograms";
import { canPlaceEquipment } from "../utils/collisionUtils";

import "../styles/Canvas.css";

export default function ShopCanvas({
  shop,
  selectedId,
  renderTick,
  onSelectEquipment,
  onDropEquipment,
  onMoveEquipment,
  onRemoveEquipment, // used for delete
  rotateSelected,    // passed from parent
  showUseAreas,      
}) {
  const canvasRef = useRef(null);

  // View transform: how we map feet -> pixels
  const viewRef = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Drag state (in shop/feet coordinates)
  const dragRef = useRef({
    isDragging: false,
    equipmentId: null,
    offsetX: 0, // mouse offset from equipment center (x)
    offsetY: 0, // mouse offset from equipment center (y)
    startX: 0,  // initial equipment position at drag start
    startY: 0,  // initial equipment position at drag start
  });

  // Crown position in pixel coordinates (relative to canvas)
  const [crownPos, setCrownPos] = useState(null);

  // --- Drawing logic (auto-fit canvas to workspace, draw grid + equipment) ---
  useEffect(() => {
    if (!shop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const { width: parentW, height: parentH } = parent.getBoundingClientRect();
    if (parentW === 0 || parentH === 0) return;

    // Make canvas match parent size
    canvas.width = parentW;
    canvas.height = parentH;

    const paddingRatio = 0.9;
    const shopWidth = shop.widthFt;
    const shopDepth = shop.depthFt;

    // Choose scale so the whole shop fits with a bit of margin
    const scaleX = (parentW * paddingRatio) / shopWidth;
    const scaleY = (parentH * paddingRatio) / shopDepth;
    const scale = Math.min(scaleX, scaleY);

    const drawnWidth = shopWidth * scale;
    const drawnHeight = shopDepth * scale;

    const offsetX = (parentW - drawnWidth) / 2;
    const offsetY = (parentH - drawnHeight) / 2;

    viewRef.current = { scale, offsetX, offsetY };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Work in "feet space": 1 unit = 1 foot
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // --- Grid in feet (1 ft spacing; snapping handled elsewhere) ---
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

    // --- Dark border around the grid rectangle ---
    ctx.strokeStyle = "#111";      // dark border color
    ctx.lineWidth = 2 / scale;     // keep ~constant thickness in screen pixels
    ctx.strokeRect(
      0,          // left edge in feet
      0,          // top edge in feet
      shopWidth,  // width in feet
      shopDepth   // height in feet
    );

    // --- Equipment (positions & sizes in feet) ---
    for (const eq of shop.equipment_list) {
      const w = eq.widthFt;
      const h = eq.depthFt;
      const x = eq.x;
      const y = eq.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((eq.rotationDeg || 0) * Math.PI) / 180);

      // 🔹 Use area (dashed outline, same color @ 75% opacity) if toggled
      if (showUseAreas) {
        drawEquipmentUseArea(ctx, eq, w, h);
      }  
      
      // Body
      ctx.fillStyle = eq.color || "#aaa";
      ctx.fillRect(-w / 2, -h / 2, w, h);

      // Outline (thicker for selected)
      const isSelected = eq.id === selectedId;
      ctx.strokeStyle = isSelected ? "#ff0000" : "#333";
      ctx.lineWidth = isSelected ? 3 / scale : 1 / scale;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

        // 🔹 pictogram:
      drawEquipmentPictogram(ctx, eq, w, h);
      


      ctx.restore();
    }

    ctx.restore();

    // --- Rulers/Measurement Lines (outside the transformed space) ---
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

    // Tick marks for bottom ruler - every 5 feet
    for (let i = 0; i <= shopWidth; i += 5) {
      const x = offsetX + i * scale;
      ctx.beginPath();
      ctx.moveTo(x, rulerBottomY - 5);
      ctx.lineTo(x, rulerBottomY + 5);
      ctx.stroke();

      // Labels
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${i}ft`, x, rulerBottomY + 8);
    }

    // Right ruler (depth/length)
    const rulerRightX = offsetX + drawnWidth + 20;
    ctx.beginPath();
    ctx.moveTo(rulerRightX, offsetY);
    ctx.lineTo(rulerRightX, offsetY + drawnHeight);
    ctx.stroke();

    // Tick marks for right ruler - every 5 feet
    for (let i = 0; i <= shopDepth; i += 5) {
      const y = offsetY + i * scale;
      ctx.beginPath();
      ctx.moveTo(rulerRightX - 5, y);
      ctx.lineTo(rulerRightX + 5, y);
      ctx.stroke();

      // Labels (rotated)
      ctx.save();
      ctx.translate(rulerRightX + 8, y);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(`${i}ft`, 0, 0);
      ctx.restore();
    }

    ctx.restore();

    // --- Compute crown position for selected equipment (in pixels) ---
    if (selectedId != null && typeof shop.getEquipmentById === "function") {
      const eq = shop.getEquipmentById(selectedId);
      if (eq) {
        const { scale: s, offsetX: ox, offsetY: oy } = viewRef.current;

        const cx = ox + eq.x * s;
        const cy = oy + eq.y * s;
        const hPx = eq.depthFt * s;

        // Crown center above the tool
        const crownX = cx;
        const crownY = cy - hPx / 2 - 24; // 24px above top edge-ish

        setCrownPos({ x: crownX, y: crownY });
      } else {
        setCrownPos(null);
      }
    } else {
      setCrownPos(null);
    }
  }, [shop, selectedId, renderTick, showUseAreas]);

  // --- Helpers: coords & hit-testing ---

  function getShopCoordsFromEvent(e) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = viewRef.current;

    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const x = (px - offsetX) / scale;
    const y = (py - offsetY) / scale;
    return { x, y };
  }

  function findEquipmentAtPosition(x, y) {
    if (!shop) return null;

    // Check from topmost to bottommost
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

  // --- Events ---

  function handleDragOver(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!shop) return;

    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const eqConfig = JSON.parse(data);
    const coords = getShopCoordsFromEvent(e);
    if (!coords) return;

    onDropEquipment?.(eqConfig, coords.x, coords.y);
  }

function handleMouseDown(e) {
  if (!shop) return;
  e.preventDefault();

  const coords = getShopCoordsFromEvent(e);
  if (!coords) return;

  const eq = findEquipmentAtPosition(coords.x, coords.y);

  if (eq) {
    onSelectEquipment?.(eq.id);

    dragRef.current = {
      isDragging: true,
      equipmentId: eq.id,
      offsetX: coords.x - eq.x,
      offsetY: coords.y - eq.y,
      startX: eq.x,          // 👈 remember where we started
      startY: eq.y,
    };
  } else {
    onSelectEquipment?.(null);
    dragRef.current = {
      isDragging: false,
      equipmentId: null,
      offsetX: 0,
      offsetY: 0,
      startX: null,
      startY: null,
    };
  }
}


  function handleMouseMove(e) {
    const dragState = dragRef.current;
    if (!dragState.isDragging || !shop) return;

    const coords = getShopCoordsFromEvent(e);
    if (!coords) return;

    const newX = coords.x - dragState.offsetX;
    const newY = coords.y - dragState.offsetY;

    onMoveEquipment?.(dragState.equipmentId, newX, newY);
  }

function handleMouseUp() {
  const dragState = dragRef.current;
  if (!shop || !dragState.equipmentId) {
    dragRef.current.isDragging = false;
    dragRef.current.equipmentId = null;
    return;
  }

  const id = dragState.equipmentId;

  // Get the final equipment state
  const eq = shop.getEquipmentById
    ? shop.getEquipmentById(id)
    : shop.equipment_list.find((e) => e.id === id);

  if (eq) {
    const finalX = eq.x;
    const finalY = eq.y;

    // If this final position overlaps others → revert
    if (!canPlaceEquipment(shop, eq, finalX, finalY, id)) {
      const { startX, startY } = dragState;
      if (startX != null && startY != null) {
        onMoveEquipment?.(id, startX, startY);
      }
    }
  }

  // Clear drag state
  dragRef.current = {
    isDragging: false,
    equipmentId: null,
    offsetX: 0,
    offsetY: 0,
    startX: null,
    startY: null,
  };
}


  // Optional: wrapper to call delete with actual eq object
  function handleDeleteSelected() {
    if (!shop || selectedId == null || !onRemoveEquipment) return;
    const eq = shop.getEquipmentById
      ? shop.getEquipmentById(selectedId)
      : null;
    if (eq) {
      onRemoveEquipment(eq);
    }
  }

  return (
    <div className="shop-canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="shop-canvas"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      {selectedId != null && crownPos && (
        <EquipmentCrown
          key={`${selectedId}-${Date.now()}`} // 👑 force remount
          x={crownPos.x}
          y={crownPos.y}
          onRotateLeft={() => rotateSelected && rotateSelected(-15)}
          onRotateRight={() => rotateSelected && rotateSelected(15)}
          onDelete={handleDeleteSelected}
        />
      )}
    </div>
  );
}
