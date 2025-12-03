// frontend/src/pages/ShopPage.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { Shop } from "../lib/models/Shop";
import ShopCanvas from "../components/ShopCanvas";
import ShopSidebar from "../components/ShopSidebar";
import EquipmentDetailsPanel from "../components/EquipmentDetailsPanel";

import {
  addEquipmentToShop,
  addEquipmentToUser,
  removeEquipmentFromShop,
  getEquipmentCatalog,
  getEquipmentById,
} from "../services/api";

import "../styles/ShopPage.css";

const API_BASE = "http://localhost:5001/api";

export default function ShopPage({ user }) {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);

  // Equipment TYPES from equipment_types (for the sidebar/library)
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [selectedId, setSelectedId] = useState(null);
  const [renderTick, setRenderTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form state for shop meta (name + dimensions)
  const [shopForm, setShopForm] = useState({
    name: "",
    length: 20,
    width: 20,
    height: 10,
  });

  // Save state (for the Save button)
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ---------------------------
  // 1) Fetch shop details (dimensions + existing placements)
  // ---------------------------
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

        const length = data.length ?? 20;
        const width = data.width ?? 20;
        const height = data.height ?? 10;

        // Shop constructor: (name, widthFt, depthFt, scale)
        const shopInstance = new Shop(name, width, length, 10);

        // Stash raw placements from DB so we can hydrate them later
        if (Array.isArray(data.equipment)) {
          shopInstance._pendingPlacements = data.equipment;
        }

        setShop(shopInstance);

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

  // ---------------------------
  // 2) Fetch equipment TYPES (equipment_types) for the sidebar
  // ---------------------------
  useEffect(() => {
    async function fetchEquipmentTypes() {
      try {
        const response = await getEquipmentCatalog();
        const equipmentTypesFromDb = response.equipment || response.catalog || [];

        const transformed = equipmentTypesFromDb.map((eq) => ({
          // explicit: this is the *type* id (equipment_types.id)
          equipmentTypeId: eq.id,
          name: eq.equipment_name || eq.name,
          // DB stores dimensions in inches; convert to feet
          widthFt: (eq.width ?? 72) / 12,
          depthFt: (eq.depth ?? 36) / 12,
          color: eq.color || "#aaa",
          manufacturer: eq.manufacturer || "",
          model: eq.model || "",
          maintenanceIntervalDays: eq.maintenance_interval_days,
          maintenanceNotes: eq.description || eq.maintenanceNotes || "",
        }));

        setEquipmentTypes(transformed);
      } catch (err) {
        console.error("Failed to load equipment catalog:", err);
      }
    }

    fetchEquipmentTypes();
  }, []);

  // ---------------------------
  // 3) Hydrate any existing placements from DB (one-time on load)
  // ---------------------------
  useEffect(() => {
    if (!shop || !shop._pendingPlacements) return;

    const placements = shop._pendingPlacements;
    shop._pendingPlacements = null; // avoid re-applying

    async function hydratePlacements() {
      for (const placement of placements) {
        try {
          const equipmentId = placement.equipment_id;
          if (!equipmentId) {
            console.warn("Placement missing equipment_id:", placement);
            continue;
          }

          const x =
            placement.x_coordinate ??
            placement.x ??
            placement.position?.x ??
            0;
          const y =
            placement.y_coordinate ??
            placement.y ??
            placement.position?.y ??
            0;

          // Lookup full equipment instance (user_equipment joined to type)
          const eqRes = await getEquipmentById(equipmentId);
          const eq = eqRes?.equipment || eqRes;
          if (!eq) {
            console.warn("No equipment data for id", equipmentId);
            continue;
          }

          // eq comes from user_equipment JOIN equipment_types
          const config = {
            name: eq.equipment_name || "Equipment",
            widthFt: (eq.width ?? 72) / 12,
            depthFt: (eq.depth ?? 36) / 12,
            color: eq.color || "#aaa",
            manufacturer: eq.manufacturer || "",
            model: eq.model || "",
            maintenanceIntervalDays: eq.maintenance_interval_days,
            maintenanceNotes: eq.description || "",
            // This is the *user_equipment* id for this instance
            equipmentDbId: eq.id,
          };

          const rotationDeg = placement.rotationDeg || 0;
          shop.addEquipment(config, x, y, rotationDeg);
        } catch (err) {
          console.error("Failed to hydrate placement:", placement, err);
        }
      }

      setRenderTick((t) => t + 1);
    }

    hydratePlacements();
  }, [shop]);

  // ---------------------------
  // 4) Keep Shop dimensions in sync with the form
  // ---------------------------
  useEffect(() => {
    if (!shop) return;

    // Shop(name, widthFt, depthFt, scale)
    // We'll treat:
    //   shop.widthFt = room width
    //   shop.depthFt = room length
    shop.widthFt = shopForm.width;
    shop.depthFt = shopForm.length;

    setRenderTick((t) => t + 1);
  }, [shop, shopForm.length, shopForm.width]);

  // ---------------------------
  // UI handlers
  // ---------------------------
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
    // eq is an equipment TYPE from equipmentTypes
    e.dataTransfer.setData("application/json", JSON.stringify(eq));
  }

  // ---------------------------
  // DROP NEW EQUIPMENT (frontend-only; no backend yet)
  // ---------------------------
  function handleDropEquipment(eqConfig, x, y) {
    if (!shop) return;

    shop.addEquipment(
      {
        name: eqConfig.name,
        widthFt: eqConfig.widthFt,
        depthFt: eqConfig.depthFt,
        color: eqConfig.color,
        manufacturer: eqConfig.manufacturer,
        model: eqConfig.model,
        maintenanceIntervalDays: eqConfig.maintenanceIntervalDays,
        maintenanceNotes: eqConfig.maintenanceNotes,
        // new piece → no DB id yet
        equipmentDbId: null,
      },
      x,
      y
    );

    setRenderTick((t) => t + 1);
  }

  // ---------------------------
  // MOVE EXISTING EQUIPMENT (frontend-only; backend handled on Save)
  // ---------------------------
  function handleMoveEquipment(id, newX, newY) {
    if (!shop) return;

    shop.moveEquipment(id, newX, newY);
    setRenderTick((t) => t + 1);
  }

  function handleSelectEquipment(id) {
    setSelectedId(id);
    setIsDetailsOpen(id != null);
  }

  // ---------------------------
  // DELETE EQUIPMENT FROM SHOP (frontend-only; backend handled on Save)
  // ---------------------------
  function handleDeleteEquipment(equipment) {
    if (!shop || !equipment) return;

    shop.removeEquipmentById(equipment.id);
    setSelectedId(null);
    setRenderTick((t) => t + 1);
    setIsDetailsOpen(false);
  }

  function rotateSelected(delta) {
    if (selectedId == null || !shop) return;
    shop.rotateEquipment(selectedId, delta);
    setRenderTick((t) => t + 1);
  }

  const selectedEq =
    selectedId != null && shop ? shop.getEquipmentById(selectedId) : null;

  // ---------------------------
  // SAVE SNAPSHOT TO BACKEND + RETURN
  // ---------------------------
  async function handleSaveAndReturn() {
    if (!shop) return;

    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      // 1) Save dimensions
      const dimPayload = {
        length: shopForm.length,
        width: shopForm.width,
        height: shopForm.height,
      };

      await axios.put(`${API_BASE}/shops/${shopId}`, dimPayload);

      // 2) Sync equipment snapshot
      const storedUser = user || JSON.parse(localStorage.getItem("user"));
      if (!storedUser || !storedUser.id) {
        throw new Error("No logged-in user; cannot save equipment layout.");
      }

      // 2a) Get the current server-side equipment list so we can clear it
      const shopRes = await axios.get(`${API_BASE}/shops/${shopId}`);
      const serverShop = shopRes.data.shop;
      const existingPlacements = serverShop?.equipment || [];

      // Remove all existing placements for this shop
      for (const placement of existingPlacements) {
        const equipmentId = placement.equipment_id;
        if (!equipmentId) continue;
        try {
          await removeEquipmentFromShop(shopId, equipmentId);
        } catch (err) {
          console.error(
            "Failed to remove old placement for equipment",
            equipmentId,
            err
          );
        }
      }
      console.log("SNAPSHOT: equipment_list being saved:", shop.equipment_list);

      // 2b) Add all current frontend equipment as placements
      for (const eq of shop.equipment_list) {
        let equipmentDbId = eq.equipmentDbId;

        // If this is a brand new piece (no DB id yet), create user_equipment now
        if (!equipmentDbId) {
          // Find matching type in the catalog by name
          const matchingType = equipmentTypes.find(
            (t) => t.name === eq.name
          );

          if (!matchingType) {
            console.warn(
              "No matching equipment type found for",
              eq.name,
              "- skipping"
            );
            continue;
          }

          const userEqRes = await addEquipmentToUser(storedUser.id, {
            
            equipment_type_id: matchingType.equipmentTypeId,
            notes: "",
            purchase_date: new Date().toISOString().split("T")[0],
          });
          console.log("SNAPSHOT: added placement for", equipmentDbId, "at", eq.x, eq.y);


          const created = userEqRes?.equipment || userEqRes;
          equipmentDbId =
            created?.id ??
            created?.equipment_id ??
            created?.userEquipmentId ??
            null;

          if (!equipmentDbId) {
            console.error(
              "Could not determine equipmentDbId for new equipment",
              created
            );
            continue;
          }

          // Keep it on the object so subsequent saves know it's persisted
          eq.equipmentDbId = equipmentDbId;
        }

        // Now add the placement using the user_equipment.id
        try {
          await addEquipmentToShop(shopId, {
            equipmentId: equipmentDbId,
            x: eq.x,
            y: eq.y,
            z: 0,
            rotationDeg: eq.rotationDeg ?? 0,
          });
        } catch (err) {
          console.error(
            "Failed to add placement for equipmentDbId",
            equipmentDbId,
            err
          );
        }
      }

      setSaveSuccess(true);
      navigate("/shop-spaces");
    } catch (err) {
      console.error("Failed to save shop:", err);
      setSaveError(err.message || "Failed to save shop.");
    } finally {
      setIsSaving(false);
    }
  }

  // ---------------------------
  // Render branches
  // ---------------------------
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
        onClick={() => navigate("/shop-spaces")}
      >
        ← Back to My Shop Spaces
      </button>

      <ShopSidebar
        shop={shop}
        shopId={shopId}
        equipmentCatalog={equipmentTypes} // sidebar shows DB catalog
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
          onRotate={(delta) => rotateSelected(delta)}
        />
      )}
    </main>
  );
}
