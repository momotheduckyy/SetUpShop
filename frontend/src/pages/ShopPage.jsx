// frontend/src/components/ShopPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Shop } from "../lib/models/Shop";
import { equipmentCatalog } from "../lib/data/equipmentCatalog";
import ShopCanvas from "../components/ShopCanvas";
import "../styles/ShopPage.css";

const API_BASE = "http://localhost:5001/api";

export default function ShopPage() {
  const { shopId } = useParams();

  const [shop, setShop] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [renderTick, setRenderTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(true);




  // Fetch shop details from backend
  useEffect(() => {
    async function fetchShop() {
      try {
        setLoading(true);
        setErrorMsg("");

        const res = await axios.get(`${API_BASE}/shops/${shopId}`);
        const data = res.data.shop;

        if (!data) {
          setErrorMsg("Shop not found.");
          setLoading(false);
          return;
        }

        // Map backend fields to our Shop model
        const name = data.shop_name || data.name || `Shop ${shopId}`;
        const length = data.length ?? 40;
        const width = data.width ?? 30;

        const shopInstance = new Shop(name, length, width, 10);

        // Optional: map equipment placements from backend
        if (Array.isArray(data.equipment)) {
          for (const eq of data.equipment) {
            shopInstance.equipment_list.push({
              id: eq.id,
              name: eq.name,
              widthFt: eq.widthFt,
              depthFt: eq.depthFt,
              x: eq.x,
              y: eq.y,
              rotationDeg: eq.rotationDeg || 0,
              color: eq.color || "#aaa",
              manufacturer: eq.manufacturer,
              model: eq.model,
              maintenanceIntervalDays: eq.maintenanceIntervalDays,
              maintenanceNotes: eq.maintenanceNotes,
            });
          }
        }

        setShop(shopInstance);
        setSelectedId(null);
        setRenderTick((t) => t + 1);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load shop:", err);
        setErrorMsg("Failed to load shop from server.");
        setLoading(false);
      }
    }

    fetchShop();
  }, [shopId]);

// Toggle editing mode for shop details  
function toggleEditing() {
  setIsEditing((prev) => !prev);
}

  function handleDragStart(e, eq) {
    e.dataTransfer.setData("application/json", JSON.stringify(eq));
  }

  function handleDropEquipment(eqConfig, x, y) {
    if (!shop) return;
    shop.addEquipment(eqConfig, x, y);
    setRenderTick((t) => t + 1);
  }

  function rotateSelected(delta) {
    if (selectedId == null || !shop) return;
    shop.rotateEquipment(selectedId, delta);
    setRenderTick((t) => t + 1);
  }

  const selectedEq =
    selectedId != null && shop ? shop.getEquipmentById(selectedId) : null;

  if (loading) {
    return (
      <main className="shop-center-message">
        <p>Loading shop...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="shop-center-message">
        <p>{errorMsg}</p>
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="shop-center-message">
        <p>Shop not available.</p>
      </main>
    );
  }

  // Main layout view
  return (
    <main className="shop-layout-container">
      {/* Sidebar */}
      <aside className="shop-sidebar">
        <div className="shop-header">
          <h3>{shop.name}</h3>
          <p className="shop-dimensions">
            {shop.widthFt} × {shop.depthFt} ft
          </p>
          <p className="shop-id">
            ID: <strong>{shopId}</strong>
          </p>
        </div>

        {/* Equipment list for drag/drop */}
        <div>
          <h4>Equipment</h4>
          {equipmentCatalog.map((eq) => (
            <div
              key={eq.name}
              className="equipment-tile"
              draggable
              onDragStart={(e) => handleDragStart(e, eq)}
            >
              {eq.name}
            </div>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="zoom-controls">
          <h4>Zoom</h4>
          <div className="zoom-buttons">
            <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}>
              +
            </button>
            <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>
              −
            </button>
            <button onClick={() => setZoom(1)}>Reset</button>
          </div>
          <p className="zoom-display">
            {Math.round(zoom * 100)}%
          </p>
        </div>

        {/* Selected equipment details */}
        <div className="selected-panel">
          <h4>Selected Equipment</h4>
          {selectedEq ? (
            <div>
              <p>
                <strong>{selectedEq.name}</strong>
              </p>
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
                <p className="selected-notes">
                  Notes: {selectedEq.maintenanceNotes}
                </p>
              )}

              <div className="rotation-buttons">
                <button onClick={() => rotateSelected(-15)}>
                  Rotate -15°
                </button>
                <button onClick={() => rotateSelected(15)}>
                  Rotate +15°
                </button>
              </div>
            </div>
          ) : (
            <p>Click a machine in the layout.</p>
          )}
        </div>
      </aside>

      {/* Canvas workspace */}
      <section className="shop-workspace">
        <ShopCanvas
          shop={shop}
          zoom={zoom}
          selectedId={selectedId}
          renderTick={renderTick}
          onSelectEquipment={setSelectedId}
          onDropEquipment={handleDropEquipment}
        />
      </section>
    </main>
  );
}
