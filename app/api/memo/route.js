import { NextResponse } from "next/server";

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set." }, { status: 500 });
  }

  const { ctx, summary, risks } = await req.json();
  const active = risks.filter((r) => r.status === "active");
  const top = active.slice(0, 12);

  const m = ctx.monthsToCOD;
  const codLine =
    m == null ? "not set" : m >= 0 ? `${m} months to COD` : `${Math.abs(m)} months since COD`;

  const profileLines = [
    `Project: ${ctx.name || "Untitled"}`,
    `Location: ${ctx.state.name} (grid operator ${ctx.state.gridOperator})`,
    `Capacity: ${ctx.capacityMW} MW · Workload: ${ctx.workloadType} · Tenant: ${ctx.tenantStatus}`,
    `Phase: ${ctx.phase} · Timing: ${codLine}`,
    `Power: ${ctx.powerStatus} (${ctx.powerSource}) · Redundancy: ${ctx.redundancy}`,
    `Cooling: ${ctx.coolingType} · Water: ${ctx.waterSource}`,
    `Land: ${ctx.landStatus} · Entitlements: ${ctx.permittingStatus} · Incentive: ${ctx.taxIncentive}`,
    `Contract: ${ctx.contractType} · GC: ${ctx.gcStatus} · Long-lead: ${ctx.longLeadStatus}`,
    `Financing: ${ctx.financing} · Insurance: ${ctx.insuranceStatus} · Compliance: ${ctx.complianceStatus} · BC/DR: ${ctx.bcdrStatus}`,
  ].join("\n");

  const summaryLines = [
    `Active risks: ${summary.active} (critical ${summary.byLevel.critical}, high ${summary.byLevel.high}, medium ${summary.byLevel.medium}, low ${summary.byLevel.low})`,
    `Average score: ${summary.avgScore}`,
    `By category: ${Object.entries(summary.byCategory).map(([k, v]) => `${k} ${v}`).join(", ")}`,
  ].join("\n");

  const riskLines = top
    .map(
      (r) =>
        `${r.id} | ${r.title} | ${r.categoryName} | L${r.likelihood} x I${r.impact} = ${r.score} (${r.level}) | owner ${r.owner}\n` +
        `  drivers: ${r.firedTriggers.map((t) => t.note).join("; ") || "base case"}\n` +
        `  mitigations: ${r.mitigations.join("; ")}\n` +
        `  KRI: ${r.kri}`
    )
    .join("\n");

  const system = `You are a data center risk associate writing a one-page risk memo for the leadership of a data center developer. The scores, rankings, and drivers were produced by a rule-based register; do not re-score or invent new risks. Your job is to interpret: explain what the numbers mean for this specific project, connect risks that compound each other, and recommend where leadership attention goes in the next 90 days.

Format rules: plain text only. No markdown, no # symbols, no asterisks, no bullet symbols, no title line. Start directly with the first section header. Each section is the header on its own line followed by one or two short paragraphs. No em dashes. Around 450 words.`;

  const user = `PROJECT PROFILE
${profileLines}

REGISTER SUMMARY
${summaryLines}

TOP ACTIVE RISKS (ranked by score)
${riskLines}

Write the memo with exactly these five section headers, in this order:
Overall exposure
What is driving the score
Compounding risks
Priority actions, next 90 days
Indicators to watch`;

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
        max_tokens: 1200,
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

    return NextResponse.json({ memo, usage: data.usage });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}