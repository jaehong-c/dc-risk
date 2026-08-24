"use client";

const HEADERS = [
  "Overall exposure",
  "What is driving the score",
  "Compounding risks",
  "Priority actions",
  "Indicators to watch",
];

function clean(line) {
  return line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
}

export default function MemoPanel({ memo, loading, error, onGenerate, onCopy }) {
  const lines = memo ? memo.split("\n").map(clean).filter(Boolean) : [];
  const titleIdx = lines.findIndex((l) => /^risk memo/i.test(l));
  const body = titleIdx === 0 ? lines.slice(1) : lines;

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow">Leadership memo</p>
        <div className="flex items-center gap-2">
          {memo && (
            <button type="button" className="btn-ghost" onClick={onCopy}>
              Copy memo
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={onGenerate} disabled={loading}>
            {loading ? "Writing…" : memo ? "Regenerate" : "Generate memo"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 text-[12.5px]" style={{ color: "var(--risk-high)" }}>
          {error}
        </p>
      )}

      {!memo && !loading && (
        <p className="text-[13px] text-ink-3">
          A one-page interpretation of the register for leadership. The AI does not re-score; it
          reads the rule-based results and explains what matters.
        </p>
      )}

      {loading && <p className="text-[13px] text-ink-3">Reading the register and drafting…</p>}

      {memo && !loading && (
        <div style={{ maxWidth: 720 }}>
          {body.map((t, i) => {
            const isHeader = HEADERS.some((h) => t.toLowerCase().startsWith(h.toLowerCase()));
            return isHeader ? (
              <p key={i} className="eyebrow mb-1.5 mt-5 first:mt-0">
                {t}
              </p>
            ) : (
              <p key={i} className="mb-2.5 text-[13.5px] leading-relaxed text-ink">
                {t}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}