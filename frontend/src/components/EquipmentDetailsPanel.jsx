// frontend/src/components/EquipmentDetailsPanel.jsx

import React, { useState } from "react";
import EquipmentDetailsModal from "./EquipmentDetailsModal";
import "../styles/EquipmentDetailsPanel.css";

export default function EquipmentDetailsPanel({
  equipment,
  onClose,
  onDelete,
  rotateSelected,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!equipment) return null;

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // don't trigger expand when deleting
    onDelete?.(equipment);
  };

  const handlePanelClick = () => {
    setIsExpanded(true);
  };

  const handleCloseModal = () => {
    setIsExpanded(false);
  };

  const handleClosePanel = (e) => {
    e.stopPropagation(); // don't expand when clicking the X
    onClose?.();
  };

  return (
    <>
      {/* Original panel, click anywhere (except the X) to expand */}
      <div className="equipment-panel" onClick={handlePanelClick}>
        <div className="equipment-panel-header">
          <h4>{equipment.name}</h4>
          <button
            type="button"
            className="equipment-panel-close-btn"
            onClick={handleClosePanel}
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

      {/* Expanded modal */}
      {isExpanded && (
        <EquipmentDetailsModal
          equipment={equipment}
          onClose={handleCloseModal}
          onCollapse={handleCloseModal}
          onDelete={onDelete}
          rotateSelected={rotateSelected}
        />
      )}
    </>
  );
}
