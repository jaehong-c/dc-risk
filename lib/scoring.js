import risksData from "@/data/risks.json";
import statesData from "@/data/states.json";

export const PHASES = risksData.meta.phases;
export const CATEGORIES = risksData.meta.categories;
export const LEVELS = risksData.meta.levels;
export const SCALE = risksData.meta.scale;

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Read "a.b.c" from an object
function getPath(obj, path) {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

// Match a single condition: array = "in", object = {gte, lte, eq}
function matchCondition(value, cond) {
  if (value === undefined || value === null) return false;
  if (Array.isArray(cond)) return cond.includes(value);
  if (typeof cond === "object") {
    if (cond.gte !== undefined && !(value >= cond.gte)) return false;
    if (cond.lte !== undefined && !(value <= cond.lte)) return false;
    if (cond.eq !== undefined && value !== cond.eq) return false;
    return true;
  }
  return value === cond;
}

// All keys in "when" must match (AND)
function matchAll(ctx, when) {
  if (!when) return true;
  return Object.entries(when).every(([path, cond]) =>
    matchCondition(getPath(ctx, path), cond)
  );
}

export function monthsBetween(fromDate, toDateStr) {
  if (!toDateStr) return null;
  const to = new Date(toDateStr);
  if (isNaN(to)) return null;
  const months =
    (to.getFullYear() - fromDate.getFullYear()) * 12 +
    (to.getMonth() - fromDate.getMonth());
  return months;
}

export function getStateData(code) {
  return statesData.states[code] || { ...statesData.default, code };
}

// Build evaluation context from the profile form
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

// Where the project's current phase sits relative to the risk's window
function phaseStatus(riskPhases, currentPhase) {
  const cur = PHASES.indexOf(currentPhase);
  const idx = riskPhases.map((p) => PHASES.indexOf(p));
  const first = Math.min(...idx);
  const last = Math.max(...idx);
  if (cur < first) return "upcoming";
  if (cur > last) return "retired";
  return "active";
}

export function evaluateRisk(risk, ctx) {
  if (risk.activeWhen && !matchAll(ctx, risk.activeWhen)) return null;

  let likelihood = risk.baseLikelihood;
  let impact = risk.baseImpact;
  const firedTriggers = [];

  for (const t of risk.triggers || []) {
    if (matchAll(ctx, t.when)) {
      likelihood += t.likelihood || 0;
      impact += t.impact || 0;
      firedTriggers.push(t);
    }
  }

  likelihood = clamp(likelihood, 1, 5);
  impact = clamp(impact, 1, 5);
  const score = likelihood * impact;

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
    likelihood,
    impact,
    score,
    level: levelFor(score),
    status: phaseStatus(risk.phases, ctx.phase),
    firedTriggers,
  };
}

export function scoreProject(profile, now = new Date()) {
  const ctx = buildContext(profile, now);
  const evaluated = risksData.risks
    .map((r) => evaluateRisk(r, ctx))
    .filter(Boolean);

  // Sort: active first, then by score desc, then by id
  const statusRank = { active: 0, upcoming: 1, retired: 2 };
  evaluated.sort(
    (a, b) =>
      statusRank[a.status] - statusRank[b.status] ||
      b.score - a.score ||
      a.id.localeCompare(b.id)
  );

  const active = evaluated.filter((r) => r.status === "active");
  const summary = {
    total: evaluated.length,
    active: active.length,
    upcoming: evaluated.filter((r) => r.status === "upcoming").length,
    retired: evaluated.filter((r) => r.status === "retired").length,
    byLevel: {
      critical: active.filter((r) => r.level === "critical").length,
      high: active.filter((r) => r.level === "high").length,
      medium: active.filter((r) => r.level === "medium").length,
      low: active.filter((r) => r.level === "low").length,
    },
    byCategory: Object.fromEntries(
      Object.keys(CATEGORIES).map((c) => [
        c,
        active.filter((r) => r.category === c).length,
      ])
    ),
    avgScore: active.length
      ? Math.round((active.reduce((s, r) => s + r.score, 0) / active.length) * 10) / 10
      : 0,
    top: active.slice(0, 10),
  };

  // 5x5 matrix: matrix[impact-1][likelihood-1] = array of active risk ids
  const matrix = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => [])
  );
  for (const r of active) matrix[r.impact - 1][r.likelihood - 1].push(r.id);

  return { ctx, risks: evaluated, summary, matrix };
}