import React, { useMemo } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

export default function SmartInsights() {
  const { state, catTotals, monthSpent, fmt, sameDay, now } = useExpense();

  const insights = useMemo(() => {
    const tips = [];
    const expenses = state.expenses;
    if (expenses.length === 0) return tips;

    // 1. Top spending category
    const topCat = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCat && topCat[1] > 0) {
      const pct = ((topCat[1] / monthSpent) * 100).toFixed(0);
      tips.push({
        icon: CAT[topCat[0]].icon,
        text: `You spend ${pct}% of your monthly budget on ${CAT[topCat[0]].label}.`,
        type: pct > 40 ? 'warn' : 'info',
      });
    }

    // 2. Weekend vs weekday spending
    const weekendExp = expenses.filter(e => {
      const d = new Date(e.date).getDay();
      return d === 0 || d === 6;
    });
    const weekdayExp = expenses.filter(e => {
      const d = new Date(e.date).getDay();
      return d > 0 && d < 6;
    });

    const avgWeekend = weekendExp.length
      ? weekendExp.reduce((s, e) => s + e.amt, 0) / weekendExp.length : 0;
    const avgWeekday = weekdayExp.length
      ? weekdayExp.reduce((s, e) => s + e.amt, 0) / weekdayExp.length : 0;

    if (avgWeekend > avgWeekday * 1.3 && weekendExp.length >= 2) {
      tips.push({
        icon: '📅',
        text: `Your weekend spending (avg ${fmt(avgWeekend)}) is higher than weekdays (avg ${fmt(avgWeekday)}).`,
        type: 'warn',
      });
    }

    // 3. Most frequent expense
    const nameCounts = {};
    expenses.forEach(e => { nameCounts[e.name] = (nameCounts[e.name] || 0) + 1; });
    const topName = Object.entries(nameCounts).sort((a, b) => b[1] - a[1])[0];
    if (topName && topName[1] >= 3) {
      tips.push({
        icon: '🔍',
        text: `"${topName[0]}" is your most frequent expense — logged ${topName[1]} times.`,
        type: 'info',
      });
    }

    // 4. Today's spending summary
    const todayAmt = expenses
      .filter(e => sameDay(new Date(e.date), now()))
      .reduce((s, e) => s + e.amt, 0);
    if (todayAmt > 0) {
      tips.push({
        icon: '📆',
        text: `You've spent ${fmt(todayAmt)} today across ${expenses.filter(e => sameDay(new Date(e.date), now())).length} transactions.`,
        type: 'info',
      });
    }

    // 5. Budget health
    if (state.budget > 0) {
      const remaining = state.budget - monthSpent;
      const today = new Date();
      const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
      const dailyAllowance = remaining / (daysLeft || 1);
      tips.push({
        icon: '💡',
        text: `You have ${fmt(remaining)} left this month — that's about ${fmt(dailyAllowance)}/day for the next ${daysLeft} day(s).`,
        type: remaining < 0 ? 'danger' : 'success',
      });
    }

    // 6. Snack vs food
    const snackTotal = catTotals['snacks'] || 0;
    const foodTotal  = catTotals['food']   || 0;
    if (snackTotal > foodTotal && snackTotal > 0) {
      tips.push({
        icon: '🍟',
        text: `You spend more on Snacks (${fmt(snackTotal)}) than full meals (${fmt(foodTotal)}) this month!`,
        type: 'warn',
      });
    }

    return tips.slice(0, 5);
  }, [state.expenses, catTotals, monthSpent, state.budget]);

  const typeStyle = {
    info:    { border: '#4ecdc4', bg: '#4ecdc422', icon: '💬' },
    warn:    { border: '#ffa552', bg: '#ffa55222', icon: '⚠️' },
    danger:  { border: '#ff6b6b', bg: '#ff6b6b22', icon: '🚨' },
    success: { border: '#6bcb77', bg: '#6bcb7722', icon: '✅' },
  };

  return (
    <div className="section-box">
      <div className="section-title"><span>💡</span> Smart Insights</div>

      {insights.length === 0 ? (
        <p className="muted-text">
          Add more expenses to unlock personalized spending insights!
        </p>
      ) : (
        <div className="insights-list">
          {insights.map((ins, i) => {
            const s = typeStyle[ins.type] || typeStyle.info;
            return (
              <div
                className="insight-card"
                key={i}
                style={{ borderLeft: `3px solid ${s.border}`, background: s.bg }}
              >
                <span className="insight-icon">{ins.icon}</span>
                <span className="insight-text">{ins.text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
