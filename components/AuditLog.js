"use client";

export default function AuditLog({ log, onClear }) {
  if (!log.length) return null;
  const fmt = (iso) => iso.replace("T", " ").slice(0, 16);

  return (
    <div className="panel p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="eyebrow">Audit log · manual overrides</p>
        <div className="flex items-center gap-3">
          <span className="mono text-[11px] text-ink-3">{log.length} entries</span>
          <button type="button" className="btn-ghost" onClick={onClear}>
            Clear all overrides
          </button>
        </div>
      </div>
      <table className="w-full border-collapse text-[12px]">
        <thead>
          <tr className="border-b border-line-2 text-left">
            {["When", "By", "Risk", "Action", "From", "To", "Reason"].map((h) => (
              <th key={h} className="eyebrow py-2 pr-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...log].reverse().map((e, i) => (
            <tr key={i} className="border-b border-line">
              <td className="mono py-2 pr-3 text-ink-3">{fmt(e.at)}</td>
              <td className="py-2 pr-3 text-ink-2">{e.by}</td>
              <td className="mono py-2 pr-3">{e.riskId}</td>
              <td className="py-2 pr-3 text-ink-2">{e.action}</td>
              <td className="mono py-2 pr-3 text-ink-2">
                {e.from ? `L${e.from.likelihood} × I${e.from.impact} = ${e.from.likelihood * e.from.impact}` : ""}
              </td>
              <td className="mono py-2 pr-3">
                {e.to ? `L${e.to.likelihood} × I${e.to.impact} = ${e.to.likelihood * e.to.impact}` : ""}
              </td>
              <td className="py-2 text-ink-2">{e.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}