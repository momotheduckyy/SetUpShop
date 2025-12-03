// frontend/src/components/EquipmentCard.jsx
import React from "react";
import "../styles/EquipmentCard.css";

export default function EquipmentCard({ equipment, onDragStart }) {
  const brand =
    equipment.manufacturer && equipment.model
      ? `${equipment.manufacturer} ${equipment.model}`
      : equipment.manufacturer
      ? equipment.manufacturer
      : equipment.model
      ? equipment.model
      : null;

  return (
    <div
      className="equipment-card"
      draggable
      onDragStart={(e) => onDragStart(e, equipment)}
    >
      <div className="equipment-card-header">
        <span className="equipment-card-title">{equipment.name}</span>
      </div>

      {brand && (
        <div className="equipment-card-brand">
          {brand}
        </div>
      )}
    </div>
  );
}
