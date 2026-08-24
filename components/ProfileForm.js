"use client";

import { OPTIONS, PRESETS } from "@/lib/presets";
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

export default function ProfileForm({ profile, onChange, onLoadPreset, onRun, running }) {
  const set = (key) => (e) => onChange({ ...profile, [key]: e.target.value });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="eyebrow mb-2">Load sample</p>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="btn-ghost text-left"
              onClick={() => onLoadPreset(p.profile)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.label}>
          <p className="eyebrow mb-3 border-t border-line pt-4">{sec.label}</p>
          <div className="flex flex-col gap-3">
            {sec.fields.map(([key, label, type, opts]) => (
              <div key={key}>
                <label className="field-label" htmlFor={key}>
                  {label}
                </label>
                {type === "select" ? (
                  <select
                    id={key}
                    className="field-select"
                    value={profile[key]}
                    onChange={set(key)}
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
                    placeholder={type === "text" ? "Untitled project" : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        className="btn-primary w-full"
        onClick={onRun}
        disabled={running}
      >
        {running ? "Scoring…" : "Run register"}
      </button>
    </div>
  );
}