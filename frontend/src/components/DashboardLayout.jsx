import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import '../styles/DashboardLayout.css'

function DashboardLayout({ user, setUser }) {
  return (
    <div className="dashboard-layout">
      <Sidebar user={user} setUser={setUser} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default DashboardLayout
