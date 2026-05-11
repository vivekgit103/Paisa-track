import React from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

export default function ExportSummary({ onToast }) {
  const { state, catTotals, monthSpent, fmt, sameMonth } = useExpense();

  const exportCSV = () => {
    const monthExp = state.expenses.filter(e => sameMonth(new Date(e.date)));
    if (monthExp.length === 0) { onToast('No expenses to export!', '⚠️'); return; }

    const rows = [
      ['Date', 'Name', 'Category', 'Amount (₹)'],
      ...monthExp.map(e => [
        new Date(e.date).toLocaleDateString('en-IN'),
        e.name,
        CAT[e.cat]?.label || e.cat,
        e.amt,
      ]),
      [],
      ['Category Summary', '', '', ''],
      ...Object.entries(catTotals)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => [CAT[k].label, '', '', v]),
      [],
      ['Total Spent', '', '', monthSpent],
      state.budget > 0 ? ['Budget', '', '', state.budget] : [],
      state.budget > 0 ? ['Remaining', '', '', state.budget - monthSpent] : [],
    ].filter(r => r.length > 0);

    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const month = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    a.href     = url;
    a.download = `PaisaTrack_${month.replace(' ', '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Monthly report exported!', '📥');
  };

  const monthExp  = state.expenses.filter(e => sameMonth(new Date(e.date)));
  const topCatKey = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="section-box">
      <div className="section-title"><span>📥</span> Monthly Export</div>

      <div className="export-summary">
        <div className="export-stat">
          <div className="export-stat-val">{monthExp.length}</div>
          <div className="export-stat-label">Transactions</div>
        </div>
        <div className="export-stat">
          <div className="export-stat-val">{fmt(monthSpent)}</div>
          <div className="export-stat-label">Total Spent</div>
        </div>
        <div className="export-stat">
          <div className="export-stat-val">
            {topCatKey ? CAT[topCatKey].icon + ' ' + CAT[topCatKey].label : '—'}
          </div>
          <div className="export-stat-label">Top Category</div>
        </div>
      </div>

      <button className="btn-export" onClick={exportCSV}>
        📥 Download CSV Report
      </button>
      <p className="muted-text" style={{ marginTop: 8, fontSize: '0.75rem' }}>
        Downloads a spreadsheet of all this month's expenses — open in Excel or Google Sheets.
      </p>
    </div>
  );
}
