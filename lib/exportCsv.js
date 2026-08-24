function esc(v) {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  
  export function risksToCsv(risks, ctx) {
    const header = [
      "ID", "Title", "Category", "Owner", "Status", "Phases",
      "Base L", "Base I", "Likelihood", "Impact", "Score", "Level",
      "Drivers", "Mitigation 1", "Mitigation 2", "Mitigation 3", "KRI", "Control type",
    ];
    const rows = risks.map((r) => [
      r.id, r.title, r.categoryName, r.owner, r.status, r.phases.join("; "),
      r.baseLikelihood, r.baseImpact, r.likelihood, r.impact, r.score, r.level,
      r.firedTriggers.map((t) => t.note).join("; "),
      r.mitigations[0] || "", r.mitigations[1] || "", r.mitigations[2] || "",
      r.kri, r.controlType,
    ]);
    const meta = [
      [`Project`, ctx.name || "Untitled"],
      [`State`, ctx.state.name],
      [`Capacity MW`, ctx.capacityMW],
      [`Phase`, ctx.phase],
      [`Exported`, new Date().toISOString().slice(0, 10)],
      [],
    ];
    return [...meta, header, ...rows].map((row) => row.map(esc).join(",")).join("\n");
  }
  
  export function downloadText(filename, text, mime = "text/csv;charset=utf-8") {
    const blob = new Blob(["\ufeff" + text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }