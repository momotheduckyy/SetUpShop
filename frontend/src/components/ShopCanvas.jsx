// frontend/src/components/ShopCanvas.jsx

import { useEffect, useRef } from "react";
import "../styles/Canvas.css";

export default function ShopCanvas({
  shop,
  selectedId,
  renderTick,
  onSelectEquipment,
  onDropEquipment,
  onMoveEquipment,
  onRemoveEquipment, // not used yet, but kept for later
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
  });

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

    canvas.width = parentW;
    canvas.height = parentH;

    const paddingRatio = 0.9;
    const shopWidth = shop.widthFt;
    const shopDepth = shop.depthFt;

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

    // 1 ft in shop space = 1 unit in our drawing space
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // --- Grid in feet ---
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

    // --- Equipment (positions & sizes in feet) ---
    for (const eq of shop.equipment_list) {
      const w = eq.widthFt;
      const h = eq.depthFt;
      const x = eq.x;
      const y = eq.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((eq.rotationDeg || 0) * Math.PI) / 180);

      ctx.fillStyle = eq.color || "#aaa";
      ctx.fillRect(-w / 2, -h / 2, w, h);

      const isSelected = eq.id === selectedId;
      ctx.strokeStyle = isSelected ? "#ff0000" : "#333";
      ctx.lineWidth = isSelected ? 3 / scale : 1 / scale;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Calculate appropriate font size based on equipment dimensions
      let fontSize = Math.min(w / 6, h / 3, 2); // Dynamic font size in feet
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      // Measure and fit text to box width
      const maxWidth = w * 0.9; // Use 90% of equipment width
      let displayText = eq.name;
      let textWidth = ctx.measureText(displayText).width;

      // If text is too wide, reduce font size first, then truncate if needed
      while (textWidth > maxWidth && fontSize > 0.5) {
        fontSize *= 0.9;
        ctx.font = `bold ${fontSize}px sans-serif`;
        textWidth = ctx.measureText(displayText).width;
      }

      // If still too wide after font reduction, truncate with ellipsis
      if (textWidth > maxWidth) {
        while (textWidth > maxWidth && displayText.length > 3) {
          displayText = displayText.slice(0, -1);
          textWidth = ctx.measureText(displayText + '...').width;
        }
        displayText += '...';
      }

      // Draw text in dark color
      ctx.fillStyle = "#1d1d1f";
      ctx.fillText(displayText, 0, 0);

      ctx.restore();
    }

    ctx.restore();

    // --- Rulers/Measurement Lines ---
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
      const x = offsetX + (i * scale);
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
      const y = offsetY + (i * scale);
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
  }, [shop, selectedId, renderTick]);

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

    // coords.x, coords.y are in feet
    onDropEquipment?.(eqConfig, coords.x, coords.y);
  }

  function handleMouseDown(e) {
    if (!shop) return;
    e.preventDefault();

    const coords = getShopCoordsFromEvent(e);
    if (!coords) return;

    const eq = findEquipmentAtPosition(coords.x, coords.y);

    if (eq) {
      // Select this equipment
      onSelectEquipment?.(eq.id);

      // Start dragging
      dragRef.current = {
        isDragging: true,
        equipmentId: eq.id,
        offsetX: coords.x - eq.x,
        offsetY: coords.y - eq.y,
      };
    } else {
      // Clicked empty space: clear selection
      onSelectEquipment?.(null);
      dragRef.current = {
        isDragging: false,
        equipmentId: null,
        offsetX: 0,
        offsetY: 0,
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

    // Tell parent to move the equipment (this mutates Shop + re-renders)
    onMoveEquipment?.(dragState.equipmentId, newX, newY);
  }

  function handleMouseUp() {
    dragRef.current.isDragging = false;
    dragRef.current.equipmentId = null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="shop-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
}
