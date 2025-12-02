// frontend/src/pages/MyEquipment.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserEquipment, getShopsByUsername } from "../services/api";
import "../styles/Equipment.css";   // ok if this file doesn’t exist yet

function MyEquipment({ user }) {
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch equipment + shops
  useEffect(() => {
    if (!user) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const [eqRes, shopsRes] = await Promise.all([
          getUserEquipment(user.id),
          getShopsByUsername(user.username),
        ]);

        console.log("MyEquipment user:", user);
        console.log("MyEquipment equipment API response:", eqRes);
        console.log("MyEquipment shops API response:", shopsRes);

        setEquipment(eqRes?.equipment || []);
        setShops(shopsRes?.shops || []);
        setError("");
      } catch (err) {
        console.error("MyEquipment error:", err);
        setError(err.message || "Failed to load equipment");
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [user]);

  // Map catalog-type-id → shops containing that type
  const equipmentTypeToShops = {};
  shops.forEach((shop) => {
    const placements = Array.isArray(shop.equipment) ? shop.equipment : [];
    placements.forEach((p) => {
      const typeId = p.equipment_id; // catalog id
      if (!equipmentTypeToShops[typeId]) {
        equipmentTypeToShops[typeId] = [];
      }
      equipmentTypeToShops[typeId].push(shop);
    });
  });

  if (loading) {
    return (
      <div className="eqp-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h2>My Equipment</h2>
        <p className="eqp-muted">Loading your equipment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eqp-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h2>My Equipment</h2>
        <p className="eqp-muted">Error: {error}</p>
      </div>
    );
  }

  // Still nothing from API
  if (equipment.length === 0) {
    return (
      <div className="eqp-container">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h2>My Equipment</h2>
        <p className="eqp-muted">
          View all equipment you own and which shop space it belongs to.
        </p>
        <p className="eqp-muted">
          You don&apos;t have any equipment yet.
        </p>
      </div>
    );
  }

  return (
    <div className="eqp-container">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h2>My Equipment</h2>
      <p className="eqp-muted">
        View all equipment you own and which shop space it belongs to.
      </p>

      <section className="eqp-card" style={{ width: "100%" }}>
        <table className="eqp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Dimensions (W×D×H)</th>
              <th>Purchased</th>
              <th>Next Maintenance</th>
              <th>Shop Space(s)</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => {
              const shopsForEq = equipmentTypeToShops[eq.equipment_type_id] || [];
              const shopNames =
                shopsForEq.length === 0
                  ? "Not placed"
                  : shopsForEq.map((s) => s.shop_name).join(", ");

              return (
                <tr key={eq.id}>
                  <td>{eq.equipment_name}</td>
                  <td>{eq.description || "-"}</td>
                  <td>
                    {eq.width} × {eq.depth} × {eq.height}
                  </td>
                  <td>{eq.date_purchased || "-"}</td>
                  <td>{eq.next_maintenance_date || "-"}</td>
                  <td>{shopNames}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default MyEquipment;