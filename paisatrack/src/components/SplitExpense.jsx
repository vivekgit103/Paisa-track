import React, { useState } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

export default function SplitExpense({ onToast }) {
  const { state, dispatch, fmt } = useExpense();
  const [open,    setOpen]    = useState(false);
  const [expName, setExpName] = useState('');
  const [total,   setTotal]   = useState('');
  const [cat,     setCat]     = useState('food');
  const [friends, setFriends] = useState('');

  const addSplit = () => {
    if (!expName.trim()) { onToast('Enter expense name!', '✏️'); return; }
    const amt = parseFloat(total);
    if (!amt || amt <= 0) { onToast('Enter valid amount!', '⚠️'); return; }

    const friendList = friends
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);

    if (friendList.length === 0) { onToast('Add at least one friend!', '👥'); return; }

    const everyone  = ['You', ...friendList];
    const perPerson = amt / everyone.length;

    const split = {
      id: Date.now(),
      name: expName.trim(),
      total: amt,
      cat,
      date: new Date().toISOString(),
      perPerson,
      members: everyone,
      settled: false,
    };

    dispatch({ type: 'ADD_SPLIT', payload: split });

    // Also add the full expense to tracker
    dispatch({
      type: 'ADD_EXPENSE',
      payload: { id: Date.now() + 1, name: expName.trim() + ' (Split)', amt, cat, date: new Date().toISOString() },
    });

    onToast(`Split ₹${amt} among ${everyone.length} people!`, '🤝');
    setExpName(''); setTotal(''); setFriends('');
  };

  const settle = (id) => {
    dispatch({ type: 'SETTLE_SPLIT', payload: id });
    onToast('Split marked as settled!', '✅');
  };

  const pending = state.splits.filter(s => !s.settled);
  const settled = state.splits.filter(s => s.settled);

  return (
    <div className="section-box">
      <div className="section-title-row">
        <div className="section-title" style={{ margin: 0 }}>
          <span>🤝</span> Split with Friends
        </div>
        <button className="toggle-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'Hide' : '+ Split Expense'}
        </button>
      </div>

      {open && (
        <div className="split-form">
          <input
            type="text"
            placeholder="What's the expense? (e.g. Dinner)"
            value={expName}
            onChange={e => setExpName(e.target.value)}
          />
          <div className="split-row">
            <input
              type="number"
              placeholder="Total ₹ amount"
              value={total}
              min="0"
              onChange={e => setTotal(e.target.value)}
            />
            <select value={cat} onChange={e => setCat(e.target.value)}>
              {Object.entries(CAT).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Friends' names (comma separated): Rahul, Priya, Kiran"
            value={friends}
            onChange={e => setFriends(e.target.value)}
          />
          <button className="btn-add" style={{ width: '100%' }} onClick={addSplit}>
            Calculate &amp; Split
          </button>
        </div>
      )}

      {pending.length === 0 && settled.length === 0 ? (
        <p className="muted-text" style={{ marginTop: 12 }}>
          No splits yet. Use this to split dinner bills, trips, or any shared expense!
        </p>
      ) : (
        <div className="splits-list">
          {pending.length > 0 && (
            <>
              <div className="split-section-label">Pending</div>
              {pending.map(s => (
                <div className="split-card" key={s.id}>
                  <div className="split-card-header">
                    <span className="expense-name">{s.name}</span>
                    <span className="expense-amount">{fmt(s.total)}</span>
                  </div>
                  <div className="split-members">
                    {s.members.map((m, i) => (
                      <div className="split-member" key={i}>
                        <span className={`member-tag${m === 'You' ? ' you' : ''}`}>{m}</span>
                        <span className="member-amt">{fmt(s.perPerson)}</span>
                      </div>
                    ))}
                  </div>
                  <button className="btn-settle" onClick={() => settle(s.id)}>
                    ✅ Mark as Settled
                  </button>
                </div>
              ))}
            </>
          )}

          {settled.length > 0 && (
            <>
              <div className="split-section-label" style={{ marginTop: 12 }}>Settled</div>
              {settled.map(s => (
                <div className="split-card settled" key={s.id}>
                  <div className="split-card-header">
                    <span className="expense-name" style={{ opacity: 0.5 }}>{s.name}</span>
                    <span className="settled-badge">Settled ✅</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
