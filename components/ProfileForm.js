"use client";

import { OPTIONS, PRESETS, EMPTY_PROFILE } from "@/lib/presets";
import Spinner from "@/components/Spinner";
import statesData from "@/data/states.json";

const STATE_OPTIONS = Object.entries(statesData.states)
  .map(([code, s]) => [code, `${s.name} (${code})`])
  .sort((a, b) => a[1].localeCompare(b[1]));

const SECTIONS = [
  {
    label: "Project",
    fields: [
      ["name", "Project name", "text"],
      ["state", "State", "select", STATE_OPTIONS],
      ["locality", "County / utility territory", "text", null, "Context for the memo only, not scored"],
      ["capacityMW", "Capacity (MW)", "number"],
      ["phase", "Current phase", "select"],
      ["targetCOD", "Target COD", "date"],
      ["workloadType", "Workload", "select"],
      ["tenantStatus", "Tenant", "select"],
    ],
  },
  {
    label: "Site & power",
    fields: [
      ["landStatus", "Land control", "select"],
      ["permittingStatus", "Entitlements", "select"],
      ["taxIncentive", "Tax incentive", "select"],
      ["powerStatus", "Power", "select"],
      ["powerSource", "Power source", "select"],
      ["redundancy", "Redundancy", "select"],
      ["coolingType", "Cooling", "select"],
      ["waterSource", "Water source", "select"],
    ],
  },
  {
    label: "Delivery",
    fields: [
      ["contractType", "Contract type", "select"],
      ["gcStatus", "General contractor", "select"],
      ["longLeadStatus", "Long-lead equipment", "select"],
      ["financing", "Financing", "select"],
    ],
  },
  {
    label: "Risk programs",
    fields: [
      ["insuranceStatus", "Insurance program", "select"],
      ["complianceStatus", "SOC 2 / ISO 27001", "select"],
      ["bcdrStatus", "BC/DR plan", "select"],
    ],
  },
];

const SCORED_FIELDS = Object.keys(EMPTY_PROFILE).filter(
  (k) => !["name", "state", "locality", "capacityMW", "phase"].includes(k)
);

export default function ProfileForm({ profile, onChange, onLoadPreset, onRun, running }) {
  const set = (key) => (e) => onChange({ ...profile, [key]: e.target.value });

  const unknownCount = SCORED_FIELDS.filter(
    (k) => profile[k] === "unknown" || (k === "targetCOD" && !profile[k])
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow mb-2">Load sample</p>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="btn-ghost wrap text-left"
              onClick={() => onLoadPreset(p.profile)}
            >
              {p.label}
            </button>
          ))}
          <button
            type="button"
            className="btn-ghost wrap text-left"
            style={{ color: "var(--ink-3)" }}
            onClick={() => onLoadPreset(EMPTY_PROFILE)}
          >
            Start blank (all fields unknown)
          </button>
        </div>
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.label}>
          <p className="eyebrow mb-3 border-t border-line pt-4">{sec.label}</p>
          <div className="flex flex-col gap-3">
            {sec.fields.map(([key, label, type, opts, hint]) => {
              const scored = SCORED_FIELDS.includes(key);
              const isUnknown =
                scored && (profile[key] === "unknown" || (key === "targetCOD" && !profile[key]));
              return (
                <div key={key}>
                  <label className="field-label" htmlFor={key}>
                    {label}
                    {isUnknown && (
                      <span className="mono ml-2 text-[10px]" style={{ color: "var(--risk-med)" }}>
                        unknown
                      </span>
                    )}
                  </label>
                  {type === "select" ? (
                    <select
                      id={key}
                      className="field-select"
                      value={profile[key]}
                      onChange={set(key)}
                      style={isUnknown ? { borderStyle: "dashed" } : undefined}
                    >
                      {(opts || OPTIONS[key]).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={key}
                      className="field-input"
                      type={type}
                      value={profile[key]}
                      onChange={set(key)}
                      placeholder={
                        key === "name" ? "Untitled project" : key === "locality" ? "e.g. Loudoun County, Dominion" : undefined
                      }
                      style={isUnknown ? { borderStyle: "dashed" } : undefined}
                    />
                  )}
                  {hint && <p className="mt-1 text-[10.5px] text-ink-3">{hint}</p>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <button
          type="button"
          className="btn-primary w-full"
          onClick={onRun}
          disabled={running}
        >
          {running && <Spinner />}
          {running ? "Scoring" : "Run register"}
        </button>
        {unknownCount > 0 && (
          <p className="mt-2 text-center text-[11px] text-ink-3">
            {unknownCount} field{unknownCount > 1 ? "s" : ""} unknown. Affected scores will be
            flagged for confirmation.
          </p>
        )}
      </div>
    </div>
  );
}