import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipmentCatalog } from "../services/api";
import "../styles/Equipment.css"; // uses .eqp-* styles

export default function EquipmentCatalog() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getEquipmentCatalog();
        // Backend returns {equipment: [...]}
        const equipment = data.equipment || data;
        setItems(Array.isArray(equipment) ? equipment : []);
      } catch (e) {
        setErr(e.message || "Failed to load catalog");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="eqp-container">
        <h2>Equipment Catalog</h2>
        <p>Loading…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="eqp-container">
        <h2>Equipment Catalog</h2>
        <p className="eqp-muted">Error: {err}</p>
      </div>
    );
  }

  return (
    <div className="eqp-container">
      <h2>Equipment Catalog</h2>

      <div className="eqp-grid">
        {items.length === 0 ? (
          <div className="eqp-card">
            <h3>No equipment yet</h3>
            <p className="eqp-muted">
              Add some equipment types to the catalog to see them here.
            </p>
          </div>
        ) : (
          items.map((it) => (
            <div key={it.id} className="eqp-card">
              <img
                src={`/equipment-images/${it.image_path}`}
                alt={it.equipment_name}
                className="eqp-image"
              />
              <h3>{it.equipment_name}</h3>
              <p>{it.description}</p>

              <p className="eqp-muted">
                {it.width} × {it.height} × {it.depth} (mm)
              </p>
              <p className="eqp-muted">
                Maintenance every {it.maintenance_interval_days} days
              </p>

              {/* Future: add actions, e.g.
              <button className="eqp-btn">Add to My Shop</button>
              */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
