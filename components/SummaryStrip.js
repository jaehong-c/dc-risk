export default function SummaryStrip({ summary, ctx }) {
    const cells = [
      ["Critical", summary.byLevel.critical, "var(--risk-crit)"],
      ["High", summary.byLevel.high, "var(--risk-high)"],
      ["Medium", summary.byLevel.medium, "var(--risk-med)"],
      ["Low", summary.byLevel.low, "var(--risk-low)"],
    ];
  
    const cell = { padding: "16px 20px", borderLeft: "1px solid var(--line)" };
  
    const m = ctx.monthsToCOD;
    const codLabel =
      m == null ? "No COD set" : m >= 0 ? `${m} mo to COD` : `${Math.abs(m)} mo since COD`;
  
    return (
      <div
        className="panel"
        style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4, 1fr) 1fr" }}
      >
        <div style={{ ...cell, borderLeft: "none" }}>
          <p className="eyebrow">Active risks</p>
          <p className="mono mt-1 text-[28px] leading-none">{summary.active}</p>
          <p className="mt-1.5 text-[11px] text-ink-3">
            {summary.upcoming} upcoming · {summary.retired} retired
          </p>
        </div>
        {cells.map(([label, n, color]) => (
          <div key={label} style={cell}>
            <p className="eyebrow">{label}</p>
            <p className="mono mt-1 text-[28px] leading-none" style={{ color }}>
              {n}
            </p>
          </div>
        ))}
        <div style={cell}>
          <p className="eyebrow">Avg score</p>
          <p className="mono mt-1 text-[28px] leading-none">{summary.avgScore}</p>
          <p className="mt-1.5 text-[11px] text-ink-3">{codLabel}</p>
        </div>
      </div>
    );
  }