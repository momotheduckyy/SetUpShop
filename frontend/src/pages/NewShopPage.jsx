import { useEffect, useState, useRef } from "react";
import { Shop } from "@/lib/models/Shop";
import { equipmentCatalog } from "@/lib/data/equipmentCatalog";

export default function NewShopPage() {
  const [shop] = useState(() => new Shop("Prototype Shop", 50, 40, 10));
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const canvasRef = useRef(null);

  // --- draw helper ---
  function drawShop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // grid
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

    // equipment
    for (const eq of shop.equipment_list) {
      const w = shop.toPixels(eq.widthFt);
      const h = shop.toPixels(eq.depthFt);
      const x = eq.x;
      const y = eq.y;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((eq.rotationDeg * Math.PI) / 180);

      // fill
      ctx.fillStyle = eq.color || "#aaa";
      ctx.fillRect(-w / 2, -h / 2, w, h);

      // border (highlight if selected)
      ctx.strokeStyle = eq.id === selectedId ? "#ff0000" : "#333";
      ctx.lineWidth = eq.id === selectedId ? 3 : 1;
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // label
      ctx.fillStyle = "#000";
      ctx.font = "12px sans-serif";
      ctx.fillText(eq.name, -w / 2 + 4, -h / 2 + 14);

      ctx.restore();
    }

    ctx.restore();
  }

  useEffect(() => {
    drawShop();
  }, [zoom, selectedId]);

  // --- drag/drop from sidebar ---
  function handleDragStart(e, eq) {
    e.dataTransfer.setData("application/json", JSON.stringify(eq));
  }

  function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const eqConfig = JSON.parse(data);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    shop.addEquipment(eqConfig, x, y);
    drawShop();
  }

  // --- hit testing & selection ---
  function findEquipmentAtPosition(px, py) {
    // naive: ignore rotation for now for click picking
    for (const eq of [...shop.equipment_list].reverse()) {
      const w = shop.toPixels(eq.widthFt);
      const h = shop.toPixels(eq.depthFt);
      const left = eq.x - w / 2;
      const top = eq.y - h / 2;
      if (px >= left && px <= left + w && py >= top && py <= top + h) {
        return eq;
      }
    }
    return null;
  }

  function handleCanvasClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    const eq = findEquipmentAtPosition(x, y);
    setSelectedId(eq ? eq.id : null);
  }

  function rotateSelected(delta) {
    if (selectedId == null) return;
    shop.rotateEquipment(selectedId, delta);
    drawShop();
  }

  const selectedEq = selectedId != null ? shop.getEquipmentById(selectedId) : null;

  // --- render ---
  return (
    <main style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "#f5f5f5",
          padding: "1rem",
          borderRight: "2px solid #ddd",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <h3>Equipment</h3>
          {equipmentCatalog.map((eq) => (
            <div
              key={eq.name}
              className="tile"
              draggable
              onDragStart={(e) => handleDragStart(e, eq)}
              style={{
                padding: "0.5rem",
                marginBottom: "0.25rem",
                background: "#fff",
                border: "1px solid #ccc",
                cursor: "grab",
              }}
            >
              {eq.name}
            </div>
          ))}
        </div>

        <div>
          <h4>Zoom</h4>
          <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}>+</button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>−</button>
          <button onClick={() => setZoom(1)}>Reset</button>
          <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
            {Math.round(zoom * 100)}%
          </p>
        </div>

        <div>
          <h4>Selected Equipment</h4>
          {selectedEq ? (
            <div style={{ fontSize: "0.9rem" }}>
              <p><strong>{selectedEq.name}</strong></p>
              {selectedEq.manufacturer && (
                <p>Manufacturer: {selectedEq.manufacturer}</p>
              )}
              {selectedEq.model && <p>Model: {selectedEq.model}</p>}
              {selectedEq.maintenanceIntervalDays && (
                <p>
                  Maintenance: every {selectedEq.maintenanceIntervalDays} days
                </p>
              )}
              {selectedEq.maintenanceNotes && (
                <p style={{ marginTop: "0.5rem" }}>
                  Notes: {selectedEq.maintenanceNotes}
                </p>
              )}

              <div style={{ marginTop: "0.5rem" }}>
                <button onClick={() => rotateSelected(-15)}>Rotate -15°</button>
                <button onClick={() => rotateSelected(15)}>Rotate +15°</button>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "0.9rem" }}>Click a machine in the layout.</p>
          )}
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
              border: "4px solid red",
              zIndex: 5,
              position: "relative",
            }}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleCanvasClick}
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
