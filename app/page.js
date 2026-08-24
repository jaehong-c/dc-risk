"use client";

import { useState } from "react";
import ProfileForm from "@/components/ProfileForm";
import SummaryStrip from "@/components/SummaryStrip";
import HeatMatrix from "@/components/HeatMatrix";
import RegisterTable from "@/components/RegisterTable";
import { EMPTY_PROFILE, PRESETS } from "@/lib/presets";

export default function Home() {
  const [profile, setProfile] = useState(PRESETS[0].profile);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);

  async function run() {
    setRunning(true);
    setError(null);
    setSelectedCell(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error(`Scoring failed (${res.status})`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
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
            <div className="panel px-5 py-3 text-[13px]" style={{ borderColor: "var(--risk-high)", color: "var(--risk-high)" }}>
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
                  72 lifecycle risks are evaluated against the profile. Load a sample to start.
                </p>
              </div>
            </div>
          ) : (
            <>
              <SummaryStrip summary={result.summary} ctx={result.ctx} />

              <div className="panel p-5">
                <div className="mb-4 flex items-baseline justify-between">
                  <p className="eyebrow">Heat matrix · active risks</p>
                  <p className="mono text-[11px] text-ink-3">Click a cell to filter the register</p>
                </div>
                <HeatMatrix
                  matrix={result.matrix}
                  selected={selectedCell}
                  onSelect={setSelectedCell}
                  top={result.summary.top}
                />
              </div>

              <div className="panel p-5">
                <p className="eyebrow mb-4">Register</p>
                <RegisterTable risks={result.risks} selectedCell={selectedCell} />
              </div>
            </>
          )}
        </section>
      </div>

      <footer className="mx-auto max-w-[1440px] px-6 pb-8 pt-2 text-[11px] text-ink-3">
        Risk library and state ratings are curated by the author for this prototype and are not
        sourced from proprietary company data. Scores are rule-based; replace with project-specific
        assessments for production use.
      </footer>
    </main>
  );
}