
import React from "react";
import "../styles/ShopForm.css";

export default function ShopForm({
  newShopForm,
  onChange,
  isEditing = true,
  toggleEditing,   // for sidebar integration
  shopId,
}) {
  return (
    <div className="shop-form-container">
      <h3 className="shop-form-heading">Shop Details</h3>

      <fieldset disabled={!isEditing} className="shop-form-fieldset">
        {/* Shop Name */}
        <div className="shop-form-field">
          <label>Shop Name</label>
          <input
            type="text"
            name="name"
            value={newShopForm.name}
            onChange={onChange}
            className="shop-form-input"
          />
        </div>

        {/* Dimensions */}
        <div className="shop-form-dimensions">
          <div>
            <label>Length (ft)</label>
            <input
              type="number"
              name="length"
              value={newShopForm.length}
              onChange={onChange}
              className="shop-form-input"
            />
          </div>

          <div>
            <label>Width (ft)</label>
            <input
              type="number"
              name="width"
              value={newShopForm.width}
              onChange={onChange}
              className="shop-form-input"
            />
          </div>

          <div>
            <label>Height (ft)</label>
            <input
              type="number"
              name="height"
              value={newShopForm.height}
              onChange={onChange}
              className="shop-form-input"
            />
          </div>
        </div>
      </fieldset>

      {shopId && (
        <p className="shop-form-shop-id">
          Current shop ID: <strong>{shopId}</strong>
        </p>
      )}
    </div>
  );
}
