// frontend/src/components/NewShopPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopForm from "../components/ShopForm";
import "../styles/NewShopPage.css";


const API_BASE = "http://localhost:5001/api";

export default function NewShopPage() {
  const navigate = useNavigate();

  const [newShopForm, setNewShopForm] = useState({
    name: "",
    length: 40,
    width: 30,
    height: 10,
    username: "",
  });

  const [shopId, setShopId] = useState(null);

  function handleNewShopChange(e) {
    const { name, value } = e.target;
    setNewShopForm((prev) => ({
      ...prev,
      [name]:
        name === "length" || name === "width" || name === "height"
          ? Number(value)
          : value,
    }));
  }

  async function handleCreateShop() {
    try {
      const payload = {
        shop_name: newShopForm.name,
        length: newShopForm.length,
        width: newShopForm.width,
        height: newShopForm.height,
      };

      const res = await axios.post(`${API_BASE}/shops/`, payload);
      const created = res.data.shop;

      const id = created.shop_id || created.id;
      setShopId(id);

      if (!id) {
        console.error("Created shop has no id:", created);
        alert("Shop created but no ID returned from backend.");
        return;
      }

      // 🔑 Immediately go to the layout view for this new shop
      navigate(`/shops/${id}`);
    } catch (err) {
      console.error("Failed to create shop:", err);
      alert("Failed to create shop. Check console for details.");
    }
  }

  // Form-only screen, centered
 return (
    <main className="new-shop-container">
      <div className="new-shop-card">
        <ShopForm
          newShopForm={newShopForm}
          onChange={handleNewShopChange}
          isEditing={true}
          toggleEditing={() => {}}
          shopId={shopId}
          enableEditToggle={false}
        />
        <button onClick={handleCreateShop} className="shop-form-submit-btn">
        + Create Shop
        </button>
      </div>
    </main>
  );
}
