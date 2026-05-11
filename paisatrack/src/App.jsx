import React, { useState, useCallback } from 'react';
import { ExpenseProvider } from './context/ExpenseContext';
import Header            from './components/Header';
import BudgetBanner      from './components/BudgetBanner';
import StatsRow          from './components/StatsRow';
import QuickAdd          from './components/QuickAdd';
import TransactionList   from './components/TransactionList';
import Charts            from './components/Charts';
import SpendingGoals     from './components/SpendingGoals';
import RecurringExpenses from './components/RecurringExpenses';
import SplitExpense      from './components/SplitExpense';
import SmartInsights     from './components/SmartInsights';
import ExportSummary     from './components/ExportSummary';
import Toast             from './components/Toast';

function AppInner() {
  const [toast, setToast] = useState({ msg: '', emoji: '', visible: false });
  const timerRef = React.useRef(null);

  const showToast = useCallback((msg, emoji = '✅') => {
    clearTimeout(timerRef.current);
    setToast({ msg, emoji, visible: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  }, []);

  return (
    <div className="app">
      <Header />
      <BudgetBanner />
      <StatsRow />
      <QuickAdd          onToast={showToast} />
      <TransactionList   onToast={showToast} />
      <Charts />
      <SpendingGoals />
      <RecurringExpenses onToast={showToast} />
      <SplitExpense      onToast={showToast} />
      <SmartInsights />
      <ExportSummary     onToast={showToast} />
      <Toast message={toast.msg} emoji={toast.emoji} visible={toast.visible} />
    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppInner />
    </ExpenseProvider>
  );
}
