import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import '../styles/Sidebar.css'

function Sidebar({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Set Up Shop</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/shop-spaces"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-text">My Shop Spaces</span>
        </NavLink>

        <NavLink
          to="/equipment-catalog"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-text">Equipment Catalog</span>
        </NavLink>

        <NavLink
          to="/my-equipment"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-text">My Equipment</span>
        </NavLink>

        <NavLink
          to="/maintenance"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-text">Maintenance</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
