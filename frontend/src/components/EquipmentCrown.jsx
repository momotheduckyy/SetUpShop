import "../styles/EquipmentCrown.css";
export default function EquipmentCrown({
  x,
  y,
  onRotateLeft,
  onRotateRight,
  onDelete,
}) {
  if (x == null || y == null) return null;

  return (
    <div
      className="equipment-crown"
      style={{ left: x, top: y }}
    >
      <button
        className="crown-icon-btn"
        type="button"
        onClick={onRotateLeft}
        title="Rotate left"
      >
        ⟲
      </button>

      <button
        className="crown-icon-btn"
        type="button"
        onClick={onRotateRight}
        title="Rotate right"
      >
        ⟳
      </button>

      <button
        className="crown-icon-btn crown-icon-danger"
        type="button"
        onClick={onDelete}
        title="Delete from shop"
      >
        ✕
      </button>
    </div>
  );
}
