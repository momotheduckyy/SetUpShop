// frontend/src/components/ShopSpaces.jsx

import React, { useEffect, useState } from "react";
import { getShopsByUsername } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/ShopSpaces.css";

function ShopSpaces({ user }) {
  const [shopSpaces, setShopSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchShopSpaces();
  }, [user]);

  async function fetchShopSpaces() {
    try {
      const data = await getShopsByUsername(user.username);
      setShopSpaces(data.shops || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="shop-spaces-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className="shop-spaces-container">
      <h2>My Shop Spaces</h2>

      {/* ➕ Create New Shop button */}
      <button
        className="create-shop-btn"
        onClick={() => navigate("/new-shop")}
      >
        + Create New Shop
      </button>

      <div className="shop-spaces-list">
        {shopSpaces.length === 0 ? (
          <p>No shop spaces found</p>
        ) : (
          shopSpaces.map((space) => (
            <div key={space.shop_id} className="shop-space-card">
              <h3>{space.shop_name}</h3>
              <p>
                Dimensions: {space.length} × {space.width} × {space.height} ft
              </p>
              <p>Equipment: {space.equipment.length} items</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ShopSpaces;
