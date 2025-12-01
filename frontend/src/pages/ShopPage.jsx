// frontend/src/pages/ShopPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Shop } from "../lib/models/Shop";
import ShopCanvas from "../components/ShopCanvas";
import ShopSidebar from "../components/ShopSidebar";
import { addEquipmentToShop, getUserEquipment } from "../services/api";
import "../styles/ShopPage.css";

const API_BASE = "http://localhost:5001/api";

export default function ShopPage({ user }) {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [userEquipment, setUserEquipment] = useState([]);
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

// Load equipment placements from shop
        // Note: This runs before userEquipment is loaded, so we'll store placements
        // and apply them after equipment loads
        if (Array.isArray(data.equipment)) {
          // Store placements to apply after user equipment loads
          shopInstance._pendingPlacements = data.equipment;
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

  // Fetch user's equipment for the sidebar
  useEffect(() => {
    async function fetchUserEquipment() {
      if (!user || !user.id) return;

      try {
        const response = await getUserEquipment(user.id);
        const equipment = response.equipment || [];

        // Transform equipment to match canvas format
        const transformedEquipment = equipment.map(eq => ({
          id: eq.id,  // user_equipment.id
          name: eq.equipment_name,
          widthFt: eq.width,
          depthFt: eq.depth,
          color: eq.color || '#aaa',
          manufacturer: eq.manufacturer || '',
          model: eq.model || '',
          maintenanceIntervalDays: eq.maintenance_interval_days,
          maintenanceNotes: eq.notes || ''
        }));

        setUserEquipment(transformedEquipment);
      } catch (err) {
        console.error("Failed to load user equipment:", err);
      }
    }

    fetchUserEquipment();
  }, [user]);

  // Apply pending equipment placements once both shop and userEquipment are loaded
  useEffect(() => {
    if (!shop || !shop._pendingPlacements || userEquipment.length === 0) return;

    const placements = shop._pendingPlacements;
    shop._pendingPlacements = null; // Clear to avoid re-applying

    for (const placement of placements) {
      // Find equipment in user's inventory
      const userEq = userEquipment.find(eq => eq.id === placement.equipment_id);

      if (!userEq) {
        console.warn("Equipment not found in user inventory:", placement.equipment_id);
        continue;
      }

      // Add equipment to shop with saved position
      shop.addEquipment(
        userEq,
        placement.x_coordinate,
        placement.y_coordinate
      );
    }

    setRenderTick(t => t + 1);
  }, [shop, userEquipment]);

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
      <button
        className="back-btn-shop"
        onClick={() => navigate('/shop-spaces')}
      >
        ← Back to My Shop Spaces
      </button>
      <ShopSidebar
        shop={shop}
        shopId={shopId}
        equipmentCatalog={userEquipment}
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
