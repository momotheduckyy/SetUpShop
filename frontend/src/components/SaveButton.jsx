// frontend/src/components/SaveButton.jsx

import React from "react";
import "../styles/ShopSidebar.css"; // or make a separate SaveButton.css later

export default function SaveButton({ onClick, isSaving, disabled, label = "Save and Return" }) {
  const effectiveDisabled = disabled || isSaving;

  return (
    <button
      type="button"
      className="shop-save-btn"
      onClick={onClick}
      disabled={effectiveDisabled}
    >
      {isSaving ? "Saving..." : label}
    </button>
  );
}
