import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getShopsByUsername, createShop, deleteShop } from '../services/api'
import '../styles/ShopSpaces.css'

function ShopSpaces({ user }) {
  const [shopSpaces, setShopSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [newShopForm, setNewShopForm] = useState({
    shopName: '',
    length: 40,
    width: 30,
    height: 10
  })

  const navigate = useNavigate()

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

  const handleOpenModal = () => {
    setShowCreateModal(true)
    setCreateError('')
    setNewShopForm({
      shopName: '',
      length: 40,
      width: 30,
      height: 10
    })
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setCreateError('')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setNewShopForm(prev => ({
      ...prev,
      [name]: name === 'shopName' ? value : Number(value)
    }))
  }

  const handleCreateShop = async (e) => {
    e.preventDefault()

    // Validation
    if (!newShopForm.shopName.trim()) {
      setCreateError('Shop name is required')
      return
    }
    if (newShopForm.length <= 0 || newShopForm.width <= 0 || newShopForm.height <= 0) {
      setCreateError('Dimensions must be greater than 0')
      return
    }

    setCreating(true)
    setCreateError('')

    try {
      const response = await createShop({
        username: user.username,
        shop_name: newShopForm.shopName,
        length: newShopForm.length,
        width: newShopForm.width,
        height: newShopForm.height
      })

      // Success - close modal, refresh list, navigate to new shop
      const newShopId = response.shop.shop_id
      handleCloseModal()
      await fetchShopSpaces()
      navigate(`/shops/${newShopId}`)
    } catch (err) {
      setCreateError(err.message || 'Failed to create shop')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteShop = async (e, shopId, shopName) => {
    e.stopPropagation() // Prevent card click navigation

    if (!window.confirm(`Are you sure you want to delete "${shopName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteShop(shopId)
      await fetchShopSpaces() // Refresh the list
    } catch (err) {
      alert(`Failed to delete shop: ${err.message}`)
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

      <button className="create-shop-btn" onClick={handleOpenModal}>
        + Create New Shop
      </button>

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
                <button
                  className="delete-shop-btn"
                  onClick={(e) => handleDeleteShop(e, id, space.shop_name)}
                  title="Delete shop"
                >
                  Delete
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Create Shop Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Shop Space</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleCreateShop}>
              <div className="modal-body">
                {createError && (
                  <div className="error-message">{createError}</div>
                )}

                <div className="form-group">
                  <label htmlFor="shopName">Shop Name *</label>
                  <input
                    type="text"
                    id="shopName"
                    name="shopName"
                    value={newShopForm.shopName}
                    onChange={handleFormChange}
                    placeholder="e.g., Garage Workshop"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="length">Length (ft) *</label>
                    <input
                      type="number"
                      id="length"
                      name="length"
                      value={newShopForm.length}
                      onChange={handleFormChange}
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="width">Width (ft) *</label>
                    <input
                      type="number"
                      id="width"
                      name="width"
                      value={newShopForm.width}
                      onChange={handleFormChange}
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="height">Height (ft) *</label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={newShopForm.height}
                      onChange={handleFormChange}
                      min="1"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <p className="form-hint">
                  You can add equipment to your shop after creation using the drag-and-drop interface.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShopSpaces
