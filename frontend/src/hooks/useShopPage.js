// frontend/src/hooks/useShopPage.js

import { useEffect, useState } from "react";
import axios from "axios";
import { Shop } from "../lib/models/Shop";
import {
  addEquipmentToShop,
  getUserEquipment,
  getEquipmentCatalog,
  deleteEquipment,
  addEquipmentToUser,
  removeEquipmentFromShop,
} from "../services/api";
import { normalizePosition } from "../utils/shopLayoutUtils";

const API_BASE = "http://localhost:5001/api";

export function useShopPage({ shopId, user, navigate }) {
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
  const [gridSizeFt, setGridSizeFt] = useState(0.5);


  // --- Load shop from backend ---
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

    if (shopId) {
      fetchShop();
    }
  }, [shopId]);

  // --- Load equipment catalog for sidebar ---
  useEffect(() => {
    async function fetchEquipmentCatalogData() {
      try {
        const response = await getEquipmentCatalog();
        const equipment = response.equipment || [];

        // Transform equipment catalog to match canvas format
        const transformedEquipment = equipment.map((eq) => ({
          id: eq.id, // equipment_types.id
          name: eq.equipment_name,
          widthFt: eq.width / 12, // Convert inches to feet
          depthFt: eq.depth / 12,
          color: eq.color || "#aaa",
          manufacturer: eq.manufacturer || "",
          model: eq.model || "",
          maintenanceIntervalDays: eq.maintenance_interval_days,
        }));

        setEquipmentCatalog(transformedEquipment);
      } catch (err) {
        console.error("Failed to load equipment catalog:", err);
      }
    }

    fetchEquipmentCatalogData();
  }, []);

  // --- Load user's equipment inventory ---
  useEffect(() => {
    async function fetchUserEquipmentData() {
      if (!user || !user.id) return;

      try {
        const response = await getUserEquipment(user.id);
        const equipment = response.equipment || [];

        // Transform equipment to match canvas format
        const transformedEquipment = equipment.map((eq) => ({
          id: eq.id, // user_equipment.id
          name: eq.equipment_name,
          widthFt: eq.width / 12, // Convert inches to feet
          depthFt: eq.depth / 12, // Convert inches to feet
          color: eq.color || "#aaa",
          manufacturer: eq.manufacturer || "",
          model: eq.model || "",
          maintenanceIntervalDays: eq.maintenance_interval_days,
          maintenanceNotes: eq.notes || "",
        }));

        setUserEquipment(transformedEquipment);
      } catch (err) {
        console.error("Failed to load user equipment:", err);
      }
    }

    fetchUserEquipmentData();
  }, [user]);

  // --- Apply pending equipment placements once both shop and userEquipment are loaded ---
  useEffect(() => {
    if (!shop || !shop._pendingPlacements) return;
    if (userEquipment.length === 0) return;

    const placements = shop._pendingPlacements;
    shop._pendingPlacements = null; // Clear to avoid re-applying

    for (const placement of placements) {
      // Find equipment in user's inventory
      const userEq = userEquipment.find(
        (eq) => eq.id === placement.equipment_id
      );

      if (!userEq) {
        console.warn(
          "Equipment not found in user inventory:",
          placement.equipment_id
        );
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

    setRenderTick((t) => t + 1);
  }, [shop, userEquipment]);

  // --- Keep Shop instance dimensions in sync with the form ---
  useEffect(() => {
    if (!shop) return;

    // To stay consistent with how Shop(name, length, width, 10) is constructed, we map:
    //  - shop.depthFt = length
    //  - shop.widthFt = width
    shop.depthFt = shopForm.length;
    shop.widthFt = shopForm.width;
    // height not used in 2D canvas yet, but we keep it in form for future.

    setRenderTick((t) => t + 1);
  }, [shop, shopForm.length, shopForm.width]);

  // --- Simple UI helpers / handlers ---

  function toggleEditing() {
    setIsEditing((prev) => !prev);
  }

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

    // Snap & clamp the drop location to the shop grid
    const { x: normX, y: normY } = normalizePosition(x, y, shop, gridSizeFt);

    // 1) Persist to backend first - add equipment to user inventory
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const activeUser = user && user.id ? user : storedUser;

      if (!activeUser || !activeUser.id) {
        console.error("No user logged in");
        return;
      }

      // First, add equipment to user's inventory
      const userEquipmentResponse = await addEquipmentToUser(activeUser.id, {
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
        x: normX,
        y: normY,
        z: 0,
      });

      // Update local state with the new user_equipment.id
      // Pass as equipment_id so Shop model stores it in equipmentDbId
      const placedEquipment = { ...eqConfig, equipment_id: userEquipmentId };
      shop.addEquipment(placedEquipment, normX, normY);
      console.log("Locally placed equipment with DB ID:", userEquipmentId);
      console.log("Equipment count in shop:", shop.equipment_list.length);

      setRenderTick((t) => t + 1);
    } catch (err) {
      console.error("Failed to save placement:", err);
    }
  }

  function handleMoveEquipment(id, newX, newY) {
    if (!shop) return;

    // Snap & clamp while dragging
    const { x, y } = normalizePosition(newX, newY, shop, gridSizeFt);
    shop.moveEquipment(id, x, y);
    setRenderTick((t) => t + 1);
  }

  function handleSelectEquipment(id) {
    setSelectedId(id);
    setIsDetailsOpen(id != null); // open modal when something is selected
  }

  async function handleDeleteEquipment(equipment) {
    if (!shop || !equipment) return;

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

        console.log(
          `Successfully deleted equipment ${equipment.equipmentDbId} from shop and user inventory`
        );
      } else {
        console.warn(
          "Equipment has no equipmentDbId; nothing deleted from backend."
        );
      }
    } catch (err) {
      console.error("Failed to delete equipment:", err);
      alert("Failed to delete equipment. Check console for details.");
    }
  }

  function rotateSelected(delta) {
    if (selectedId == null || !shop) return;
    shop.rotateEquipment(selectedId, delta);
    setRenderTick((t) => t + 1);
  }

  function handleGridSizeChange(newSizeFt) {
    setGridSizeFt(newSizeFt);
  }


  function handleCloseDetailsPanel() {
    setIsDetailsOpen(false);
    setSelectedId(null);
  }

  async function handleSaveAndReturn() {
    if (!shop) return;
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // Gather all equipment positions from the shop
      // Use equipmentDbId (the actual user_equipment.id) not the local canvas id
      const equipment_positions = shop.equipment_list
        .filter((eq) => eq.equipmentDbId) // Only include equipment that has a DB ID
        .map((eq) => ({
          equipment_id: eq.equipmentDbId,
          x: eq.x,
          y: eq.y,
          z: eq.z || 0,
        }));

      const payload = {
        shop_name: shopForm.name,
        length: shopForm.length,
        width: shopForm.width,
        height: shopForm.height,
        equipment_positions: equipment_positions,
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

      setSaveSuccess(true);

      if (navigate) {
        navigate("/shop-spaces");
      }
    } catch (err) {
      console.error("Failed to save shop:", err);
      console.error("Error details:", err.response?.data);
      setSaveError(err.response?.data?.error || "Failed to save shop.");
    } finally {
      setIsSaving(false);
    }
  }

  const selectedEq =
    selectedId != null && shop ? shop.getEquipmentById(selectedId) : null;

  return {
    // state
    shop,
    userEquipment,
    equipmentCatalog,
    selectedId,
    selectedEq,
    renderTick,
    loading,
    errorMsg,
    isEditing,
    isDetailsOpen,
    shopForm,
    isSaving,
    saveError,
    saveSuccess,
    gridSizeFt,
    // handlers
    toggleEditing,
    handleShopFormChange,
    handleDragStart,
    handleDropEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDeleteEquipment,
    rotateSelected,
    handleGridSizeChange,
    handleSaveAndReturn,
    handleCloseDetailsPanel,

  };
}
