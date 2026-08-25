import risksData from "@/data/risks.json";
import statesData from "@/data/states.json";

export const PHASES = risksData.meta.phases;
export const CATEGORIES = risksData.meta.categories;
export const LEVELS = risksData.meta.levels;
export const SCALE = risksData.meta.scale;
export const UNKNOWN = "unknown";

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function isUnknown(value) {
  return value === undefined || value === null || value === "" || value === UNKNOWN;
}

function matchCondition(value, cond) {
  if (Array.isArray(cond)) return cond.includes(value);
  if (typeof cond === "object") {
    if (cond.gte !== undefined && !(value >= cond.gte)) return false;
    if (cond.lte !== undefined && !(value <= cond.lte)) return false;
    if (cond.eq !== undefined && value !== cond.eq) return false;
    return true;
  }
  return value === cond;
}

function evalWhen(ctx, when) {
  if (!when) return { match: true, unknownFields: [] };
  const unknownFields = [];
  let match = true;
  for (const [path, cond] of Object.entries(when)) {
    const value = getPath(ctx, path);
    if (isUnknown(value)) {
      unknownFields.push(path);
      match = false;
    } else if (!matchCondition(value, cond)) {
      match = false;
    }
  }
  return { match, unknownFields };
}

export function monthsBetween(fromDate, toDateStr) {
  if (!toDateStr) return null;
  const to = new Date(toDateStr);
  if (isNaN(to)) return null;
  return (
    (to.getFullYear() - fromDate.getFullYear()) * 12 + (to.getMonth() - fromDate.getMonth())
  );
}

export function getStateData(code) {
  return statesData.states[code] || { ...statesData.default, code };
}

export function buildContext(profile, now = new Date()) {
  const capacityMW = Number(profile.capacityMW) || 0;
  return {
    ...profile,
    capacityMW,
    monthsToCOD: monthsBetween(now, profile.targetCOD),
    state: getStateData(profile.state),
  };
}

export function levelFor(score) {
  if (score >= LEVELS.critical[0]) return "critical";
  if (score >= LEVELS.high[0]) return "high";
  if (score >= LEVELS.medium[0]) return "medium";
  return "low";
}

function phaseStatus(riskPhases, currentPhase) {
  const cur = PHASES.indexOf(currentPhase);
  if (cur < 0) return "active";
  const idx = riskPhases.map((p) => PHASES.indexOf(p));
  const first = Math.min(...idx);
  const last = Math.max(...idx);
  if (cur < first) return "upcoming";
  if (cur > last) return "retired";
  return "active";
}

export function evaluateRisk(risk, ctx) {
  const unknownSet = new Set();

  if (risk.activeWhen) {
    const a = evalWhen(ctx, risk.activeWhen);
    if (!a.match && a.unknownFields.length === 0) return null;
    a.unknownFields.forEach((f) => unknownSet.add(f));
  }

  let likelihood = risk.baseLikelihood;
  let impact = risk.baseImpact;
  const firedTriggers = [];

  for (const t of risk.triggers || []) {
    const r = evalWhen(ctx, t.when);
    r.unknownFields.forEach((f) => unknownSet.add(f));
    if (r.match) {
      likelihood += t.likelihood || 0;
      impact += t.impact || 0;
      firedTriggers.push(t);
    }
  }

  likelihood = clamp(likelihood, 1, 5);
  impact = clamp(impact, 1, 5);
  const score = likelihood * impact;
  const unknownFields = [...unknownSet];

  return {
    id: risk.id,
    category: risk.category,
    categoryName: CATEGORIES[risk.category],
    title: risk.title,
    description: risk.description,
    phases: risk.phases,
    owner: risk.owner,
    controlType: risk.controlType,
    mitigations: risk.mitigations,
    kri: risk.kri,
    baseLikelihood: risk.baseLikelihood,
    baseImpact: risk.baseImpact,
    baseScore: risk.baseLikelihood * risk.baseImpact,
    // rule-based result (never mutated by overrides)
    ruleLikelihood: likelihood,
    ruleImpact: impact,
    ruleScore: score,
    // effective values (may be overridden)
    likelihood,
    impact,
    score,
    level: levelFor(score),
    overridden: false,
    override: null,
    status: phaseStatus(risk.phases, ctx.phase),
    firedTriggers,
    unknownFields,
    unverified: unknownFields.length > 0,
  };
}

export function summarize(evaluated) {
  const statusRank = { active: 0, upcoming: 1, retired: 2 };
  const sorted = [...evaluated].sort(
    (a, b) =>
      statusRank[a.status] - statusRank[b.status] ||
      b.score - a.score ||
      a.id.localeCompare(b.id)
  );

  const active = sorted.filter((r) => r.status === "active");

  const dataGaps = {};
  for (const r of active) {
    for (const f of r.unknownFields) {
      if (!dataGaps[f]) dataGaps[f] = [];
      dataGaps[f].push(r.id);
    }
  }

  const summary = {
    total: sorted.length,
    active: active.length,
    upcoming: sorted.filter((r) => r.status === "upcoming").length,
    retired: sorted.filter((r) => r.status === "retired").length,
    unverified: active.filter((r) => r.unverified).length,
    overridden: active.filter((r) => r.overridden).length,
    byLevel: {
      critical: active.filter((r) => r.level === "critical").length,
      high: active.filter((r) => r.level === "high").length,
      medium: active.filter((r) => r.level === "medium").length,
      low: active.filter((r) => r.level === "low").length,
    },
    byCategory: Object.fromEntries(
      Object.keys(CATEGORIES).map((c) => [c, active.filter((r) => r.category === c).length])
    ),
    avgScore: active.length
      ? Math.round((active.reduce((s, r) => s + r.score, 0) / active.length) * 10) / 10
      : 0,
    top: active.slice(0, 10),
    dataGaps,
  };

  const matrix = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
  for (const r of active) matrix[r.impact - 1][r.likelihood - 1].push(r.id);

  return { risks: sorted, summary, matrix };
}

export function scoreProject(profile, now = new Date()) {
  const ctx = buildContext(profile, now);
  const evaluated = risksData.risks.map((r) => evaluateRisk(r, ctx)).filter(Boolean);
  return { ctx, ...summarize(evaluated) };
}

// Apply manual overrides { [riskId]: { likelihood, impact, reason, by, at } } to a scored result.
// Returns a new result; rule values are preserved on each risk.
export function applyOverrides(result, overrides) {
  if (!result) return result;
  const risks = result.risks.map((r) => {
    const o = overrides && overrides[r.id];
    if (!o) {
      return {
        ...r,
        likelihood: r.ruleLikelihood,
        impact: r.ruleImpact,
        score: r.ruleScore,
        level: levelFor(r.ruleScore),
        overridden: false,
        override: null,
      };
    }
    const likelihood = clamp(Number(o.likelihood), 1, 5);
    const impact = clamp(Number(o.impact), 1, 5);
    const score = likelihood * impact;
    return {
      ...r,
      likelihood,
      impact,
      score,
      level: levelFor(score),
      overridden: true,
      override: o,
    };
  });
  return { ctx: result.ctx, ...summarize(risks) };
}