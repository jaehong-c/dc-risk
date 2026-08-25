"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import SummaryStrip from "@/components/SummaryStrip";
import HeatMatrix from "@/components/HeatMatrix";
import DataGaps from "@/components/DataGaps";
import RegisterTable from "@/components/RegisterTable";
import MemoPanel from "@/components/MemoPanel";
import { EMPTY_PROFILE, PRESETS } from "@/lib/presets";
import { risksToCsv, downloadText } from "@/lib/exportCsv";

export default function Home() {
  const [profile, setProfile] = useState(PRESETS[0].profile);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  const [memo, setMemo] = useState("");
  const [memoLoading, setMemoLoading] = useState(false);
  const [memoError, setMemoError] = useState(null);

  async function run() {
    setRunning(true);
    setError(null);
    setSelectedCell(null);
    setMemo("");
    setMemoError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`Scoring failed (${res.status})`);
      const data = await res.json();
      setResult(data);
      generateMemoFor(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  }

  async function generateMemoFor(data) {
    setMemoLoading(true);
    setMemoError(null);
    try {
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Memo failed (${res.status})`);
      setMemo(json.memo);
    } catch (e) {
      setMemoError(e.message);
    } finally {
      setMemoLoading(false);
    }
  }

  function generateMemo() {
    if (result) generateMemoFor(result);
  }

  function exportRows(rows) {
    const slug = (result.ctx.name || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    downloadText(`${slug}-risk-register.csv`, risksToCsv(rows, result.ctx));
  }

  async function copyMemo() {
    try {
      await navigator.clipboard.writeText(memo);
    } catch {}
  }

  return (
    <main className="min-h-screen">
      <header className="h-14 border-b border-line bg-surface">
        <div
          className="mx-auto h-full max-w-[1440px] px-6"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          <div className="flex items-baseline gap-3">
            <span className="display text-[15px]">DC Risk Register</span>
            <span className="eyebrow">Lifecycle risk · v0.1</span>
          </div>
          <div className="flex items-center" style={{ gap: 24 }}>
            {result && (
              <span className="mono text-[11px] text-ink-2">
                {result.ctx.name || "Untitled"} · {result.ctx.state.name} ·{" "}
                {result.ctx.capacityMW} MW · {result.ctx.phase.replace("_", " ")}
              </span>
            )}
            <span className="mono text-[11px] text-ink-3">Prototype · curated risk library</span>
          </div>
        </div>
      </header>

      <div
        className="mx-auto max-w-[1440px] px-6 py-6"
        style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}
      >
        <aside
          className="panel p-5"
          style={{ position: "sticky", top: 24, maxHeight: "calc(100vh - 48px)", overflowY: "auto" }}
        >
          <p className="eyebrow mb-4">Project profile</p>
          <ProfileForm
            profile={profile}
            onChange={setProfile}
            onLoadPreset={(p) => setProfile({ ...EMPTY_PROFILE, ...p })}
            onRun={run}
            running={running}
          />
        </aside>

        <section className="flex flex-col gap-5">
          {error && (
            <div
              className="panel px-5 py-3 text-[13px]"
              style={{ borderColor: "var(--risk-high)", color: "var(--risk-high)" }}
            >
              {error}
            </div>
          )}

          {!result ? (
            <div
              className="panel text-center"
              style={{ minHeight: 420, display: "grid", placeItems: "center" }}
            >
              <div>
                <p className="display text-[20px]">Run the register to score this project.</p>
                <p className="mt-2 text-[13px] text-ink-2">
                  72 lifecycle risks are evaluated against the profile. Load a sample or start blank.
                </p>
              </div>
            </div>
          ) : (
            <>
              <SummaryStrip summary={result.summary} ctx={result.ctx} />

              <div className="panel p-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="eyebrow">Heat matrix · active risks</p>
                  <p className="mono text-[11px] text-ink-3">
                    Click a cell to filter the register · ? marks scores with unknown inputs
                  </p>
                </div>
                <HeatMatrix
                  matrix={result.matrix}
                  selected={selectedCell}
                  onSelect={setSelectedCell}
                  top={result.summary.top}
                />
              </div>

              <DataGaps dataGaps={result.summary.dataGaps} risks={result.risks} />

              <MemoPanel
                memo={memo}
                loading={memoLoading}
                error={memoError}
                onGenerate={generateMemo}
                onCopy={copyMemo}
              />

              <div className="panel p-5">
                <p className="eyebrow mb-4">Register</p>
                <RegisterTable
                  risks={result.risks}
                  selectedCell={selectedCell}
                  onExport={exportRows}
                />
              </div>
            </>
          )}
        </section>
      </div>

      <footer className="mx-auto max-w-[1440px] px-6 pb-8 pt-2 text-[11px] text-ink-3">
        <p>
          Risk library and state ratings are curated by the author for this prototype and are not
          sourced from proprietary company data. Scores are rule-based; replace with project-specific
          assessments for production use.
        </p>
        <p className="mt-2">© 2026 Jae Chung. All rights reserved.</p>
      </footer>
    </main>
  );
}