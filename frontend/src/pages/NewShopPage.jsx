
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ShopForm from "../components/ShopForm";
import "../styles/NewShopPage.css";
import { ShopSize } from "../lib/models/ShopSize";



const API_BASE = "http://localhost:5001/api";

export default function NewShopPage({ user }) {
  const navigate = useNavigate();

  const [newShopForm, setNewShopForm] = useState({
    name: "",
    length: 10,
    width: 10,
    height: 10,
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
      const shopSize = new ShopSize({
        lengthFt: newShopForm.length,
        widthFt: newShopForm.width,
        heightFt: newShopForm.height,
      });

      const payload = {
        username: user.username,
        shop_name: newShopForm.name,
        shop_size: shopSize.toPayload(),
      };

      console.log("Creating shop with payload:", payload);

      const res = await axios.post(`${API_BASE}/shops/`, payload);
      console.log("Create shop response:", res.data);

      const created = res.data.shop;
      const id = created.shop_id || created.id;

      setShopId(id);

      if (!id) {
        console.error("Created shop has no id:", created);
        alert("Shop created but no ID returned from backend.");
        return;
      }

      navigate(`/shops/${id}`);
    } catch (err) {
      console.error(
        "Failed to create shop:",
        err.response?.status,
        err.response?.data || err.message
      );
      alert("Failed to create shop. Check console for details.");
    }
  }

  return (
    <main className="new-shop-container">
      <div className="new-shop-card">
        <ShopForm
          newShopForm={newShopForm}
          onChange={handleNewShopChange}
          isEditing={true}
          toggleEditing={() => {}}
          shopId={shopId}
        />
        <button onClick={handleCreateShop} className="shop-form-submit-btn">
          + Create Shop
        </button>
      </div>
    </main>
  );
}
