import React, { useState } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

export default function RecurringExpenses({ onToast }) {
  const { state, dispatch, fmt } = useExpense();
  const [name, setName] = useState('');
  const [amt,  setAmt]  = useState('');
  const [cat,  setCat]  = useState('other');
  const [open, setOpen] = useState(false);

  const addRecurring = () => {
    if (!name.trim()) { onToast('Enter expense name!', '✏️'); return; }
    if (!amt || parseFloat(amt) <= 0) { onToast('Enter valid amount!', '⚠️'); return; }
    dispatch({
      type: 'ADD_RECURRING',
      payload: { id: Date.now(), name: name.trim(), amt: parseFloat(amt), cat },
    });
    onToast(name + ' added as recurring!', '🔁');
    setName(''); setAmt('');
  };

  const deleteRecurring = (id) => {
    dispatch({ type: 'DELETE_RECURRING', payload: id });
    onToast('Recurring removed', '🗑️');
  };

  const applyNow = (r) => {
    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        id: Date.now(),
        name: r.name + ' (Manual)',
        amt: r.amt,
        cat: r.cat,
        date: new Date().toISOString(),
        isRecurring: true,
      },
    });
    onToast(r.name + ' added to expenses!', CAT[r.cat].icon);
  };

  return (
    <div className="section-box">
      <div className="section-title-row">
        <div className="section-title" style={{ margin: 0 }}>
          <span>🔁</span> Recurring Expenses
        </div>
        <button className="toggle-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'Hide' : '+ Add Recurring'}
        </button>
      </div>

      {open && (
        <div className="add-form" style={{ marginTop: 14 }}>
          <input
            type="text"
            placeholder="e.g. Hostel Rent, Netflix…"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="₹ Amount"
            value={amt}
            min="0"
            onChange={e => setAmt(e.target.value)}
          />
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {Object.entries(CAT).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <button className="btn-add" onClick={addRecurring}>Save</button>
        </div>
      )}

      {state.recurring.length === 0 ? (
        <p className="muted-text" style={{ marginTop: 12 }}>
          No recurring expenses yet. Add monthly fixed costs like rent, subscriptions, etc.
        </p>
      ) : (
        <div className="recurring-list">
          {state.recurring.map(r => {
            const cfg = CAT[r.cat] || CAT.other;
            return (
              <div className="expense-item" key={r.id}>
                <div className="expense-left">
                  <div className="expense-icon" style={{ background: cfg.color + '22' }}>
                    {cfg.icon}
                  </div>
                  <div className="expense-details">
                    <div className="expense-name">{r.name}</div>
                    <div className="expense-meta">
                      <span className={`cat-pill cat-${r.cat}`}>{cfg.label}</span>
                      <span className="recurring-badge">🔁 Monthly</span>
                    </div>
                  </div>
                </div>
                <div className="expense-right">
                  <div className="expense-amount">{fmt(r.amt)}</div>
                  <button
                    className="btn-set"
                    style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                    onClick={() => applyNow(r)}
                    title="Add to expenses now"
                  >
                    Add Now
                  </button>
                  <button className="btn-delete" onClick={() => deleteRecurring(r.id)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
