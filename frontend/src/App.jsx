import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ShopSpaces from './components/ShopSpaces'
import EquipmentCatalog from './pages/EquipmentCatalog'
import './styles/App.css'
import NewShopPage from './pages/NewShopPage'


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
                  {/* Shop spaces list route */}
        <Route
          path="/shop-spaces"
          element={user ? <ShopSpaces user={user} /> : <Navigate to="/login" />}
        />

        {/* New shop layout builder */}
        <Route
          path="/new-shop"
          element={user ? <NewShopPage /> : <Navigate to="/login" />}
        />

        {/* Equipment catalog route */}
        <Route
          path="/equipment-catalog"
          element={user ? <EquipmentCatalog /> : <Navigate to="/login" />}
        />
        <Route path="/" element={<Navigate to="/login" />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
