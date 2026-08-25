"use client";

import { useState } from "react";
import { CATEGORIES } from "@/lib/scoring";
import { FIELD_LABELS } from "@/lib/presets";

const CHIP = { low: "chip-low", medium: "chip-med", high: "chip-high", critical: "chip-crit" };
const STATUS_LABEL = { active: "Active", upcoming: "Upcoming", retired: "Retired" };

export default function RegisterTable({ risks, selectedCell, onExport }) {
  const [status, setStatus] = useState("active");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(null);

  const rows = risks.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    if (status === "unverified" && !r.unverified) return false;
    if (category !== "all" && r.category !== category) return false;
    if (selectedCell && (r.likelihood !== selectedCell.l || r.impact !== selectedCell.i)) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <select className="field-select" style={{ width: 170 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="unverified">Active, unverified</option>
          <option value="upcoming">Upcoming</option>
          <option value="retired">Retired</option>
          <option value="all">All statuses</option>
        </select>
        <select className="field-select" style={{ width: 240 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {Object.entries(CATEGORIES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {selectedCell && (
          <span className="mono text-[11px] text-ink-2">
            Filtered to L{selectedCell.l} × I{selectedCell.i}
          </span>
        )}
        <span className="mono ml-auto text-[11px] text-ink-3">{rows.length} rows</span>
        <button type="button" className="btn-ghost" onClick={() => onExport(rows)}>
          Export CSV
        </button>
      </div>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="border-b border-line-2 text-left">
            {["ID", "Risk", "Category", "Owner", "L", "I", "Score", "Level", "Status"].map((h) => (
              <th key={h} className="eyebrow py-2 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <RowGroup key={r.id} r={r} open={open === r.id} onToggle={() => setOpen(open === r.id ? null : r.id)} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="py-8 text-center text-ink-3">
                No risks match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function RowGroup({ r, open, onToggle }) {
  return (
    <>
      <tr className="cursor-pointer border-b border-line hover:bg-surface-2" onClick={onToggle}>
        <td className="mono py-2.5 pr-3 text-ink-2">{r.id}</td>
        <td className="py-2.5 pr-3">
          {r.title}
          {r.unverified && (
            <span className="mono ml-1.5 text-[10px]" style={{ color: "var(--risk-med)" }}>
              ?
            </span>
          )}
        </td>
        <td className="py-2.5 pr-3 text-ink-2">{r.categoryName}</td>
        <td className="py-2.5 pr-3 text-ink-2">{r.owner}</td>
        <td className="mono py-2.5 pr-3">{r.likelihood}</td>
        <td className="mono py-2.5 pr-3">{r.impact}</td>
        <td className="mono py-2.5 pr-3 font-medium">{r.score}</td>
        <td className="py-2.5 pr-3"><span className={`chip ${CHIP[r.level]}`}>{r.level}</span></td>
        <td className="py-2.5 text-ink-3">{STATUS_LABEL[r.status]}</td>
      </tr>
      {open && (
        <tr className="border-b border-line" style={{ background: "var(--surface-2)" }}>
          <td colSpan={9} className="px-4 py-4">
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 24 }} className="text-[12px]">
              <div>
                <p className="eyebrow mb-1.5">Description</p>
                <p className="text-ink-2">{r.description}</p>
                <p className="eyebrow mb-1.5 mt-4">Why this score</p>
                <p className="mono text-[11px] text-ink-2">
                  Base L{r.baseLikelihood} × I{r.baseImpact} = {r.baseScore}
                </p>
                {r.firedTriggers.length === 0 ? (
                  <p className="text-ink-3">No triggers fired.</p>
                ) : (
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {r.firedTriggers.map((t, i) => (
                      <li key={i} className="text-ink-2">
                        <span className="mono text-[11px]">
                          {t.likelihood ? `L${t.likelihood > 0 ? "+" : ""}${t.likelihood}` : ""}
                          {t.likelihood && t.impact ? " " : ""}
                          {t.impact ? `I${t.impact > 0 ? "+" : ""}${t.impact}` : ""}
                        </span>{" "}
                        {t.note}
                      </li>
                    ))}
                  </ul>
                )}
                {r.unverified && (
                  <p className="mt-2 text-[11.5px]" style={{ color: "var(--risk-med)" }}>
                    Unknown inputs: {r.unknownFields.map((f) => FIELD_LABELS[f] || f).join(", ")}.
                    Related triggers did not fire.
                  </p>
                )}
              </div>
              <div>
                <p className="eyebrow mb-1.5">Mitigations</p>
                <ul className="flex flex-col gap-1 text-ink-2">
                  {r.mitigations.map((m, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ink-3">–</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="eyebrow mb-1.5">Key risk indicator</p>
                <p className="text-ink-2">{r.kri}</p>
                <p className="eyebrow mb-1.5 mt-4">Control · phases</p>
                <p className="text-ink-2">
                  {r.controlType} · {r.phases.map((p) => p.replace("_", " ")).join(", ")}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}