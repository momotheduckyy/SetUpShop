// frontend/src/pages/ShopPage.jsx

import { useParams, useNavigate } from "react-router-dom";
import ShopCanvas from "../components/ShopCanvas";
import ShopSidebar from "../components/ShopSidebar";
import EquipmentDetailsPanel from "../components/EquipmentDetailsPanel";
import "../styles/ShopPage.css";
import { useShopPage } from "../hooks/useShopPage";

export default function ShopPage({ user }) {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const {
    shop,
    equipmentCatalog,
    selectedId,
    selectedEq,
    renderTick,
    loading,
    errorMsg,
    isEditing,
    isDetailsOpen,
    shopForm,
    isSaving,
    saveError,
    saveSuccess,
    gridSizeFt,
    toggleEditing,
    handleShopFormChange,
    handleDragStart,
    handleDropEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDeleteEquipment,
    rotateSelected,
    handleSaveAndReturn,
    handleCloseDetailsPanel,
    handleGridSizeChange
  } = useShopPage({ shopId, user, navigate });

  if (loading) {
    return (
      <main className="shop-center-message">
        <p>Loading shop...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="shop-center-message">
        <p>{errorMsg}</p>
      </main>
    );
  }

  if (!shop) {
    return (
      <main className="shop-center-message">
        <p>Shop not available.</p>
      </main>
    );
  }

  return (
    <main className="shop-layout-container">
      <button
        className="back-btn-shop"
        onClick={() => navigate("/shop-spaces")}
      >
        ← Back to My Shop Spaces
      </button>

      <ShopSidebar
        shop={shop}
        shopId={shopId}
        equipmentCatalog={equipmentCatalog}
        onDragStart={handleDragStart}
        selectedEq={selectedEq}
        rotateSelected={rotateSelected}
        isEditing={isEditing}
        toggleEditing={toggleEditing}
        shopForm={shopForm}
        onShopFormChange={handleShopFormChange}
        onSaveAndReturn={handleSaveAndReturn}
        isSaving={isSaving}
        saveError={saveError}
        saveSuccess={saveSuccess}
        gridSizeFt={gridSizeFt}
        onGridSizeChange={handleGridSizeChange}
      />

      <section className="shop-workspace">
        <ShopCanvas
          shop={shop}
          selectedId={selectedId}
          renderTick={renderTick}
          onSelectEquipment={handleSelectEquipment}
          onDropEquipment={handleDropEquipment}
          onMoveEquipment={handleMoveEquipment}
          onRemoveEquipment={handleDeleteEquipment}
        />
      </section>

      {isDetailsOpen && selectedEq && (
        <EquipmentDetailsPanel
          equipment={selectedEq}
          onClose={handleCloseDetailsPanel}
          onDelete={handleDeleteEquipment}
        />
      )}
    </main>
  );
}
