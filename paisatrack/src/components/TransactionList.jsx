import React, { useState } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

const VIEWS = ['day', 'week', 'month', 'all'];
const VIEW_LABELS = { day: 'Today', week: 'Week', month: 'Month', all: 'All' };

export default function TransactionList({ onToast }) {
  const { state, dispatch, now, sameDay, sameWeek, sameMonth, fmt, timeAgo } = useExpense();
  const [view, setView] = useState('day');

  const filtered = () => {
    const t = now();
    switch (view) {
      case 'day':   return state.expenses.filter(e => sameDay(new Date(e.date), t));
      case 'week':  return state.expenses.filter(e => sameWeek(new Date(e.date)));
      case 'month': return state.expenses.filter(e => sameMonth(new Date(e.date)));
      default:      return state.expenses;
    }
  };

  const data = filtered();

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
    onToast('Expense removed', '🗑️');
  };

  return (
    <div className="section-box">
      <div className="list-header">
        <div className="section-title" style={{ margin: 0 }}>
          <span>📋</span> Transactions
        </div>
        <div className="tabs">
          {VIEWS.map(v => (
            <button
              key={v}
              className={`tab${view === v ? ' active' : ''}`}
              onClick={() => setView(v)}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="expense-list">
        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧾</div>
            <p>No expenses here yet.<br />Start adding to track your spending!</p>
          </div>
        ) : (
          data.map(e => {
            const c = CAT[e.cat] || CAT.other;
            return (
              <div className="expense-item" key={e.id}>
                <div className="expense-left">
                  <div className="expense-icon" style={{ background: c.color + '22' }}>
                    {c.icon}
                  </div>
                  <div className="expense-details">
                    <div className="expense-name">{e.name}</div>
                    <div className="expense-meta">
                      <span className={`cat-pill cat-${e.cat}`}>{c.icon} {c.label}</span>
                      {e.isRecurring && <span className="recurring-badge">🔁 Auto</span>}
                      <span className="expense-time">{timeAgo(e.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="expense-right">
                  <div className="expense-amount">{fmt(e.amt)}</div>
                  <button className="btn-delete" onClick={() => handleDelete(e.id)}>✕</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
