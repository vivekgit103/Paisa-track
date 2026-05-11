import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';

export default function BudgetBanner() {
  const { state, dispatch, fmt, monthSpent } = useExpense();
  const [inputVal, setInputVal] = useState(state.budget > 0 ? state.budget : '');

  const setBudget = () => {
    const val = parseFloat(inputVal);
    if (!val || val <= 0) return;
    dispatch({ type: 'SET_BUDGET', payload: val });
  };

  const remaining = state.budget - monthSpent;
  const pct = state.budget > 0 ? Math.min((monthSpent / state.budget) * 100, 100) : 0;
  const barColor = pct >= 100 ? '#ff6b6b' : pct >= 80 ? '#ffa552' : '#4ecdc4';

  return (
    <div className="budget-banner">
      <div className="budget-info">
        <h2 className="budget-label">Monthly Budget Remaining</h2>
        <div className="budget-amount">
          {state.budget > 0
            ? <>{fmt(Math.max(remaining, 0))} <span>/ {fmt(state.budget)}</span></>
            : <>₹0 <span>/ set budget</span></>
          }
        </div>

        <div className="progress-wrap">
          <div
            className="progress-bar"
            style={{ width: pct + '%', background: barColor }}
          />
        </div>

        <div className="progress-labels">
          <span>Spent: {fmt(monthSpent)}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {state.budget > 0 && pct >= 80 && (
              <span className="warn-badge">⚠ {pct >= 100 ? 'BUDGET OVER!' : '80% SPENT'}</span>
            )}
            <span>{pct.toFixed(0)}%</span>
          </span>
        </div>
      </div>

      <div className="budget-set">
        <input
          type="number"
          placeholder="Set budget ₹"
          value={inputVal}
          min="0"
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setBudget()}
        />
        <button className="btn-set" onClick={setBudget}>Set</button>
      </div>
    </div>
  );
}
