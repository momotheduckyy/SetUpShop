// frontend/src/App.jsx
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import DashboardLayout from './components/DashboardLayout'
import ShopSpaces from './components/ShopSpaces'
import EquipmentCatalog from './pages/EquipmentCatalog'
import MyEquipment from './pages/MyEquipment'
import Maintenance from './pages/Maintenance'
import NewShopPage from './pages/NewShopPage'
import ShopPage from './pages/ShopPage'
import './styles/App.css'

function App() {
  const [user, setUser] = useState(null)

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/shop-spaces" /> : <Login setUser={setUser} />}
          />

          {/* Redirect old dashboard route to shop spaces */}
          <Route
            path="/dashboard"
            element={<Navigate to="/shop-spaces" replace />}
          />

          {/* Main layout with sidebar - wraps all main views */}
          <Route
            path="/"
            element={user ? <DashboardLayout user={user} setUser={setUser} /> : <Navigate to="/login" />}
          >
            {/* Default route - shop spaces */}
            <Route index element={<Navigate to="/shop-spaces" replace />} />

            {/* Shop spaces list */}
            <Route path="shop-spaces" element={<ShopSpaces user={user} />} />

            {/* Equipment catalog */}
            <Route path="equipment-catalog" element={<EquipmentCatalog />} />

            {/* My Equipment */}
            <Route path="my-equipment" element={<MyEquipment user={user} />} />

            {/* Maintenance */}
            <Route path="maintenance" element={<Maintenance user={user} />} />
          </Route>

          {/* New shop creator - outside main layout */}
          <Route
            path="/new-shop"
            element={user ? <NewShopPage user={user} /> : <Navigate to="/login" />}
          />

          {/* Single shop editor - outside main layout */}
          <Route
            path="/shops/:shopId"
            element={user ? <ShopPage user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
