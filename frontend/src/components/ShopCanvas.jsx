// frontend/src/components/ShopCanvas.jsx

import { useEffect, useRef } from "react";
import "../styles/Canvas.css";

export default function ShopCanvas({
  shop,
  zoom,
  selectedId,
  renderTick,
  onSelectEquipment,
  onDropEquipment,
}) {
  const canvasRef = useRef(null);

  // --- Drawing logic ---
  useEffect(() => {
    if (!shop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseWidth = shop.toPixels(shop.widthFt);
    const baseHeight = shop.toPixels(shop.depthFt);

    // Canvas size scales with zoom
    canvas.width = baseWidth * zoom;
    canvas.height = baseHeight * zoom;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom via drawing scale
    ctx.scale(zoom, zoom);

    // --- Grid ---
    const gridSpacing = shop.toPixels(1);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1 / zoom; // keep grid line visually thin even when zoomed

    for (let x = 0; x <= baseWidth; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, baseHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= baseHeight; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(baseWidth, y);
      ctx.stroke();
    }

    // --- Equipment ---
    for (const eq of shop.equipment_list) {
      const w = shop.toPixels(eq.widthFt);
      const h = shop.toPixels(eq.depthFt);
      const x = eq.x;
      const y = eq.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(((eq.rotationDeg || 0) * Math.PI) / 180);

      // Fill
      ctx.fillStyle = eq.color || "#aaa";
      ctx.fillRect(-w / 2, -h / 2, w, h);

      // Border (highlight if selected)
      const isSelected = eq.id === selectedId;
      ctx.strokeStyle = isSelected ? "#ff0000" : "#333";
      ctx.lineWidth = isSelected ? 3 / zoom : 1 / zoom;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Label
      ctx.fillStyle = "#000";
      ctx.font = `${12 / zoom}px sans-serif`;
      ctx.fillText(eq.name, -w / 2 + 4, -h / 2 + 14 / zoom);

      ctx.restore();
    }

    ctx.restore();
  }, [shop, zoom, selectedId, renderTick]);

  // --- Hit testing (ignore rotation for now) ---
  function findEquipmentAtPosition(px, py) {
    if (!shop) return null;

    // Check topmost first
    const reversed = [...shop.equipment_list].reverse();

    for (const eq of reversed) {
      const w = shop.toPixels(eq.widthFt);
      const h = shop.toPixels(eq.depthFt);
      const left = eq.x - w / 2;
      const top = eq.y - h / 2;
      const right = left + w;
      const bottom = top + h;

      if (px >= left && px <= right && py >= top && py <= bottom) {
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
    const rect = canvasRef.current.getBoundingClientRect();

    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    onDropEquipment?.(eqConfig, x, y);
  }

  function handleClick(e) {
    if (!shop) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const eq = findEquipmentAtPosition(x, y);
    onSelectEquipment?.(eq ? eq.id : null);
  }

  return (
    <canvas
      ref={canvasRef}
      className="shop-canvas"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    />
  );
}
