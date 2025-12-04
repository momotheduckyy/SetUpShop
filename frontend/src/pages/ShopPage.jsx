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
    isDetailsOpen,
    shopForm,
    gridSizeFt,
    showUseAreas,
    draggingEq,          // 👈 NEW: drag ghost state
    toggleShowUseAreas,
    handleShopFormChange,
    handleDragStart,
    handleDropEquipment,
    handleMoveEquipment,
    handleSelectEquipment,
    handleDeleteEquipment,
    rotateSelected,
    handleCloseDetailsPanel,
    handleGridSizeChange,
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
        shopForm={shopForm}
        gridSizeFt={gridSizeFt}
        equipmentCatalog={equipmentCatalog}
        onShopFormChange={handleShopFormChange}
        onGridSizeChange={handleGridSizeChange}
        onDragStart={handleDragStart}
        showUseAreas={showUseAreas}
        onToggleUseAreas={toggleShowUseAreas}
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
          rotateSelected={rotateSelected}
          showUseAreas={showUseAreas}
          draggingEq={draggingEq}   
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
