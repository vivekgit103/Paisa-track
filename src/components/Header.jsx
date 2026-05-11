import React, { useState, useEffect } from 'react';
import { useExpense } from '../context/ExpenseContext';

export default function Header() {
  const { state, dispatch } = useExpense();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    }));
  }, []);

  return (
    <header className="header">
      <div className="logo">
        Paisa<span>Track</span> 🪙
      </div>
      <div className="header-right">
        <div className="date-pill">{dateStr}</div>
        <button
          className="theme-toggle"
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          title="Toggle theme"
        >
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
