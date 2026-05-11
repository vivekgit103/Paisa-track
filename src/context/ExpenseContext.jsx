import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ── CATEGORY CONFIG ──
export const CAT = {
  food:       { icon: '🍔', color: '#ff9f43', label: 'Food'       },
  travel:     { icon: '🛺', color: '#4ecdc4', label: 'Travel'     },
  stationary: { icon: '📚', color: '#a78bfa', label: 'Stationary' },
  snacks:     { icon: '🍟', color: '#ff6b9d', label: 'Snacks'     },
  entertainment: { icon: '🎬', color: '#74b9ff', label: 'Entertainment' },
  other:      { icon: '📦', color: '#b2bec3', label: 'Other'      },
};

// ── INITIAL STATE ──
const loadState = () => ({
  expenses:   JSON.parse(localStorage.getItem('pt_expenses')   || '[]'),
  budget:     parseFloat(localStorage.getItem('pt_budget')     || '0'),
  goals:      JSON.parse(localStorage.getItem('pt_goals')      || '{}'),
  recurring:  JSON.parse(localStorage.getItem('pt_recurring')  || '[]'),
  splits:     JSON.parse(localStorage.getItem('pt_splits')     || '[]'),
  theme:      localStorage.getItem('pt_theme')                 || 'dark',
});

// ── REDUCER ──
function reducer(state, action) {
  switch (action.type) {

    case 'ADD_EXPENSE': {
      const updated = [action.payload, ...state.expenses];
      return { ...state, expenses: updated };
    }

    case 'DELETE_EXPENSE': {
      const updated = state.expenses.filter(e => e.id !== action.payload);
      return { ...state, expenses: updated };
    }

    case 'CLEAR_ALL':
      return { ...state, expenses: [] };

    case 'SET_BUDGET':
      return { ...state, budget: action.payload };

    case 'SET_GOAL': {
      const goals = { ...state.goals, [action.payload.cat]: action.payload.amount };
      return { ...state, goals };
    }

    case 'ADD_RECURRING': {
      const updated = [action.payload, ...state.recurring];
      return { ...state, recurring: updated };
    }

    case 'DELETE_RECURRING': {
      const updated = state.recurring.filter(r => r.id !== action.payload);
      return { ...state, recurring: updated };
    }

    case 'ADD_SPLIT': {
      const updated = [action.payload, ...state.splits];
      return { ...state, splits: updated };
    }

    case 'SETTLE_SPLIT': {
      const updated = state.splits.map(s =>
        s.id === action.payload ? { ...s, settled: true } : s
      );
      return { ...state, splits: updated };
    }

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' };

    default:
      return state;
  }
}

// ── CONTEXT ──
const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    localStorage.setItem('pt_expenses',  JSON.stringify(state.expenses));
    localStorage.setItem('pt_budget',    String(state.budget));
    localStorage.setItem('pt_goals',     JSON.stringify(state.goals));
    localStorage.setItem('pt_recurring', JSON.stringify(state.recurring));
    localStorage.setItem('pt_splits',    JSON.stringify(state.splits));
    localStorage.setItem('pt_theme',     state.theme);
  }, [state]);

  // Apply theme class to body
  useEffect(() => {
    document.body.className = state.theme === 'light' ? 'light-theme' : '';
  }, [state.theme]);

  // Auto-apply recurring expenses at month start
  useEffect(() => {
    const today = new Date();
    if (today.getDate() !== 1) return;
    const monthKey = `${today.getFullYear()}-${today.getMonth()}`;
    if (localStorage.getItem('pt_recurring_applied') === monthKey) return;

    state.recurring.forEach(r => {
      dispatch({
        type: 'ADD_EXPENSE',
        payload: {
          id: Date.now() + Math.random(),
          name: r.name + ' (Auto)',
          amt: r.amt,
          cat: r.cat,
          date: new Date().toISOString(),
          isRecurring: true,
        },
      });
    });
    localStorage.setItem('pt_recurring_applied', monthKey);
  }, [state.recurring]);

  // ── HELPER FUNCTIONS ──
  const now = () => new Date();

  const sameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

  const sameWeek = (d) => {
    const today = now();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    return d >= monday;
  };

  const sameMonth = (d) => {
    const t = now();
    return d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  };

  const fmt = (n) => '₹' + Number(n).toFixed(0);

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60)    return 'just now';
    if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const monthExpenses = state.expenses.filter(e => sameMonth(new Date(e.date)));
  const monthSpent    = monthExpenses.reduce((s, e) => s + e.amt, 0);
  const todaySpent    = state.expenses.filter(e => sameDay(new Date(e.date), now())).reduce((s, e) => s + e.amt, 0);
  const weekSpent     = state.expenses.filter(e => sameWeek(new Date(e.date))).reduce((s, e) => s + e.amt, 0);

  const catTotals = Object.keys(CAT).reduce((acc, k) => {
    acc[k] = monthExpenses.filter(e => e.cat === k).reduce((s, e) => s + e.amt, 0);
    return acc;
  }, {});

  return (
    <ExpenseContext.Provider value={{
      state, dispatch,
      now, sameDay, sameWeek, sameMonth,
      fmt, timeAgo,
      monthSpent, todaySpent, weekSpent,
      catTotals, monthExpenses,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpense = () => useContext(ExpenseContext);
