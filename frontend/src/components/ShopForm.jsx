// frontend/src/components/ShopForm.jsx

import "../styles/ShopSidebar.css";

export default function ShopForm({ shopForm = {}, onChange }) {
  const {
    name = "",
    width = 30,
    length = 40,
    height = 10,
  } = shopForm;

  return (
    <div className="shop-form">
      {/* Name — big full-width input */}
      <label className="shop-sidebar-label shop-name-label">
        Name
        <input
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          className="shop-sidebar-input shop-name-input"
        />
      </label>

      {/* Dimensions row: W, L, H */}
      <div className="shop-dimensions-row">
        <label className="shop-sidebar-label small-dim">
          W
          <input
            type="number"
            name="width"
            value={width}
            onChange={onChange}
            className="shop-sidebar-input small-dim-input"
            min={1}
          />
        </label>

        <label className="shop-sidebar-label small-dim">
          L
          <input
            type="number"
            name="length"
            value={length}
            onChange={onChange}
            className="shop-sidebar-input small-dim-input"
            min={1}
          />
        </label>

        <label className="shop-sidebar-label small-dim">
          H
          <input
            type="number"
            name="height"
            value={height}
            onChange={onChange}
            className="shop-sidebar-input small-dim-input"
            min={1}
          />
        </label>
      </div>
    </div>
  );
}
