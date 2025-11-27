// frontend/src/components/ShopPage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Shop } from "../lib/models/Shop";
import { equipmentCatalog } from "../lib/data/equipmentCatalog";
import ShopCanvas from "./ShopCanvas";
import ShopSidebar from "./ShopSidebar";
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

  // Toggle editing mode for shop-related controls (form later)
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
      <ShopSidebar
        shop={shop}
        shopId={shopId}
        equipmentCatalog={equipmentCatalog}
        onDragStart={handleDragStart}
        zoom={zoom}
        setZoom={setZoom}
        selectedEq={selectedEq}
        rotateSelected={rotateSelected}
        isEditing={isEditing}
        toggleEditing={toggleEditing}
      />

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
