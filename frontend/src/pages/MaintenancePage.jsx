import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/MaintenancePage.css';

export default function MaintenancePage({ user }) {
  const [schedule, setSchedule] = useState({ overdue: [], this_week: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/equipment/maintenance-schedule/${user.id}`);
      const data = await res.json();
      setSchedule(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching maintenance schedule:', err);
      setLoading(false);
    }
  };

  const handleComplete = async (equipmentId) => {
    try {
      await fetch(`http://localhost:5001/api/equipment/maintenance/complete/${equipmentId}`, {
        method: 'POST'
      });
      fetchSchedule();
    } catch (err) {
      console.error('Error completing maintenance:', err);
    }
  };

  const renderTask = (eq) => (
    <div key={eq.equipment_id} className="canvas-task">
      <input
        type="checkbox"
        className="canvas-checkbox"
        onChange={() => handleComplete(eq.equipment_id)}
      />
      <div className="canvas-task-content">
        <div className="canvas-task-header">
          <h4>{eq.equipment_name}</h4>
          <span className="canvas-due-date">{eq.next_maintenance_date_formatted}</span>
        </div>
        <div className="canvas-task-details">
          <span className="canvas-shop-location">
            📍 {eq.shop_name}
          </span>
          {eq.days_until < 0 && (
            <span className="canvas-overdue-badge">
              {Math.abs(eq.days_until)} days overdue
            </span>
          )}
          {eq.days_until >= 0 && eq.days_until <= 7 && (
            <span className="canvas-soon-badge">
              Due in {eq.days_until} days
            </span>
          )}
        </div>
        {eq.notes && (
          <p className="canvas-notes">{eq.notes}</p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="maintenance-page">
        <div className="loading">Loading maintenance schedule...</div>
      </div>
    );
  }

  return (
    <div className="maintenance-page">
      <header className="maintenance-header">
        <h1>Equipment Maintenance</h1>
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
      </header>

      <div className="maintenance-body">
        <section className="canvas-section overdue">
          <h3 className="canvas-section-title">
            Overdue ({schedule.overdue.length})
          </h3>
          {schedule.overdue.length === 0 ? (
            <p className="canvas-empty">No overdue maintenance! 🎉</p>
          ) : (
            <div className="canvas-task-list">
              {schedule.overdue.map(renderTask)}
            </div>
          )}
        </section>

        <section className="canvas-section this-week">
          <h3 className="canvas-section-title">
            This Week ({schedule.this_week.length})
          </h3>
          {schedule.this_week.length === 0 ? (
            <p className="canvas-empty">Nothing due this week</p>
          ) : (
            <div className="canvas-task-list">
              {schedule.this_week.map(renderTask)}
            </div>
          )}
        </section>

        <section className="canvas-section upcoming">
          <h3 className="canvas-section-title">
            Upcoming ({schedule.upcoming.length})
          </h3>
          {schedule.upcoming.length === 0 ? (
            <p className="canvas-empty">No upcoming maintenance scheduled</p>
          ) : (
            <div className="canvas-task-list">
              {schedule.upcoming.slice(0, 10).map(renderTask)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
