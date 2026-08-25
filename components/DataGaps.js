"use client";

import { FIELD_LABELS } from "@/lib/presets";

export default function DataGaps({ dataGaps, risks }) {
  const entries = Object.entries(dataGaps);
  if (entries.length === 0) return null;

  const byId = Object.fromEntries(risks.map((r) => [r.id, r]));
  entries.sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="panel p-5" style={{ borderColor: "var(--risk-med)" }}>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="eyebrow" style={{ color: "var(--risk-med)" }}>
          Data gaps · confirm before relying on these scores
        </p>
        <p className="mono text-[11px] text-ink-3">
          {entries.length} unknown input{entries.length > 1 ? "s" : ""}
        </p>
      </div>
      <p className="mb-4 text-[12.5px] text-ink-2">
        Scores below use base values where an input is unknown. Triggers tied to these fields did
        not fire, so exposure may be understated. Confirm each item and re-run.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px 24px" }}>
        {entries.map(([field, ids]) => (
          <div key={field} className="flex gap-3 text-[12px]">
            <div className="w-[150px] shrink-0">
              <p className="font-medium">{FIELD_LABELS[field] || field}</p>
              <p className="mono text-[10.5px] text-ink-3">
                {ids.length} risk{ids.length > 1 ? "s" : ""} affected
              </p>
            </div>
            <p className="text-ink-2">
              {ids
                .slice(0, 6)
                .map((id) => byId[id]?.title || id)
                .join("; ")}
              {ids.length > 6 ? `; +${ids.length - 6} more` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}