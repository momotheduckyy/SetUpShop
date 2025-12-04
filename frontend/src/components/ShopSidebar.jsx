// frontend/src/components/ShopSidebar.jsx

import { useState } from "react";
import ShopForm from "./ShopForm";
import "../styles/ShopSidebar.css";

export default function ShopSidebar({
  shop,
  shopForm,
  gridSizeFt,
  equipmentCatalog,
  onShopFormChange,
  onGridSizeChange,
  onDragStart,
  showUseAreas,       
  onToggleUseAreas,   
}) {
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const hasShop = !!shop;

  return (
    <aside className="shop-sidebar">
      {/* HEADER */}
      <div className="shop-sidebar-header">
        <h2 className="shop-sidebar-title">
          {shopForm.name || (hasShop ? shop.name : "Shop Layout")}
        </h2>
        {hasShop && (
          <div className="shop-sidebar-subtitle">
            {shopForm.width} ft × {shopForm.length} ft
          </div>
        )}
      </div>

      {/* STATE 1: MAIN INFO / STATIC VIEW */}
      {!isCatalogOpen && (
        <div className="shop-sidebar-body">
          {/* Shop dimensions / meta */}
          <section className="shop-sidebar-section">
            <h3 className="shop-sidebar-section-title">Shop Settings</h3>
            <ShopForm shopForm={shopForm} onChange={onShopFormChange} />
          </section>

          {/* Snap grid control */}
          <section className="shop-sidebar-section">
            <h3 className="shop-sidebar-section-title">Snap to Grid</h3>
            <div className="shop-sidebar-grid-row">
              <select
                value={gridSizeFt}
                onChange={(e) => onGridSizeChange(Number(e.target.value))}
                className="shop-sidebar-select"
              >
                <option value={0.25}>0.25 ft</option>
                <option value={0.5}>0.5 ft</option>
                <option value={1}>1 ft</option>
                <option value={2}>2 ft</option>
              </select>
              <span className="shop-sidebar-grid-hint">
                Current: {gridSizeFt} ft
              </span>
            </div>
          </section>

        {/* ✅ Show Clearance Zones toggle */}
          <section className="shop-sidebar-section">
            <div className="shop-sidebar-grid-row">
              <input
                type="checkbox"
                checked={showUseAreas}
                onChange={onToggleUseAreas}
                style={{ marginRight: 8 }}
              />
              <span className="shop-sidebar-grid-hint">
                Show Clearance Zones
              </span>
            </div>
          </section>

          {/* Add equipment button */}
          <section className="shop-sidebar-section">
            <button
              type="button"
              className="shop-sidebar-primary-button"
              onClick={() => setIsCatalogOpen(true)}
            >
              + Add Equipment
            </button>
          </section>
        </div>
      )}

      {/* STATE 2: EQUIPMENT CATALOG */}
      {isCatalogOpen && (
        <div className="shop-sidebar-body">
          <div className="shop-sidebar-catalog-header">
            <button
              type="button"
              className="shop-sidebar-secondary-button"
              onClick={() => setIsCatalogOpen(false)}
            >
              ← Back
            </button>
            <h3 className="shop-sidebar-section-title">Equipment Catalog</h3>
          </div>

          <div className="shop-sidebar-catalog-list">
            {equipmentCatalog.length === 0 && (
              <div className="shop-sidebar-empty">
                No equipment types found.
              </div>
            )}

            {equipmentCatalog.map((eq) => {
              const title = eq.manufacturer
                ? `${eq.manufacturer} ${eq.name}`
                : eq.name;

              const subtitle = [
                `${eq.widthFt.toFixed(1)} ft × ${eq.depthFt.toFixed(1)} ft`,
                eq.model && `${eq.model}`,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div
                  key={eq.id}
                  className="shop-sidebar-equipment-card"
                  draggable
                  onDragStart={(e) => onDragStart(e, eq)}
                  title={title}
                >
                  <div
                    className="shop-sidebar-equipment-color-chip"
                    style={{ backgroundColor: eq.color || "#aaa" }}
                  />
                  <div className="shop-sidebar-equipment-main">
                    <div className="shop-sidebar-equipment-name">{title}</div>
                    <div className="shop-sidebar-equipment-meta">
                      {subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="shop-sidebar-hint">
            Drag an item from this list onto the shop canvas to place it.
          </p>
        </div>
      )}
    </aside>
  );
}
