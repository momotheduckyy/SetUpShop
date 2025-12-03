// frontend/src/components/ShopSidebar.jsx

import React from "react";
import ShopForm from "./ShopForm";
import SaveButton from "./SaveButton";
import "../styles/ShopSidebar.css";
import { equipmentCatalog } from "../lib/data/equipmentCatalog";

export default function ShopSidebar({
  shop,
  shopId,
  onDragStart,
  selectedEq,
  rotateSelected,
  isEditing,
  toggleEditing,
  shopForm,
  onShopFormChange,
  onSaveAndReturn,
  isSaving,
  saveError,
  saveSuccess,
}) {
  return (
    <aside className="shop-sidebar">
      {/* Header + Edit toggle + form */}
      <div className="shop-header">
        {shopForm && (
          <ShopForm
            newShopForm={shopForm}
            onChange={onShopFormChange}
            isEditing={isEditing}
            shopId={shopId}
          />
        )}

        <button
          type="button"
          className={`shop-edit-btn ${isEditing ? "editing" : ""}`}
          onClick={toggleEditing}
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Equipment list for drag/drop */}
      <div className="sidebar-section">
        <h4>Equipment</h4>
        {equipmentCatalog.map((eq) => (
          <div
            key={eq.name}
            className="equipment-tile"
            draggable
            onDragStart={(e) => onDragStart(e, eq)}
          >
            {eq.name}
          </div>
        ))}
      </div>


      {/* Save & Return */}
      <div className="shop-save-row">
        <SaveButton
          onClick={onSaveAndReturn}
          isSaving={isSaving}
          label="Save & Return"
        />

        {saveError && (
          <span className="shop-save-status shop-save-status--error">
            {saveError}
          </span>
        )}
        {saveSuccess && !saveError && (
          <span className="shop-save-status shop-save-status--ok">
            Saved!
          </span>
        )}
      </div>
    </aside>
  );
}
