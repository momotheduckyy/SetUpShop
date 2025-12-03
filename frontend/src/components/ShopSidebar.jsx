// frontend/src/components/ShopSidebar.jsx

import React from "react";
import ShopForm from "./ShopForm";
import SaveButton from "./SaveButton";
import "../styles/ShopSidebar.css";
import EquipmentCard from "./EquipmentCard";


export default function ShopSidebar({
  shop,
  shopId,
  onDragStart,
  isEditing,
  toggleEditing,
  shopForm,
  equipmentCatalog,
  onShopFormChange,
  onSaveAndReturn,
  isSaving,
  saveError,
  saveSuccess,
  selectedEq,
  rotateSelected,
}) {
  return (
    <aside className="shop-sidebar">
      {/* Shop details / dimensions */}
      <section className="shop-sidebar-section">
        <ShopForm
          newShopForm={shopForm}
          onChange={onShopFormChange}
          isEditing={isEditing}
          toggleEditing={toggleEditing}
          shopId={shopId}
        />
      </section>

      <button 
      type="button"
      className={`shop-edit-btn ${isEditing ? "editing" : ""}`} 
      onClick={toggleEditing}>
      {isEditing ? "Done" : "Edit "}
      </button>

      <section className="shop-sidebar-section">
      <h3 className="shop-sidebar-title">Equipment Library</h3>
      <p className="shop-sidebar-subtitle">
        Drag a tool into the workspace to add it to your shop.
      </p>

      {(!equipmentCatalog || equipmentCatalog.length === 0) && (
        <p className="shop-sidebar-empty">No equipment types found.</p>
      )}

      {equipmentCatalog && equipmentCatalog.length > 0 && (
        <ul className="shop-sidebar-equipment-list">
          {equipmentCatalog.map((eq) => (
            <li key={eq.equipmentTypeId}>
              <EquipmentCard equipment={eq} onDragStart={onDragStart} />
            </li>
          ))}
        </ul>
      )}
    </section>


      {/* Save row */}
      <div className="shop-save-row">
        <SaveButton
          onClick={onSaveAndReturn}
          isSaving={isSaving}
          disabled={false}
          label="Save and Return"
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
