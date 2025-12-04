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

 // Map user_equipment.id → shops that contain that specific item
  const userEquipmentIdToShops = {};
  shops.forEach((shop) => {
    const placements = Array.isArray(shop.equipment) ? shop.equipment : [];
    placements.forEach((p) => {
      const userEqId = p.equipment_id; // user_equipment.id
      if (!userEquipmentIdToShops[userEqId]) {
        userEquipmentIdToShops[userEqId] = [];
      }
      userEquipmentIdToShops[userEqId].push(shop);
    });
  });

  if (loading) {
    return (
      <div className="eqp-container">
        <h2>My Equipment</h2>
        <p className="eqp-muted">Loading your equipment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eqp-container">
        <h2>My Equipment</h2>
        <p className="eqp-muted">Error: {error}</p>
      </div>
    );
  }

  // Still nothing from API
  if (equipment.length === 0) {
    return (
      <div className="eqp-container">
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
      <h2>My Equipment</h2>
      <p className="eqp-muted">
        View all your equipment organized by shop space.
      </p>

      {/* --- SHOPS STACKED VERTICALLY --- */}
      {shops.map((shop) => {
        const placements = Array.isArray(shop.equipment) ? shop.equipment : [];

        // Equipment whose user_equipment.id matches the shop's placements
        const equipmentInThisShop = equipment.filter((eq) =>
          placements.some((p) => p.equipment_id === eq.id)
        );

        return (
          <section
            key={shop.shop_id}
            className="eqp-card"
            style={{ width: "100%", marginBottom: "30px" }}
          >
            <h3>{shop.shop_name}</h3>
            <p className="eqp-muted">Equipment in this shop space:</p>

            {equipmentInThisShop.length === 0 ? (
              <p className="eqp-muted">No equipment placed here yet.</p>
            ) : (
              <table className="eqp-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Dimensions (W×D×H)</th>
                    <th>Purchased</th>
                    <th>Next Maintenance</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentInThisShop.map((eq) => (
                    <tr key={eq.id}>
                       <td>
                        <img
                          src={`/equipment-images/${eq.image_path}`}
                          alt={eq.equipment_name}
                          className="eqp-thumb"
                        />
                      </td>
                      <td>{eq.equipment_name}</td>
                      <td>{eq.description || "-"}</td>
                      <td>
                        {eq.width} × {eq.depth} × {eq.height}
                      </td>
                      <td>{eq.date_purchased || "-"}</td>
                      <td>{eq.next_maintenance_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        );
      })}

      {/* --- UNPLACED EQUIPMENT SECTION --- */}
      {(() => {
        const placedIds = new Set(
          shops.flatMap((shop) =>
            (shop.equipment || []).map((p) => p.equipment_id)
          )
        );

        const unplaced = equipment.filter((eq) => !placedIds.has(eq.id));

        if (unplaced.length === 0) return null;

        return (
          <section className="eqp-card" style={{ width: "100%" }}>
            <h3>Unplaced Equipment</h3>
            <p className="eqp-muted">These items are not in any shop space.</p>

            <table className="eqp-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Dimensions (W×D×H)</th>
                  <th>Purchased</th>
                  <th>Next Maintenance</th>
                </tr>
              </thead>
              <tbody>
                {unplaced.map((eq) => (
                  <tr key={eq.id}>
                    <td>
                      <img
                        src={`/equipment-images/${eq.image_path}`}
                        alt={eq.equipment_name}
                        className="eqp-thumb"
                      />
                    </td>
                    <td>{eq.equipment_name}</td>
                    <td>{eq.description || "-"}</td>
                    <td>
                      {eq.width} × {eq.depth} × {eq.height}
                    </td>
                    <td>{eq.date_purchased || "-"}</td>
                    <td>{eq.next_maintenance_date || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        );
      })()}
    </div>
  );
}

export default MyEquipment;