// frontend/src/components/ShopCanvas.jsx

import { useEffect, useRef, useState, useMemo } from "react";
import EquipmentCrown from "./EquipmentCrown";

import { computeClearanceIssueIds } from "../utils/shopCanvasClearance";
import {
  renderShopScene
} from "../utils/shopCanvasView";

import {
  getShopCoordsFromEvent,
  findEquipmentAtPosition,
} from "../utils/shopCanvasHitTest";

import { canPlaceEquipment } from "../utils/collisionUtils";
import "../styles/Canvas.css";

export default function ShopCanvas({
  shop,
  selectedId,
  renderTick,
  onSelectEquipment,
  onDropEquipment,
  onMoveEquipment,
  onRemoveEquipment,
  rotateSelected,
  showUseAreas,
  draggingEq,
}) {
  const canvasRef = useRef(null);

  // View state (scale, offsets). Updated after each render.
  const viewRef = useRef({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    drawnWidth: 0,
    drawnHeight: 0,
  });

  // Crown position in pixels
  const [crownPos, setCrownPos] = useState(null);

  // Ghost preview while dragging from sidebar
  const [dragPreviewPos, setDragPreviewPos] = useState(null);

  // Drag state for moving equipment that already exists on canvas
  const dragRef = useRef({
    isDragging: false,
    equipmentId: null,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
  });

  // Compute which pieces have clearance issues
  const clearanceIssueIds = useMemo(
    () => computeClearanceIssueIds(shop, showUseAreas),
    [shop, renderTick, showUseAreas]
  );

  /* ------------------------------ DRAWING ------------------------------ */

  useEffect(() => {
    if (!shop) {
      setCrownPos(null);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Unified render call
    const { view, crownPos: newCrownPos } = renderShopScene({
      canvas,
      shop,
      selectedId,
      showUseAreas,
      clearanceIssueIds,
      draggingEq,
      dragPreviewPos,
    });

    if (!view) {
      setCrownPos(null);
      return;
    }

    viewRef.current = view;
    setCrownPos(newCrownPos);
  }, [
    shop,
    selectedId,
    renderTick,
    showUseAreas,
    draggingEq,
    dragPreviewPos,
    clearanceIssueIds,
  ]);

  /* ------------------------------ EVENTS ------------------------------ */

  function handleDragOver(e) {
    e.preventDefault();
    if (!draggingEq) return;

    const coords = getShopCoordsFromEvent(e, canvasRef.current, viewRef.current);
    if (coords) setDragPreviewPos(coords);
  }

  function handleDrop(e) {
    e.preventDefault();
    if (!shop) return;

    const data = e.dataTransfer.getData("application/json");
    if (!data) return;

    const eqConfig = JSON.parse(data);
    const coords = getShopCoordsFromEvent(e, canvasRef.current, viewRef.current);
    if (!coords) return;

    onDropEquipment?.(eqConfig, coords.x, coords.y);
    setDragPreviewPos(null);
  }

  function handleMouseDown(e) {
    if (!shop) return;
    e.preventDefault();

    const coords = getShopCoordsFromEvent(e, canvasRef.current, viewRef.current);
    if (!coords) return;

    const eq = findEquipmentAtPosition(shop, coords.x, coords.y);

    if (eq) {
      // Select and begin dragging
      onSelectEquipment?.(eq.id);

      dragRef.current = {
        isDragging: true,
        equipmentId: eq.id,
        offsetX: coords.x - eq.x,
        offsetY: coords.y - eq.y,
        startX: eq.x,
        startY: eq.y,
      };
    } else {
      // Clear selection
      onSelectEquipment?.(null);
      dragRef.current = {
        isDragging: false,
        equipmentId: null,
        offsetX: 0,
        offsetY: 0,
        startX: null,
        startY: null,
      };
    }
  }

  function handleMouseMove(e) {
    const dragState = dragRef.current;
    if (!dragState.isDragging || !shop) return;

    const coords = getShopCoordsFromEvent(e, canvasRef.current, viewRef.current);
    if (!coords) return;

    const newX = coords.x - dragState.offsetX;
    const newY = coords.y - dragState.offsetY;

    onMoveEquipment?.(dragState.equipmentId, newX, newY);
  }

  function handleMouseUp() {
    const dragState = dragRef.current;

    if (!shop || !dragState.equipmentId) {
      dragRef.current.isDragging = false;
      dragRef.current.equipmentId = null;
      setDragPreviewPos(null);
      return;
    }

    const id = dragState.equipmentId;
    const eq =
      shop.getEquipmentById?.(id) ??
      shop.equipment_list.find((e) => e.id === id);

    // If final position invalid → revert
    if (eq) {
      const finalX = eq.x;
      const finalY = eq.y;

      if (!canPlaceEquipment(shop, eq, finalX, finalY, id)) {
        onMoveEquipment?.(id, dragState.startX, dragState.startY);
      }
    }

    dragRef.current = {
      isDragging: false,
      equipmentId: null,
      offsetX: 0,
      offsetY: 0,
      startX: null,
      startY: null,
    };
    setDragPreviewPos(null);
  }

  function handleDeleteSelected() {
    if (!shop || selectedId == null || !onRemoveEquipment) return;
    const eq = shop.getEquipmentById?.(selectedId);
    if (eq) onRemoveEquipment(eq);
  }

  /* ------------------------------ RENDER ------------------------------ */

  return (
    <div className="shop-canvas-wrapper">
      <canvas
        ref={canvasRef}
        className="shop-canvas"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />

      {clearanceIssueIds.length > 0 && (
        <div className="clearance-warning-banner">
          ⚠️ Clearance zones overlap with walls or other tools
        </div>
      )}

      {selectedId != null && crownPos && (
        <EquipmentCrown
          key={`${selectedId}-${Date.now()}`}
          x={crownPos.x}
          y={crownPos.y}
          onRotateLeft={() => rotateSelected(-15)}
          onRotateRight={() => rotateSelected(15)}
          onDelete={handleDeleteSelected}
        />
      )}
    </div>
  );
}
