import React, { useEffect, useState } from 'react'
import { getShopsByUsername } from '../services/api'  // Import API function
import '../styles/ShopSpaces.css'

function ShopSpaces({ user }) {
  // State to store shop spaces and loading status
  const [shopSpaces, setShopSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch shop spaces when component loads
  useEffect(() => {
    fetchShopSpaces()
  }, [user])

  // Function to fetch shop spaces from backend API
  const fetchShopSpaces = async () => {
    try {
      // Call API to get this user's shop spaces
      const data = await getShopsByUsername(user.username)
      setShopSpaces(data.shops || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  // Show loading message while fetching data
  if (loading) {
    return <div className="shop-spaces-container"><h2>Loading...</h2></div>
  }

  // Render the list of shop spaces
  return (
    <div className="shop-spaces-container">
      <h2>My Shop Spaces</h2>
      <div className="shop-spaces-list">
        {shopSpaces.length === 0 ? (
          <p>No shop spaces found</p>
        ) : (
          // Map through each shop space and display as a card
          shopSpaces.map((space) => (
            <div key={space.shop_id} className="shop-space-card">
              <h3>{space.shop_name}</h3>
              <p>Dimensions: {space.length} × {space.width} × {space.height} ft</p>
              <p>Equipment: {space.equipment.length} items</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ShopSpaces
