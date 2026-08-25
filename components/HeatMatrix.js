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

const ROW_H = 56;
const GAP = 3;
const GRID_H = ROW_H * 5 + GAP * 4;

export default function HeatMatrix({ matrix, selected, onSelect, top }) {
  const isSel = (l, i) => selected && selected.l === l && selected.i === i;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 8, alignItems: "start" }}>
        {/* Impact title, rotated */}
        <div
          style={{
            height: GRID_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 16,
          }}
        >
          <span
            className="eyebrow whitespace-nowrap"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          >
            Impact
          </span>
        </div>

        {/* Y axis numbers */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: `repeat(5, ${ROW_H}px)`,
            gap: GAP,
            alignItems: "center",
            justifyItems: "end",
            paddingRight: 2,
          }}
        >
          {[5, 4, 3, 2, 1].map((i) => (
            <span key={i} className="mono text-[11px] text-ink-3">
              {i}
            </span>
          ))}
        </div>

        <div>
          {/* Cells */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gridTemplateRows: `repeat(5, ${ROW_H}px)`,
              gap: GAP,
            }}
          >
            {[5, 4, 3, 2, 1].map((i) =>
              [1, 2, 3, 4, 5].map((l) => {
                const ids = matrix[i - 1][l - 1];
                const lvl = levelFor(l * i);
                const sel = isSel(l, i);
                const dim = selected && !sel;
                return (
                  <button
                    key={`${i}-${l}`}
                    type="button"
                    onClick={() => onSelect(sel ? null : { l, i })}
                    className="mono flex items-center justify-center"
                    style={{
                      background: BG[lvl],
                      color: FG[lvl],
                      borderRadius: 3,
                      fontSize: 17,
                      fontWeight: 500,
                      opacity: dim ? 0.4 : 1,
                      boxShadow: sel ? "inset 0 0 0 2px var(--ink)" : "none",
                      cursor: "pointer",
                      transition: "opacity 120ms ease",
                    }}
                    aria-label={`Likelihood ${l}, impact ${i}, ${ids.length} risks`}
                  >
                    {ids.length || ""}
                  </button>
                );
              })
            )}
          </div>

          {/* X axis numbers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: GAP,
              marginTop: 6,
            }}
          >
            {[1, 2, 3, 4, 5].map((l) => (
              <span key={l} className="mono text-center text-[11px] text-ink-3">
                {l}
              </span>
            ))}
          </div>

          {/* X axis title */}
          <p className="eyebrow mt-2 text-center">Likelihood</p>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4">
            {[
              ["low", "Low 1–4"],
              ["medium", "Med 5–9"],
              ["high", "High 10–15"],
              ["critical", "Crit 16–25"],
            ].map(([k, label]) => (
              <span key={k} className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
                <span
                  style={{ width: 10, height: 10, borderRadius: 2, background: BG[k], display: "inline-block" }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-l border-line pl-6">
        <p className="eyebrow mb-3">Top exposures</p>
        <ol className="flex flex-col gap-2.5">
          {top.map((r) => (
            <li key={r.id} className="flex items-start gap-3">
              <span
                className="mono mt-0.5 w-6 shrink-0 text-right text-[13px] font-medium"
                style={{ color: LIST_FG[r.level] }}
              >
                {r.score}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] leading-tight">
                  {r.title}
                  {r.unverified && (
                    <span
                      className="mono ml-1.5 text-[10px]"
                      style={{ color: "var(--risk-med)" }}
                      title={`Depends on unknown input: ${r.unknownFields.join(", ")}`}
                    >
                      ?
                    </span>
                  )}
                </p>
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