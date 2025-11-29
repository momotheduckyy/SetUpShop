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
  zoom,
  setZoom,
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
      {/* Header + Edit toggle */}
      <div className="shop-header">
              {/* Shop metadata form */}
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
      <div>
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

      {/* Zoom controls */}
      <div className="zoom-controls">
        <h4>Zoom</h4>
        <div className="zoom-buttons">
          <button onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}>+</button>
          <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>
            −
          </button>
          <button onClick={() => setZoom(1)}>Reset</button>
        </div>
        <p className="zoom-display">{Math.round(zoom * 100)}%</p>
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
              <p>Maintenance: every {selectedEq.maintenanceIntervalDays} days</p>
            )}
            {selectedEq.maintenanceNotes && (
              <p className="selected-notes">Notes: {selectedEq.maintenanceNotes}</p>
            )}

            <div className="rotation-buttons">
              <button onClick={() => rotateSelected(-15)}>Rotate -15°</button>
              <button onClick={() => rotateSelected(15)}>Rotate +15°</button>
            </div>
          </div>
        ) : (
          <p>Click a machine in the layout.</p>
        )}
      </div>
           {/* Save & Return */}
      <div className="shop-save-row">
        <SaveButton
          onClick={onSaveAndReturn}
          isSaving={isSaving}
          disabled={!isEditing}
          label="Save & Return"
        />

        {saveError && (
          <span className="shop-save-status shop-save-status--error">
            {saveError}
          </span>
        )}
      </div>

    </aside>
  );
}
