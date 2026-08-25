"use client";

import Spinner from "@/components/Spinner";

const HEADERS = [
  "Overall exposure",
  "What is driving the score",
  "Compounding risks",
  "Priority actions",
  "Indicators to watch",
  "Information to confirm",
];

function cleanHeader(line) {
  return line.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p.replace(/^#+\s*/, "")}</span>
    )
  );
}

export default function MemoPanel({ memo, loading, error, onGenerate, onCopy }) {
  const lines = memo ? memo.split("\n").map((l) => l.trim()).filter(Boolean) : [];
  const body = lines.length && /^risk memo/i.test(cleanHeader(lines[0])) ? lines.slice(1) : lines;

  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="eyebrow">Leadership memo</p>
        <div className="flex items-center gap-2">
          {memo && !loading && (
            <button type="button" className="btn-ghost" onClick={onCopy}>
              Copy memo
            </button>
          )}
          <button type="button" className="btn-ghost" onClick={onGenerate} disabled={loading}>
            {loading && <Spinner />}
            {loading ? "Writing" : memo ? "Regenerate" : "Generate memo"}
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

      {loading && (
        <div className="flex items-center gap-3 py-6 text-ink-3">
          <Spinner large />
          <div>
            <p className="text-[13px] text-ink-2">Reading the register and drafting the memo</p>
            <p className="text-[11.5px]">Usually 10 to 20 seconds</p>
          </div>
        </div>
      )}

      {memo && !loading && (
        <div style={{ maxWidth: 720 }}>
          {body.map((raw, i) => {
            const h = cleanHeader(raw);
            const isHeader = HEADERS.some((x) => h.toLowerCase().startsWith(x.toLowerCase()));
            const isConfirm = isHeader && /^information to confirm/i.test(h);
            return isHeader ? (
              <p
                key={i}
                className="eyebrow mb-1.5 mt-5 first:mt-0"
                style={isConfirm ? { color: "var(--risk-med)" } : undefined}
              >
                {h}
              </p>
            ) : (
              <p key={i} className="mb-2.5 text-[13.5px] leading-relaxed text-ink-2">
                {renderInline(raw)}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}