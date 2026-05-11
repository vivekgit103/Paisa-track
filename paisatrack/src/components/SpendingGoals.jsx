import React, { useState } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

export default function SpendingGoals() {
  const { state, dispatch, catTotals, fmt } = useExpense();
  const [selected, setSelected] = useState('food');
  const [goalAmt, setGoalAmt]   = useState('');
  const [open, setOpen]         = useState(false);

  const saveGoal = () => {
    const val = parseFloat(goalAmt);
    if (!val || val <= 0) return;
    dispatch({ type: 'SET_GOAL', payload: { cat: selected, amount: val } });
    setGoalAmt('');
  };

  const categoriesWithGoals = Object.keys(CAT).filter(k => state.goals[k]);

  return (
    <div className="section-box">
      <div className="section-title-row">
        <div className="section-title" style={{ margin: 0 }}>
          <span>🎯</span> Spending Goals
        </div>
        <button className="toggle-btn" onClick={() => setOpen(o => !o)}>
          {open ? 'Hide' : 'Set Goals'}
        </button>
      </div>

      {open && (
        <div className="goal-form">
          <select value={selected} onChange={e => setSelected(e.target.value)}>
            {Object.entries(CAT).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.label}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Monthly limit ₹"
            value={goalAmt}
            min="0"
            onChange={e => setGoalAmt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveGoal()}
          />
          <button className="btn-set" onClick={saveGoal}>Save Goal</button>
        </div>
      )}

      {categoriesWithGoals.length === 0 ? (
        <p className="muted-text" style={{ marginTop: 12 }}>
          No goals set yet. Click "Set Goals" to add category limits.
        </p>
      ) : (
        <div className="goals-list">
          {categoriesWithGoals.map(k => {
            const cfg   = CAT[k];
            const spent = catTotals[k] || 0;
            const goal  = state.goals[k];
            const pct   = Math.min((spent / goal) * 100, 100);
            const over  = spent > goal;
            const warn  = pct >= 80 && !over;
            const barColor = over ? '#ff6b6b' : warn ? '#ffa552' : '#4ecdc4';

            return (
              <div className="goal-item" key={k}>
                <div className="goal-header">
                  <span>{cfg.icon} {cfg.label}</span>
                  <span style={{ color: over ? '#ff6b6b' : 'inherit' }}>
                    {fmt(spent)} / {fmt(goal)}
                    {over && ' 🚨'}
                    {warn && ' ⚠️'}
                  </span>
                </div>
                <div className="progress-wrap" style={{ marginTop: 6 }}>
                  <div className="progress-bar" style={{ width: pct + '%', background: barColor }} />
                </div>
                <div className="goal-sub">
                  {over
                    ? `Over by ${fmt(spent - goal)}`
                    : `${fmt(goal - spent)} remaining`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
