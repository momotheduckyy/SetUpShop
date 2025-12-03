// frontend/src/components/ShopSidebar.jsx

import React from "react";
import ShopForm from "./ShopForm";
import SaveButton from "./SaveButton";
import "../styles/ShopSidebar.css";

export default function ShopSidebar({
  shop,
  shopId,
  equipmentCatalog,
  onDragStart,
  selectedEq,
  rotateSelected,
  shopForm,
  onShopFormChange,
  onSaveAndReturn,
  isSaving,
  saveError,
  saveSuccess,
}) {
  return (
    <aside className="shop-sidebar">
      {/* Header + form (always editable) */}
      <div className="shop-header">
        {shopForm && (
          <ShopForm
            newShopForm={shopForm}
            onChange={onShopFormChange}
            isEditing={true}
            shopId={shopId}
          />
        )}
      </div>

      {/* Equipment list for drag/drop */}
      <div className="sidebar-section">
        <h4>Equipment</h4>
        {equipmentCatalog && equipmentCatalog.length > 0 ? (
          equipmentCatalog.map((eq) => (
            <div
              key={eq.id}
              className="equipment-tile"
              draggable
              onDragStart={(e) => onDragStart(e, eq)}
            >
              {eq.name}
            </div>
          ))
        ) : (
          <p style={{ fontSize: '0.875rem', color: '#6e6e73', padding: '0.5rem 0' }}>
            No equipment available
          </p>
        )}
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
