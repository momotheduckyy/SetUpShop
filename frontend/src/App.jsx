// frontend/src/App.jsx
import MaintenancePage from './pages/MaintenancePage'
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ShopSpaces from './components/ShopSpaces'
import EquipmentCatalog from './pages/EquipmentCatalog'
import MyEquipment from './pages/MyEquipment' 
import NewShopPage from './pages/NewShopPage'
import ShopPage from './pages/ShopPage'        // 👈 make sure this line exists
import './styles/App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} setUser={setUser} /> : <Navigate to="/login" />}
          />

          {/* Shop spaces list */}
          <Route
            path="/shop-spaces"
            element={user ? <ShopSpaces user={user} /> : <Navigate to="/login" />}
          />

          {/* New shop creator */}
          <Route
            path="/new-shop"
            element={user ? <NewShopPage user={user} /> : <Navigate to="/login" />}
          />

          {/* 🔑 Single shop editor */}
          <Route
            path="/shops/:shopId"
            element={user ? <ShopPage user={user} /> : <Navigate to="/login" />}
          />

          {/* Equipment catalog */}
          <Route
            path="/equipment-catalog"
            element={user ? <EquipmentCatalog /> : <Navigate to="/login" />}
          />

          {/* Maintenance */}
          <Route
            path="/maintenance"
            element={user ? <MaintenancePage user={user} /> : <Navigate to="/login" />}
          />


          {/* My Equipment */}
          <Route
            path="/my-equipment"
            element={user ? <MyEquipment user={user} /> : <Navigate to="/login" />}
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
