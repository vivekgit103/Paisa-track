import React from 'react';
import { useExpense } from '../context/ExpenseContext';

export default function StatsRow() {
  const { fmt, todaySpent, weekSpent, monthSpent } = useExpense();

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-label">Today</div>
        <div className="stat-value red">{fmt(todaySpent)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">This Week</div>
        <div className="stat-value">{fmt(weekSpent)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">This Month</div>
        <div className="stat-value teal">{fmt(monthSpent)}</div>
      </div>
    </div>
  );
}
