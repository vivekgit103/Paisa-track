import React, { useEffect, useRef } from 'react';
import { useExpense, CAT } from '../context/ExpenseContext';

export default function Charts() {
  const { catTotals, fmt, state, sameMonth } = useExpense();
  const donutRef = useRef(null);

  const maxCat = Math.max(...Object.values(catTotals), 1);

  // Draw donut chart on canvas
  useEffect(() => {
    const canvas = donutRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 120; canvas.height = 120;
    ctx.clearRect(0, 0, 120, 120);

    const total = Object.values(catTotals).reduce((s, v) => s + v, 0);

    if (total === 0) {
      ctx.beginPath();
      ctx.arc(60, 60, 46, 0, Math.PI * 2);
      ctx.strokeStyle = '#2e2e3e';
      ctx.lineWidth = 18;
      ctx.stroke();
      return;
    }

    let start = -Math.PI / 2;
    Object.entries(CAT).forEach(([key, cfg]) => {
      const val = catTotals[key] || 0;
      if (!val) return;
      const sweep = (val / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(60, 60, 46, start, start + sweep);
      ctx.strokeStyle = cfg.color;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.stroke();
      start += sweep + 0.03;
    });

    ctx.fillStyle = '#f0eeff';
    ctx.font = "bold 13px 'Baloo 2', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(fmt(total), 60, 64);
  }, [catTotals, fmt]);

  // Build 7-day bars data
  const dayColors = ['#4ecdc4','#f7c948','#a78bfa','#ff9f43','#ff6b9d','#74b9ff','#6bcb77'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i); start.setHours(0,0,0,0);
    const end   = new Date(start); end.setDate(start.getDate() + 1);
    const total = state.expenses
      .filter(e => { const d = new Date(e.date); return d >= start && d < end; })
      .reduce((s, e) => s + e.amt, 0);
    const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    days.push({ label: i === 0 ? 'Today' : names[start.getDay()], total });
  }
  const maxDay = Math.max(...days.map(d => d.total), 1);

  const totalCatSpend = Object.values(catTotals).reduce((s, v) => s + v, 0);

  return (
    <div className="section-box">
      <div className="section-title"><span>📊</span> Spending Insights</div>

      <div className="chart-grid">

        {/* Category Bars */}
        <div className="chart-box">
          <h3 className="chart-title">By Category</h3>
          <div className="bar-chart">
            {Object.entries(CAT).map(([key, cfg]) => {
              const pct = ((catTotals[key] || 0) / maxCat) * 100;
              return (
                <div className="bar-row" key={key}>
                  <div className="bar-label">{cfg.icon} {cfg.label}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: pct + '%', background: cfg.color }} />
                  </div>
                  <div className="bar-val">{fmt(catTotals[key] || 0)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Donut */}
        <div className="chart-box">
          <h3 className="chart-title">Category Split</h3>
          <div className="donut-wrap">
            <canvas ref={donutRef} width="120" height="120" />
            <div className="legend">
              {totalCatSpend === 0
                ? <span className="muted-text">No data yet</span>
                : Object.entries(CAT)
                    .filter(([k]) => catTotals[k] > 0)
                    .map(([k, cfg]) => (
                      <div className="legend-item" key={k}>
                        <div className="legend-dot" style={{ background: cfg.color }} />
                        <span>{cfg.label}: {fmt(catTotals[k])}</span>
                      </div>
                    ))
              }
            </div>
          </div>
        </div>

        {/* 7-Day Bars */}
        <div className="chart-box full-width">
          <h3 className="chart-title">Last 7 Days</h3>
          <div className="day-bars">
            {days.map((d, i) => {
              const height = Math.max((d.total / maxDay) * 68, d.total > 0 ? 6 : 4);
              return (
                <div className="day-col" key={i}>
                  <div
                    className="day-bar"
                    style={{
                      height: height + 'px',
                      background: dayColors[i],
                      opacity: d.total ? 1 : 0.2,
                    }}
                    title={`₹${d.total}`}
                  />
                  <div className="day-lbl">{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
