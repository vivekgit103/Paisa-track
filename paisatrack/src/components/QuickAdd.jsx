import React, { useState } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

const PRESETS = [
  { name: 'Chai',        amt: 15,  cat: 'food'      },
  { name: 'Auto Ride',   amt: 40,  cat: 'travel'    },
  { name: 'Xerox',       amt: 5,   cat: 'stationary'},
  { name: 'Maggi',       amt: 30,  cat: 'food'      },
  { name: 'Bus',         amt: 15,  cat: 'travel'    },
  { name: 'Pen',         amt: 10,  cat: 'stationary'},
  { name: 'Water Bottle',amt: 20,  cat: 'snacks'    },
  { name: 'Samosa',      amt: 12,  cat: 'snacks'    },
  { name: 'Movie Ticket',amt: 200, cat: 'entertainment'},
];

const PRESET_ICONS = {
  'Chai': '☕', 'Auto Ride': '🛺', 'Xerox': '📄', 'Maggi': '🍜',
  'Bus': '🚌', 'Pen': '🖊', 'Water Bottle': '💧', 'Samosa': '🥟',
  'Movie Ticket': '🎬',
};

export default function QuickAdd({ onToast }) {
  const { dispatch } = useExpense();
  const [name, setName]   = useState('');
  const [amt,  setAmt]    = useState('');
  const [cat,  setCat]    = useState('food');

  const push = (n, a, c) => {
    dispatch({
      type: 'ADD_EXPENSE',
      payload: { id: Date.now(), name: n, amt: parseFloat(a), cat: c, date: new Date().toISOString() },
    });
    onToast(n + ' – ₹' + a + ' added', CAT[c].icon);
  };

  const handleAdd = () => {
    if (!name.trim()) { onToast('Give the expense a name!', '✏️'); return; }
    if (!amt || parseFloat(amt) <= 0) { onToast('Enter a valid amount!', '⚠️'); return; }
    push(name.trim(), amt, cat);
    setName(''); setAmt('');
  };

  return (
    <div className="section-box">
      <div className="section-title"><span>⚡</span> Quick Add</div>

      <div className="quick-buttons">
        {PRESETS.map(p => (
          <button
            key={p.name}
            className="quick-btn"
            onClick={() => push(p.name, p.amt, p.cat)}
          >
            {PRESET_ICONS[p.name]} {p.name} ₹{p.amt}
          </button>
        ))}
      </div>

      <div className="add-form">
        <input
          type="text"
          placeholder="Expense name…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="number"
          placeholder="₹ Amount"
          value={amt}
          min="0"
          onChange={e => setAmt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <select value={cat} onChange={e => setCat(e.target.value)}>
          {Object.entries(CAT).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>
        <button className="btn-add" onClick={handleAdd}>+ Add</button>
        <button
          className="btn-clear"
          onClick={() => {
            if (window.confirm('Clear all expenses?')) {
              dispatch({ type: 'CLEAR_ALL' });
              onToast('All expenses cleared', '🧹');
            }
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
