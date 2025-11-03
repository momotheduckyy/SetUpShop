import React from 'react'
import { useNavigate } from 'react-router-dom' #added for navigation
import '../styles/Dashboard.css'
import { useNavigate } from "react-router-dom";

function Dashboard({ user, setUser }) {
  const navigate = useNavigate()  # Initialize navigation hook
  
  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Set Up Shop</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Your Workshop</h2>
          <p>Start designing your perfect shop space and managing your equipment.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Shop Spaces</h3>
            <p>Create and manage your workshop layouts</p>
            <button className="card-btn" onClick={() => navigate('/shop-spaces')}>
              View Shops
            </button>
          </div> #changed to allow shop space navigation 

          <div className="dashboard-card">
            <h3>Equipment Catalog</h3>
            <p>Browse available equipment and tools</p>
            <button className="card-btn"  onClick={() => navigate('/equipment-catalog')}>View Catalog</button>
          </div>

          <div className="dashboard-card">
            <h3>My Equipment</h3>
            <p>Manage your owned equipment and maintenance</p>
            <button className="card-btn">View Equipment</button>
          </div>

          <div className="dashboard-card">
            <h3>Maintenance</h3>
            <p>Track equipment maintenance schedules</p>
            <button className="card-btn">View Maintenance</button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
