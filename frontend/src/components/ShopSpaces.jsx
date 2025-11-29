import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'          // 👈 NEW
import { getShopsByUsername } from '../services/api'
import '../styles/ShopSpaces.css'

function ShopSpaces({ user }) {
  const [shopSpaces, setShopSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()                       // 👈 NEW

  useEffect(() => {
    fetchShopSpaces()
  }, [user])

  const fetchShopSpaces = async () => {
    try {
      const data = await getShopsByUsername(user.username)
      setShopSpaces(data.shops || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="shop-spaces-container">
        <h2>Loading...</h2>
      </div>
    )
  }

  return (
    <div className="shop-spaces-container">
      <h2>My Shop Spaces</h2>
      <div className="shop-spaces-list">
        {shopSpaces.length === 0 ? (
          <p>No shop spaces found</p>
        ) : (
          shopSpaces.map((space) => {
            const id = space.shop_id || space.id          // 👈 handle either field name

            return (
              <div
                key={id}
                className="shop-space-card"
                onClick={() => navigate(`/shops/${id}`)}   // 👈 navigate to editor
                style={{ cursor: 'pointer' }}              // 👈 visual hint
              >
                <h3>{space.shop_name}</h3>
                <p>
                  Dimensions: {space.length} × {space.width} × {space.height} ft
                </p>
                <p>Equipment: {space.equipment?.length ?? 0} items</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ShopSpaces
