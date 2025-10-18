"use client";
import { useEffect, useState, useRef } from "react";
import { Shop } from "@/lib/models/Shop";
import { Equipment } from "@/lib/models/Equipment";
import { EquipmentFactory } from "@/lib/models/EquipmentFactory";

// Temporary catalog until backend connects
import { equipmentCatalog } from "@/lib/data/equipmentCatalog";

export default function NewShopPage() {
  // --- 1. Base shop setup ---
  const [shop] = useState(() => new Shop("Prototype Shop", 50, 40, 10)); // 50x40ft, 1ft=10px
  const [zoom, setZoom] = useState(1);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- 2. Draw helper (canvas rendering) ---
  function drawShop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    


    // Draw light gray grid every 1ft
    const gridSpacing = shop.toPixels(1);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw equipment
    for (const eq of shop.equipment_list) {
      const x = eq.x - (shop.toPixels(eq.widthFt) / 2);
      const y = eq.y - (shop.toPixels(eq.depthFt) / 2);
      const w = shop.toPixels(eq.widthFt);
      const h = shop.toPixels(eq.depthFt);

      ctx.fillStyle = eq.color || "#aaa";
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.fillText(eq.name, x + 4, y + 14);
      console.log("Drawing equipment:", eq);
    }
  }

  // --- 3. React lifecycle ---
  useEffect(() => {
    drawShop(); // draw initially and when zoom changes
  }, [zoom]);

  // --- 4. Handlers ---
  function handleDragStart(e: React.DragEvent<HTMLDivElement>, eq: any) {
    e.dataTransfer.setData("application/json", JSON.stringify(eq));
  }

  function handleDrop(e: React.DragEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const eqConfig = JSON.parse(data);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    shop.addEquipment(eqConfig, x, y); // Factory handles creation
    console.log("Dropped equipment:", eqConfig);
    console.log("Equipment list:", shop.equipment_list);
    drawShop(); // redraw immediately
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (draggingId !== null) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      shop.moveEquipment(draggingId, x, y);
      drawShop(); // redraw immediately while moving
    }
  }

  function handleMouseUp() {
    setDraggingId(null);
  }

  // --- 5. Render ---
  return (
    <main style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          background: "#f5f5f5",
          padding: "1rem",
          borderRight: "2px solid #ddd",
        }}
      >
        <h3>Equipment</h3>
        {equipmentCatalog.map((eq) => (
          <div
            key={eq.name}
            className="tile"
            draggable
            onDragStart={(e) => handleDragStart(e, eq)}
          >
            {eq.name}
          </div>
        ))}

        {/* Zoom controls */}
        <div style={{ marginTop: "2rem" }}>
          <h4>Zoom</h4>
          <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}>+</button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>−</button>
          <button onClick={() => setZoom(1)}>Reset</button>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {Math.round(zoom * 100)}%
          </p>
        </div>
      </aside>

      {/* Workspace */}
      <section
        style={{
          flexGrow: 1,
          position: "relative",
          background: "#e5e5e5",
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease",
            position: "relative",
          }}
        >
            <canvas
            ref={canvasRef}
            width={shop.toPixels(shop.widthFt)}
            height={shop.toPixels(shop.depthFt)}
            style={{
                background: "#fafafa",
                border: "4px solid red",   // 🔥 visually confirm bounds
                zIndex: 5,                 // ensure it’s above other elements
                position: "relative",
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            />

          {/* Label overlay */}
          <p
            style={{
              position: "absolute",
              top: 4,
              left: 8,
              fontSize: 14,
              color: "#444",
            }}
          >
            {shop.name} — {shop.widthFt}ft × {shop.depthFt}ft
          </p>
        </div>
      </section>
    </main>
  );
}
