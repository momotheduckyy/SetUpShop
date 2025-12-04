// frontend/src/components/EquipmentDetailsModal.jsx

import React from "react";
import "../styles/EquipmentDetailsPanel.css";

export default function EquipmentDetailsModal({
  equipment,
  onClose,
  onCollapse,
  onDelete,
  rotateSelected,
}) {
  if (!equipment) return null;

  // -------- Image (optional) ----------
  // When you map image_path onto the frontend object, this will start working.
  const rawImagePath =
    equipment.imagePath ||
    equipment.image_path ||
    null;

  const imageSrc = rawImagePath
    ? rawImagePath.startsWith("http") || rawImagePath.startsWith("/")
      ? rawImagePath
      : `/equipment-images/${rawImagePath}`
    : null;

  // -------- Description ----------
  // Right now, description is NOT mapped in useShopPage.
  // This will show once you add `description: eq.description` there.
  const description =
    equipment.description ||
    "No detailed description has been saved for this tool yet.";

  // -------- Maintenance tasks / notes ----------
  const maintenanceInterval =
    equipment.maintenanceIntervalDays ??
    equipment.maintenance_interval_days ??
    null;

  const notes = equipment.maintenanceNotes || "";

  // Turn notes into bullet-style tasks if there are separators.
  const maintenanceTasks = notes
    ? notes
        .split(/[\n;•\-]+/) // split on newlines, semicolons, bullets, dashes
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const widthText =
    typeof equipment.widthFt === "number"
      ? `${equipment.widthFt.toFixed(1)} ft`
      : equipment.widthFt || "—";

  const depthText =
    typeof equipment.depthFt === "number"
      ? `${equipment.depthFt.toFixed(1)} ft`
      : equipment.depthFt || "—";

  const handleBackdropClick = () => {
    if (onCollapse) onCollapse();
    else if (onClose) onClose();
  };

  return (
    <div className="eq-details-backdrop" onClick={handleBackdropClick}>
      <div
        className="eq-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="eq-details-close"
          onClick={onClose}
        >
          ×
        </button>

        <header className="eq-details-header">
          <h2 className="eq-details-title">{equipment.name}</h2>
          {(equipment.manufacturer || equipment.model) && (
            <span className="eq-details-subtitle">
              {[equipment.manufacturer, equipment.model]
                .filter(Boolean)
                .join(" · ")}
            </span>
          )}
        </header>

        <section className="eq-details-body eq-details-body-grid">
          {/* Left: image if available */}
          {imageSrc && (
            <div className="eq-details-image-wrapper">
              <img
                src={imageSrc}
                alt={equipment.name}
                className="eq-details-image"
              />
            </div>
          )}

          {/* Right: specs + description + maintenance */}
          <div className="eq-details-main">
            <div className="eq-details-row">
              <span className="eq-details-label">Size (W × D):</span>
              <span className="eq-details-value">
                {widthText} × {depthText}
              </span>
            </div>

            {maintenanceInterval && (
              <div className="eq-details-row">
                <span className="eq-details-label">
                  Maintenance cycle:
                </span>
                <span className="eq-details-value">
                  Every {maintenanceInterval} days
                </span>
              </div>
            )}

            <div className="eq-details-section">
              <h3 className="eq-details-section-title">Description</h3>
              <p className="eq-details-description">{description}</p>
            </div>

            <div className="eq-details-section">
              <h3 className="eq-details-section-title">
                Maintenance Tasks
              </h3>
              {maintenanceTasks.length > 0 ? (
                <ul className="eq-details-maint-list">
                  {maintenanceTasks.map((task, idx) => (
                    <li key={idx} className="eq-details-maint-item">
                      {task}
                    </li>
                  ))}
                </ul>
              ) : notes ? (
                // If there were notes but we couldn't nicely split them
                <p className="eq-details-description">{notes}</p>
              ) : (
                <p className="eq-details-muted">
                  No specific maintenance tasks listed yet.
                </p>
              )}
            </div>
          </div>
        </section>

        <footer className="eq-details-footer">
          {rotateSelected && (
            <button
              type="button"
              className="eq-details-btn"
              onClick={rotateSelected}
            >
              Rotate 90°
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="eq-details-btn eq-details-btn-danger"
              onClick={() => onDelete(equipment)}
            >
              Remove from shop
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
