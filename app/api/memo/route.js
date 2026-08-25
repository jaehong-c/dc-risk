import { NextResponse } from "next/server";

export const maxDuration = 60;

const FIELD_LABELS = {
  monthsToCOD: "Target COD",
  workloadType: "Workload",
  tenantStatus: "Tenant",
  landStatus: "Land control",
  permittingStatus: "Entitlements",
  taxIncentive: "Tax incentive",
  powerStatus: "Power",
  powerSource: "Power source",
  redundancy: "Redundancy",
  coolingType: "Cooling",
  waterSource: "Water source",
  contractType: "Contract type",
  gcStatus: "General contractor",
  longLeadStatus: "Long-lead equipment",
  financing: "Financing",
  insuranceStatus: "Insurance program",
  complianceStatus: "SOC 2 / ISO 27001",
  bcdrStatus: "BC/DR plan",
};

const show = (v) => (v === "unknown" || v === "" || v == null ? "UNKNOWN" : v);

function verdict(summary) {
  const avg = summary.avgScore;
  const crit = summary.byLevel.critical;
  if (crit >= 3 || avg >= 12) return "Elevated";
  if (avg >= 8 || crit >= 1) return "Moderate";
  return "Contained";
}

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }

  const { ctx, summary, risks } = await req.json();
  const active = risks.filter((r) => r.status === "active");
  const top = active.slice(0, 12);
  const overridden = active.filter((r) => r.overridden);

  const m = ctx.monthsToCOD;
  const codLine =
    m == null ? "UNKNOWN" : m >= 0 ? `${m} months to COD` : `${Math.abs(m)} months since COD`;

  const profileLines = [
    `Project: ${ctx.name || "Untitled"}`,
    `Location: ${ctx.state.name} (grid operator ${ctx.state.gridOperator})${ctx.locality ? ` · ${ctx.locality}` : ""}`,
    `Capacity: ${ctx.capacityMW} MW · Workload: ${show(ctx.workloadType)} · Tenant: ${show(ctx.tenantStatus)}`,
    `Phase: ${ctx.phase} · Timing: ${codLine}`,
    `Power: ${show(ctx.powerStatus)} (${show(ctx.powerSource)}) · Redundancy: ${show(ctx.redundancy)}`,
    `Cooling: ${show(ctx.coolingType)} · Water: ${show(ctx.waterSource)}`,
    `Land: ${show(ctx.landStatus)} · Entitlements: ${show(ctx.permittingStatus)} · Incentive: ${show(ctx.taxIncentive)}`,
    `Contract: ${show(ctx.contractType)} · GC: ${show(ctx.gcStatus)} · Long-lead: ${show(ctx.longLeadStatus)}`,
    `Financing: ${show(ctx.financing)} · Insurance: ${show(ctx.insuranceStatus)} · Compliance: ${show(ctx.complianceStatus)} · BC/DR: ${show(ctx.bcdrStatus)}`,
  ].join("\n");

  const summaryLines = [
    `Overall verdict from the register: ${verdict(summary)} (scale: score = likelihood x impact, 1 to 25; Low 1-4, Medium 5-9, High 10-15, Critical 16-25)`,
    `Active risks: ${summary.active} (critical ${summary.byLevel.critical}, high ${summary.byLevel.high}, medium ${summary.byLevel.medium}, low ${summary.byLevel.low})`,
    `Unverified scores (depend on unknown inputs): ${summary.unverified}`,
    `Manually overridden scores: ${overridden.length}`,
    `Average score: ${summary.avgScore} of 25`,
    `By category: ${Object.entries(summary.byCategory).map(([k, v]) => `${k} ${v}`).join(", ")}`,
  ].join("\n");

  const gapEntries = Object.entries(summary.dataGaps || {});
  const gapLines = gapEntries.length
    ? gapEntries
        .map(
          ([f, ids]) =>
            `${FIELD_LABELS[f] || f}: affects ${ids.length} active risks (${ids.slice(0, 5).join(", ")}${ids.length > 5 ? ", ..." : ""})`
        )
        .join("\n")
    : "None. All inputs confirmed.";

  const overrideLines = overridden.length
    ? overridden
        .map(
          (r) =>
            `${r.id} ${r.title}: rule L${r.ruleLikelihood} x I${r.ruleImpact} = ${r.ruleScore} → owner assessment L${r.likelihood} x I${r.impact} = ${r.score}. Reason: ${r.override?.reason || "not given"} (${r.override?.by || "unnamed"})`
        )
        .join("\n")
    : "None.";

  const riskLines = top
    .map(
      (r) =>
        `${r.id} | ${r.title} | ${r.categoryName} | L${r.likelihood} x I${r.impact} = ${r.score} (${r.level})${r.unverified ? " | UNVERIFIED" : ""}${r.overridden ? " | MANUAL OVERRIDE" : ""} | owner ${r.owner}\n` +
        `  drivers: ${r.firedTriggers.map((t) => t.note).join("; ") || "base case"}\n` +
        `  mitigations: ${r.mitigations.join("; ")}\n` +
        `  KRI: ${r.kri}`
    )
    .join("\n");

  const system = `You are a data center risk associate writing a one-page risk memo for the leadership of a data center developer. The scores, rankings, verdict, and drivers were produced by a rule-based register, with some scores replaced by risk owner assessments (manual overrides). Do not re-score or invent new risks. Your job is to interpret: explain what the numbers mean for this specific project, connect risks that compound each other, and recommend where leadership attention goes in the next 90 days. If a county or utility territory is given, refer to it by name where relevant.

Where a score was manually overridden, mention it once with the owner's reason so leadership knows a judgment call was made. Where inputs are UNKNOWN, the register used base scores and skipped related triggers, so exposure may be understated. Say this plainly where it matters and list what must be confirmed.

Format rules: plain text with one exception: wrap the single most important phrase in each paragraph in double asterisks for emphasis, at most two per paragraph. No headers with # symbols, no bullet symbols, no title line. Start directly with the first section header on its own line. Each section is the header line followed by one or two short paragraphs. No em dashes. Around 500 words.`;

  const user = `PROJECT PROFILE
${profileLines}

REGISTER SUMMARY
${summaryLines}

MANUAL OVERRIDES
${overrideLines}

DATA GAPS (unknown inputs)
${gapLines}

TOP ACTIVE RISKS (ranked by effective score)
${riskLines}

Write the memo with exactly these six section headers, in this order:
Overall exposure
What is driving the score
Compounding risks
Priority actions, next 90 days
Indicators to watch
Information to confirm`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Anthropic API ${res.status}: ${text.slice(0, 300)}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const memo = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (data.stop_reason && data.stop_reason !== "end_turn") {
      return NextResponse.json(
        { error: `Memo ended early (${data.stop_reason}). Try Regenerate.`, memo },
        { status: 502 }
      );
    }

    return NextResponse.json({ memo, usage: data.usage });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}