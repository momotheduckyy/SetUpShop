// frontend/src/pages/ShopPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Shop } from "../lib/models/Shop";
import ShopCanvas from "../components/ShopCanvas";
import ShopSidebar from "../components/ShopSidebar";
import { addEquipmentToShop, getUserEquipment, getEquipmentCatalog, deleteEquipment } from "../services/api";
import { addEquipmentToUser } from "../services/api";
import "../styles/ShopPage.css";
import EquipmentDetailsPanel from "../components/EquipmentDetailsPanel";
import { removeEquipmentFromShop } from "../services/api";


const API_BASE = "http://localhost:5001/api";

export default function ShopPage({ user }) {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [userEquipment, setUserEquipment] = useState([]);
  const [equipmentCatalog, setEquipmentCatalog] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [renderTick, setRenderTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  

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

        // Shop constructor: (name, widthFt, depthFt, scale)
        const shopInstance = new Shop(name, width, length, 10);

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
  // Fetch equipment catalog for the sidebar
  useEffect(() => {
    async function fetchEquipmentCatalog() {
      try {
        const response = await getEquipmentCatalog();
        const equipment = response.equipment || [];

        // Transform equipment catalog to match canvas format
        const transformedEquipment = equipment.map(eq => ({
          id: eq.id,  // equipment_types.id
          name: eq.equipment_name,
          widthFt: eq.width / 12,  // Convert mm to feet (assuming width is in inches, convert to feet)
          depthFt: eq.depth / 12,
          color: eq.color || '#aaa',
          manufacturer: eq.manufacturer || '',
          model: eq.model || '',
          maintenanceIntervalDays: eq.maintenance_interval_days
        }));

        setEquipmentCatalog(transformedEquipment);
      } catch (err) {
        console.error("Failed to load equipment catalog:", err);
      }
    }

    fetchEquipmentCatalog();
  }, []);

  // Fetch user's equipment for placing on canvas
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
          widthFt: eq.width / 12,  // Convert inches to feet
          depthFt: eq.depth / 12,   // Convert inches to feet
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
    if (!shop || !shop._pendingPlacements) return;
    if (userEquipment.length === 0) return;

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
      // Make sure to pass equipment_id so equipmentDbId gets set correctly
      shop.addEquipment(
        { ...userEq, equipment_id: placement.equipment_id },
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

  // 1) Persist to backend first - add equipment to user inventory
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
      console.error("No user logged in");
      return;
    }

    // First, add equipment to user's inventory
    const userEquipmentResponse = await addEquipmentToUser(user.id, {
      equipment_type_id: eqConfig.id, // equipment_types.id
      notes: "",
      purchase_date: new Date().toISOString().split("T")[0],
    });

    // Get the newly created user_equipment.id
    const userEquipmentId = userEquipmentResponse.equipment?.id;

    if (!userEquipmentId) {
      console.error("Failed to get user equipment ID");
      return;
    }

    // Now add to shop using the user_equipment.id
    await addEquipmentToShop(shopId, {
      equipmentId: userEquipmentId,
      x,
      y,
      z: 0,
    });

    // Update local state with the new user_equipment.id
    // Pass as equipment_id so Shop model stores it in equipmentDbId
    const placedEquipment = { ...eqConfig, equipment_id: userEquipmentId };
    shop.addEquipment(placedEquipment, x, y);
    console.log("Locally placed equipment with DB ID:", userEquipmentId);
    console.log("Equipment count in shop:", shop.equipment_list.length);

    setRenderTick((t) => t + 1);
  } catch (err) {
    console.error("Failed to save placement:", err);
  }
}


function handleMoveEquipment(id, newX, newY) {
  if (!shop) return;
  shop.moveEquipment(id, newX, newY);
  setRenderTick((t) => t + 1);
}

function handleSelectEquipment(id) {
  setSelectedId(id);
  setIsDetailsOpen(id != null); // open modal when something is selected
}

async function handleDeleteEquipment(equipment) {
  if (!shop || !equipment) return;

  // Confirm deletion
  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${equipment.name}? This will remove it from your equipment inventory permanently.`
  );

  if (!confirmDelete) return;

  try {
    // 1. Remove from in-memory model first (optimistic update)
    shop.removeEquipmentById(equipment.id);
    setSelectedId(null);
    setRenderTick((t) => t + 1);
    setIsDetailsOpen(false);

    if (equipment.equipmentDbId) {
      // 2. Remove from shop space equipment column
      await removeEquipmentFromShop(shopId, equipment.equipmentDbId);

      // 3. Delete from user_equipment table
      await deleteEquipment(equipment.equipmentDbId);

      console.log(`Successfully deleted equipment ${equipment.equipmentDbId} from shop and user inventory`);
    }
  } catch (err) {
    console.error("Failed to delete equipment:", err);
    alert("Failed to delete equipment. Please try again.");

    // Refresh the page to restore the correct state
    window.location.reload();
  }
}

  function rotateSelected(delta) {
    if (selectedId == null || !shop) return;
    shop.rotateEquipment(selectedId, delta);
    setRenderTick((t) => t + 1);
  }

  const selectedEq =
    selectedId != null && shop ? shop.getEquipmentById(selectedId) : null;


async function handleSaveAndReturn() {
  if (!shop) return;
  setIsSaving(true);
  setSaveError("");
  setSaveSuccess(false);
  try {
    // Gather all equipment positions from the shop
    // Use equipmentDbId (the actual user_equipment.id) not the local canvas id
    const equipment_positions = shop.equipment_list
      .filter(eq => eq.equipmentDbId) // Only include equipment that has a DB ID
      .map(eq => ({
        equipment_id: eq.equipmentDbId,
        x: eq.x,
        y: eq.y,
        z: eq.z || 0
      }));

    const payload = {
      shop_name: shopForm.name,
      length: shopForm.length,
      width: shopForm.width,
      height: shopForm.height,
      equipment_positions: equipment_positions
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
    navigate("/shop-spaces");

  } catch (err) {
    console.error("Failed to save shop:", err);
    console.error("Error details:", err.response?.data);
    setSaveError(err.response?.data?.error || "Failed to save shop.");
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
        equipmentCatalog={equipmentCatalog}
        onDragStart={handleDragStart}
        selectedEq={selectedEq}
        rotateSelected={rotateSelected}
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        shopForm={shopForm}
        onShopFormChange={handleShopFormChange}
        onSaveAndReturn={handleSaveAndReturn}
        isSaving={isSaving}
        saveError={saveError}
        saveSuccess={saveSuccess}
      />

      <section className="shop-workspace">
        <ShopCanvas
          shop={shop}
          selectedId={selectedId}
          renderTick={renderTick}
          onSelectEquipment={handleSelectEquipment}
          onDropEquipment={handleDropEquipment}
          onMoveEquipment={handleMoveEquipment}     
          onDeleteEquipment={handleDeleteEquipment}
        />
      </section>

      {isDetailsOpen && selectedEq && (
        <EquipmentDetailsPanel
          equipment={selectedEq}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedId(null);
          }}
          onDelete={handleDeleteEquipment}
        />
      )}

    </main>
  );
}
