// frontend/src/components/EquipmentDetailsPanel.jsx
import React from "react";
import "../styles/EquipmentDetailsPanel.css";

export default function EquipmentDetailsPanel({
  equipment,
  onClose,
  onDelete,
  onRotate,
}) {
  if (!equipment) return null;

  const handleDeleteClick = () => {
    onDelete?.(equipment);
  };

  const handleRotate = (delta) => {
    onRotate?.(delta);
  };

  return (
    <div className="equipment-panel">
      <div className="equipment-panel-header">
        <h4>{equipment.name}</h4>
        <button
          type="button"
          className="equipment-panel-close-btn"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="equipment-panel-body">
        {equipment.manufacturer && (
          <p>
            <strong>Manufacturer:</strong> {equipment.manufacturer}
          </p>
        )}
        {equipment.model && (
          <p>
            <strong>Model:</strong> {equipment.model}
          </p>
        )}
        {equipment.maintenanceIntervalDays && (
          <p>
            <strong>Maintenance:</strong>{" "}
            every {equipment.maintenanceIntervalDays} days
          </p>
        )}
        {equipment.maintenanceNotes && (
          <p>
            <strong>Notes:</strong> {equipment.maintenanceNotes}
          </p>
        )}

        {/* 🔁 Rotation controls */}
        {/*
        <div className="equipment-panel-rotation">
          <span>Rotation:</span>
          <button
            type="button"
            className="equipment-panel-rotate-btn"
            onClick={() => handleRotate(-15)}
          >
            −15°
          </button>
          <button
            type="button"
            className="equipment-panel-rotate-btn"
            onClick={() => handleRotate(15)}
          >
            +15°
          </button>
        </div>
        */}
      </div>

      <div className="equipment-panel-footer">
        <button
          type="button"
          className="equipment-panel-delete-btn"
          onClick={handleDeleteClick}
        >
          Delete from Shop
        </button>
      </div>
    </div>
  );
}
