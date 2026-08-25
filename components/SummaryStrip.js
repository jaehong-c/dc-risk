export function verdictFor(summary) {
    const avg = summary.avgScore;
    const crit = summary.byLevel.critical;
    if (crit >= 3 || avg >= 12) {
      return {
        label: "Elevated",
        color: "var(--risk-high)",
        note: "Multiple critical items or average in the High band. Leadership attention required.",
      };
    }
    if (avg >= 8 || crit >= 1) {
      return {
        label: "Moderate",
        color: "var(--risk-med)",
        note: "Typical for a project at this stage. Manage through the register cadence.",
      };
    }
    return {
      label: "Contained",
      color: "var(--risk-low)",
      note: "Exposure within normal operating range. Monitor KRIs.",
    };
  }
  
  export default function SummaryStrip({ summary, ctx }) {
    const cells = [
      ["Critical", summary.byLevel.critical, "var(--risk-crit)", "16 to 25"],
      ["High", summary.byLevel.high, "var(--risk-high)", "10 to 15"],
      ["Medium", summary.byLevel.medium, "var(--risk-med)", "5 to 9"],
      ["Low", summary.byLevel.low, "var(--risk-low)", "1 to 4"],
    ];
  
    const cell = { padding: "16px 20px", borderLeft: "1px solid var(--line)" };
  
    const m = ctx.monthsToCOD;
    const codLabel =
      m == null ? "COD not set" : m >= 0 ? `${m} mo to COD` : `${Math.abs(m)} mo since COD`;
  
    const v = verdictFor(summary);
  
    return (
      <div className="panel">
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.3fr repeat(4, 1fr) 1fr" }}>
          <div style={{ ...cell, borderLeft: "none" }}>
            <p className="eyebrow">Overall</p>
            <p className="display mt-1 text-[26px] leading-none" style={{ color: v.color }}>
              {v.label}
            </p>
            <p className="mt-1.5 text-[11px] text-ink-3">{codLabel}</p>
          </div>
          <div style={cell}>
            <p className="eyebrow">Avg score</p>
            <p className="mono mt-1 text-[28px] leading-none">
              {summary.avgScore}
              <span className="text-[13px] text-ink-3"> / 25</span>
            </p>
            <p className="mt-1.5 text-[11px] text-ink-3">
              {summary.active} active · {summary.upcoming} upcoming · {summary.retired} retired
            </p>
          </div>
          {cells.map(([label, n, color, range]) => (
            <div key={label} style={cell}>
              <p className="eyebrow">{label}</p>
              <p className="mono mt-1 text-[28px] leading-none" style={{ color }}>
                {n}
              </p>
              <p className="mono mt-1.5 text-[10.5px] text-ink-3">{range}</p>
            </div>
          ))}
          <div style={cell}>
            <p className="eyebrow">Unverified</p>
            <p
              className="mono mt-1 text-[28px] leading-none"
              style={{ color: summary.unverified ? "var(--risk-med)" : "var(--ink-3)" }}
            >
              {summary.unverified}
            </p>
            <p className="mt-1.5 text-[11px] text-ink-3">unknown inputs</p>
          </div>
        </div>
  
        <div
          className="flex items-center justify-between border-t border-line px-5 py-2.5 text-[11px] text-ink-3"
        >
          <span>
            Score = likelihood (1 to 5) × impact (1 to 5), max 25. Overall reads Elevated at 3+
            critical or average 12+, Moderate at average 8+ or any critical, otherwise Contained.
          </span>
          <span className="text-ink-2">{v.note}</span>
        </div>
      </div>
    );
  }