"use client";

import { levelFor } from "@/lib/scoring";

const BG = {
  low: "var(--risk-low-bg)",
  medium: "var(--risk-med-bg)",
  high: "var(--risk-high-bg)",
  critical: "var(--risk-crit)",
};
const FG = {
  low: "var(--risk-low)",
  medium: "var(--risk-med)",
  high: "var(--risk-high)",
  critical: "#fff",
};
const LIST_FG = {
  low: "var(--risk-low)",
  medium: "var(--risk-med)",
  high: "var(--risk-high)",
  critical: "var(--risk-crit)",
};

const ROW = { display: "grid", gridTemplateColumns: "20px repeat(5, 1fr)", gap: 4 };

export default function HeatMatrix({ matrix, selected, onSelect, top }) {
  const isSel = (l, i) => selected && selected.l === l && selected.i === i;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 8 }}>
        <div className="flex items-center justify-center">
          <span className="eyebrow whitespace-nowrap" style={{ transform: "rotate(-90deg)" }}>
            Impact
          </span>
        </div>

        <div>
          <div style={{ display: "grid", gridTemplateRows: "repeat(5, 52px)", gap: 4 }}>
            {[5, 4, 3, 2, 1].map((i) => (
              <div key={i} style={ROW}>
                <div className="mono flex items-center justify-center text-[11px] text-ink-3">
                  {i}
                </div>
                {[1, 2, 3, 4, 5].map((l) => {
                  const ids = matrix[i - 1][l - 1];
                  const lvl = levelFor(l * i);
                  const sel = isSel(l, i);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => onSelect(sel ? null : { l, i })}
                      className="relative flex items-center justify-center rounded-[3px]"
                      style={{
                        background: BG[lvl],
                        color: FG[lvl],
                        outline: sel ? "2px solid var(--ink)" : "none",
                        outlineOffset: 2,
                        opacity: selected && !sel ? 0.55 : 1,
                        cursor: "pointer",
                      }}
                      aria-label={`Likelihood ${l}, impact ${i}, ${ids.length} risks`}
                    >
                      <span className="mono text-[18px] font-medium">{ids.length || ""}</span>
                      <span className="mono absolute right-1.5 top-1 text-[9px]" style={{ opacity: 0.6 }}>
                        {l * i}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ ...ROW, marginTop: 6 }}>
            <div />
            {[1, 2, 3, 4, 5].map((l) => (
              <div key={l} className="mono text-center text-[11px] text-ink-3">
                {l}
              </div>
            ))}
          </div>
          <p className="eyebrow mt-2 text-center">Likelihood</p>
        </div>
      </div>

      <div className="border-l border-line pl-6">
        <p className="eyebrow mb-3">Top exposures</p>
        <ol className="flex flex-col gap-2">
          {top.map((r) => (
            <li key={r.id} className="flex items-start gap-3">
              <span
                className="mono mt-0.5 w-7 shrink-0 text-right text-[13px] font-medium"
                style={{ color: LIST_FG[r.level] }}
              >
                {r.score}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] leading-tight">{r.title}</p>
                <p className="mono text-[10.5px] text-ink-3">
                  {r.id} · L{r.likelihood} × I{r.impact}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}