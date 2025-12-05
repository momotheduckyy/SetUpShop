import React, { useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { getUserEquipment, recordMaintenance } from '../services/api'
import '../styles/Maintenance.css'
import '../styles/Equipment.css'

function Maintenance({ user }) {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [recordingId, setRecordingId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    fetchEquipmentWithMaintenance()
  }, [user])

  async function fetchEquipmentWithMaintenance() {
    if (!user || !user.id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await getUserEquipment(user.id)
      const equipmentData = response.equipment || []

      // Calculate maintenance status for each equipment
      const equipmentWithStatus = equipmentData.map(eq => {
        const nextDate = eq.next_maintenance_date
        const status = getMaintenanceStatus(nextDate)
        const daysUntil = nextDate ? Math.ceil((new Date(nextDate) - new Date()) / (1000 * 60 * 60 * 24)) : null

        return {
          ...eq,
          maintenanceStatus: status,
          daysUntilMaintenance: daysUntil
        }
      })

      // Sort by maintenance urgency
      equipmentWithStatus.sort((a, b) => {
        const statusOrder = { overdue: 0, due_soon: 1, good: 2, no_date: 3 }
        return statusOrder[a.maintenanceStatus] - statusOrder[b.maintenanceStatus]
      })

      setEquipment(equipmentWithStatus)
      setLoading(false)
    } catch (err) {
      console.error('Failed to load equipment:', err)
      setError('Failed to load equipment maintenance data')
      setLoading(false)
    }
  }

  function getMaintenanceStatus(nextMaintenanceDate) {
    if (!nextMaintenanceDate) return 'no_date'

    const today = new Date()
    const nextDate = new Date(nextMaintenanceDate)
    const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 30) return 'due_soon'
    return 'good'
  }

  function getStatusBadge(status) {
    const badges = {
      overdue: { text: 'Overdue', className: 'status-overdue' },
      due_soon: { text: 'Due Soon', className: 'status-due-soon' },
      good: { text: 'Up to Date', className: 'status-good' },
      no_date: { text: 'Not Scheduled', className: 'status-no-date' }
    }
    const badge = badges[status] || badges.no_date
    return <span className={`status-badge ${badge.className}`}>{badge.text}</span>
  }

  function formatDate(dateString) {
    if (!dateString) return 'Not scheduled'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  async function handleRecordMaintenance(equipmentId) {
    try {
      setRecordingId(equipmentId)
      await recordMaintenance(equipmentId)
      // Refresh the equipment list
      await fetchEquipmentWithMaintenance()
      setRecordingId(null)
    } catch (err) {
      console.error('Failed to record maintenance:', err)
      alert('Failed to record maintenance')
      setRecordingId(null)
    }
  }

  if (loading) {
    return (
      <div className="maintenance-container">
        <h2>Maintenance Schedule</h2>
        <p>Loading equipment maintenance data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="maintenance-container">
        <h2>Maintenance Schedule</h2>
        <p className="error-message">{error}</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="maintenance-container">
        <h2>Maintenance Schedule</h2>
        <p>Please log in to view maintenance schedules</p>
      </div>
    )
  }

  if (equipment.length === 0) {
    return (
      <div className="maintenance-container">
        <h2>Maintenance Schedule</h2>
        <p className="eqp-muted">No equipment found. Add equipment to your inventory to track maintenance.</p>
      </div>
    )
  }

  const overdueCount = equipment.filter(eq => eq.maintenanceStatus === 'overdue').length
  const dueSoonCount = equipment.filter(eq => eq.maintenanceStatus === 'due_soon').length

  // Get dates with maintenance scheduled
  const maintenanceDates = equipment
    .filter(eq => eq.next_maintenance_date)
    .map(eq => new Date(eq.next_maintenance_date).toDateString())

  // Check if a date has maintenance
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString()
      if (maintenanceDates.includes(dateStr)) {
        return 'has-maintenance'
      }
    }
    return null
  }

  // Group equipment by time period
  const groupEquipmentByPeriod = () => {
    const today = new Date()
    const groups = {
      overdue: [],
      thisWeek: [],
      thisMonth: [],
      upcoming: []
    }

    equipment.forEach(eq => {
      if (eq.maintenanceStatus === 'overdue') {
        groups.overdue.push(eq)
      } else if (eq.daysUntilMaintenance !== null) {
        if (eq.daysUntilMaintenance <= 7) {
          groups.thisWeek.push(eq)
        } else if (eq.daysUntilMaintenance <= 30) {
          groups.thisMonth.push(eq)
        } else {
          groups.upcoming.push(eq)
        }
      } else {
        groups.upcoming.push(eq)
      }
    })

    return groups
  }

  const groups = groupEquipmentByPeriod()

  const renderEquipmentGroup = (title, equipmentList, emptyMessage) => {
    if (equipmentList.length === 0) return null

    return (
      <div className="equipment-group">
        <h3 className="group-title">{title} ({equipmentList.length})</h3>
        <div className="equipment-cards">
          {equipmentList.map(eq => (
            <div key={eq.id} className={`equipment-card ${eq.maintenanceStatus}`}>
              <div className="card-header">
                <h4 className="equipment-name">{eq.equipment_name}</h4>
                {getStatusBadge(eq.maintenanceStatus)}
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Next Due:</span>
                  <span className="detail-value">
                    {eq.next_maintenance_date ? (
                      <>
                        {formatDate(eq.next_maintenance_date)}
                        {eq.daysUntilMaintenance !== null && (
                          <span className="days-until">
                            {eq.daysUntilMaintenance > 0
                              ? ` (in ${eq.daysUntilMaintenance} days)`
                              : ` (${Math.abs(eq.daysUntilMaintenance)} days ago)`}
                          </span>
                        )}
                      </>
                    ) : (
                      'Not scheduled'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Interval:</span>
                  <span className="detail-value">{eq.maintenance_interval_days} days</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Done:</span>
                  <span className="detail-value">{formatDate(eq.last_maintenance_date)}</span>
                </div>
              </div>
              <button
                className="record-maintenance-btn"
                onClick={() => handleRecordMaintenance(eq.id)}
                disabled={recordingId === eq.id}
              >
                {recordingId === eq.id ? 'Recording...' : 'Record Maintenance'}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="maintenance-container">
      <div className="maintenance-header">
        <h2>Maintenance Schedule</h2>
        <div className="maintenance-summary">
          {overdueCount > 0 && (
            <div className="summary-card overdue">
              <span className="summary-number">{overdueCount}</span>
              <span className="summary-label">Overdue</span>
            </div>
          )}
          {dueSoonCount > 0 && (
            <div className="summary-card due-soon">
              <span className="summary-number">{dueSoonCount}</span>
              <span className="summary-label">Due Soon</span>
            </div>
          )}
          <div className="summary-card total">
            <span className="summary-number">{equipment.length}</span>
            <span className="summary-label">Total Equipment</span>
          </div>
        </div>
      </div>

      <div className="calendar-list-hybrid">
        {/* Left Side: Calendar */}
        <div className="calendar-section">
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            tileClassName={tileClassName}
            className="maintenance-calendar"
          />
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot has-maintenance"></span>
              <span>Maintenance Due</span>
            </div>
          </div>
        </div>

        {/* Right Side: Equipment List */}
        <div className="equipment-list-section">
          {groups.overdue.length > 0 && renderEquipmentGroup('🔴 Overdue', groups.overdue)}
          {groups.thisWeek.length > 0 && renderEquipmentGroup('🟠 This Week', groups.thisWeek)}
          {groups.thisMonth.length > 0 && renderEquipmentGroup('🟡 This Month', groups.thisMonth)}
          {groups.upcoming.length > 0 && renderEquipmentGroup('✅ Upcoming', groups.upcoming)}

          {equipment.length > 0 &&
           groups.overdue.length === 0 &&
           groups.thisWeek.length === 0 &&
           groups.thisMonth.length === 0 &&
           groups.upcoming.length === 0 && (
            <p className="no-equipment">All equipment is up to date!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Maintenance
