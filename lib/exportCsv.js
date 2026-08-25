function esc(v) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function risksToCsv(risks, ctx, auditLog = []) {
  const header = [
    "ID", "Title", "Category", "Owner", "Status", "Phases",
    "Base L", "Base I", "Rule L", "Rule I", "Rule score",
    "Likelihood", "Impact", "Score", "Level",
    "Overridden", "Override reason", "Override by", "Override at",
    "Drivers", "Mitigation 1", "Mitigation 2", "Mitigation 3", "KRI", "Control type",
  ];
  const rows = risks.map((r) => [
    r.id, r.title, r.categoryName, r.owner, r.status, r.phases.join("; "),
    r.baseLikelihood, r.baseImpact, r.ruleLikelihood, r.ruleImpact, r.ruleScore,
    r.likelihood, r.impact, r.score, r.level,
    r.overridden ? "yes" : "no",
    r.override?.reason || "", r.override?.by || "", r.override?.at || "",
    r.firedTriggers.map((t) => t.note).join("; "),
    r.mitigations[0] || "", r.mitigations[1] || "", r.mitigations[2] || "",
    r.kri, r.controlType,
  ]);
  const meta = [
    ["Project", ctx.name || "Untitled"],
    ["State", ctx.state.name],
    ["Capacity MW", ctx.capacityMW],
    ["Phase", ctx.phase],
    ["Exported", new Date().toISOString().slice(0, 10)],
    [],
  ];
  const audit = auditLog.length
    ? [
        [],
        ["AUDIT LOG"],
        ["At", "By", "Risk", "Action", "From L", "From I", "To L", "To I", "Reason"],
        ...auditLog.map((e) => [
          e.at, e.by, e.riskId, e.action,
          e.from?.likelihood ?? "", e.from?.impact ?? "",
          e.to?.likelihood ?? "", e.to?.impact ?? "",
          e.reason || "",
        ]),
      ]
    : [];
  return [...meta, header, ...rows, ...audit].map((row) => row.map(esc).join(",")).join("\n");
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