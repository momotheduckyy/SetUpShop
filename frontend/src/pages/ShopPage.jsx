// frontend/src/pages/ShopPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Shop } from "../lib/models/Shop";
import { equipmentCatalog } from "../lib/data/equipmentCatalog";
import ShopCanvas from "../components/ShopCanvas";
import ShopSidebar from "../components/ShopSidebar";
import { addEquipmentToShop } from "../services/api";
import "../styles/ShopPage.css";

const API_BASE = "http://localhost:5001/api";

export default function ShopPage() {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [renderTick, setRenderTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(true);

  // Form state for shop meta (name + dimensions)
  const [shopForm, setShopForm] = useState({
    name: "",
    length: 40,
    width: 30,
    height: 10,
  });

  // Save state (for the Save button)
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

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

        const name = data.shop_name || data.name || `Shop ${shopId}`;

        // Support both flat dimensions and future nested shop_size
        let length, width, height;

        if (data.shop_size) {
          const sz = data.shop_size;
          length = sz.length ?? sz.lengthFt ?? 40;
          width = sz.width ?? sz.widthFt ?? 30;
          height = sz.height ?? sz.heightFt ?? 10;
        } else {
          length = data.length ?? 40;
          width = data.width ?? 30;
          height = data.height ?? 10;
        }

        const shopInstance = new Shop(name, length, width, 10);

if (Array.isArray(data.equipment)) {
  for (const placement of data.equipment) {
    // placement is something like:
    // { equipment_id, x_coordinate, y_coordinate, z_coordinate, date_added }

    const catalogItem = equipmentCatalog.find(
      (item) => item.id === placement.equipment_id
    );

    if (!catalogItem) {
      console.warn("No catalog item for equipment_id", placement.equipment_id);
      continue;
    }

    // Build the same shape you use in drag-drop
    const eqConfig = {
      name: catalogItem.name,
      widthFt: catalogItem.widthFt,
      depthFt: catalogItem.depthFt,
      color: catalogItem.color,
      manufacturer: catalogItem.manufacturer,
      model: catalogItem.model,
      make: catalogItem.make,
      maintenanceIntervalDays: catalogItem.maintenanceIntervalDays,
      maintenanceNotes: catalogItem.maintenanceNotes,
      // you *can* stash backend ID if you want later:
      backendEquipmentId: placement.equipment_id,
    };

    // Use the same helper as when you drag from the sidebar
    shopInstance.addEquipment(
      eqConfig,
      placement.x_coordinate,
      placement.y_coordinate
    );
  }
}


        setShop(shopInstance);

        // Initialize form from loaded values
        setShopForm({
          name,
          length,
          width,
          height,
        });

        setSelectedId(null);
        setRenderTick((t) => t + 1);
        setLoading(false);
      } catch (err) {
        console.error(
          "Failed to load shop:",
          err.response?.status,
          err.response?.data || err.message
        );
        setErrorMsg("Failed to load shop from server.");
        setLoading(false);
      }
    }

    fetchShop();
  }, [shopId]);

  // 🔄 Whenever form dimensions change, update the Shop instance + re-render canvas
  useEffect(() => {
    if (!shop) return;

    // Decide which is length vs width. To stay consistent with how you
    // constructed Shop(name, length, width, 10), we map:
    //  - shop.depthFt = length
    //  - shop.widthFt = width
    shop.depthFt = shopForm.length;
    shop.widthFt = shopForm.width;
    // height not used in 2D canvas yet, but we keep it in form for future.

    setRenderTick((t) => t + 1);
  }, [shop, shopForm.length, shopForm.width]);

  // Toggle editing mode for the form
  function toggleEditing() {
    setIsEditing((prev) => !prev);
  }

  // Keep form in sync as user types
  function handleShopFormChange(e) {
    const { name, value } = e.target;
    setShopForm((prev) => ({
      ...prev,
      [name]:
        name === "length" || name === "width" || name === "height"
          ? Number(value)
          : value,
    }));
  }

  function handleDragStart(e, eq) {
    e.dataTransfer.setData("application/json", JSON.stringify(eq));
  }

async function handleDropEquipment(eqConfig, x, y) {
  if (!shop) return;

  // optimistic update for canvas
  shop.addEquipment(eqConfig, x, y);
  setRenderTick((t) => t + 1);

  try {
    await addEquipmentToShop(shopId, {
      equipmentId: eqConfig.id, // make sure eqConfig.id exists
      x,
      y,
      z: 0,
    });
  } catch (err) {
    console.error("Failed to save placement:", err);
    // optional: rollback or show a toast
  }
}



  function rotateSelected(delta) {
    if (selectedId == null || !shop) return;
    shop.rotateEquipment(selectedId, delta);
    setRenderTick((t) => t + 1);
  }

  const selectedEq =
    selectedId != null && shop ? shop.getEquipmentById(selectedId) : null;

  // 💾 Save and return to shop list
async function handleSaveAndReturn() {
  if (!shop) return;

  setIsSaving(true);
  setSaveError("");
  setSaveSuccess(false);

  try {
    const payload = {
      length: shopForm.length,
      width: shopForm.width,
      height: shopForm.height,
    };

    const res = await axios.put(`${API_BASE}/shops/${shopId}`, payload);
    const updated = res.data.shop;

    // Sync with returned values (optional safety)
    if (updated) {
      const length = updated.length ?? shopForm.length;
      const width = updated.width ?? shopForm.width;
      const height = updated.height ?? shopForm.height;

      shop.depthFt = length;
      shop.widthFt = width;

      setShopForm({ name: shopForm.name, length, width, height });
      setRenderTick((t) => t + 1);
    }

    // 🚀 Navigate back to list
    navigate("/shop-spaces");

  } catch (err) {
    console.error("Failed to save shop:", err);
    setSaveError("Failed to save shop.");
  } finally {
    setIsSaving(false);
  }
}


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
        // form + handlers
        shopForm={shopForm}
        onShopFormChange={handleShopFormChange}
        // save wiring
        onSaveAndReturn={handleSaveAndReturn}
        isSaving={isSaving}
        saveError={saveError}
        saveSuccess={saveSuccess}
      />

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
