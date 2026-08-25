import Header from "@/components/Header";

export const metadata = {
  title: "About · DC Risk Register",
  description:
    "Methodology, scoring logic, data sources, and roadmap for the DC Risk Register.",
};

const CATEGORIES = [
  ["SIT", "Site & land", "Title, zoning, geotechnical, natural hazards, water"],
  ["PRM", "Permitting & entitlements", "Land use, environmental, air, stormwater, community"],
  ["PWR", "Power & utility", "Interconnection queue, capacity, tariff, curtailment, ERCOT/PJM exposure"],
  ["SCM", "Supply chain", "Transformers, switchgear, generators, chillers, GPU lead times"],
  ["CON", "Construction", "GC capacity, labor, weather, commissioning, change orders"],
  ["SCH", "Schedule", "COD slippage, critical path, tenant milestones"],
  ["CST", "Cost", "Escalation, contingency adequacy, tariff exposure"],
  ["FIN", "Financing & market", "Rate, pre-lease coverage, counterparty, exit assumptions"],
  ["OPS", "Operations", "Uptime, PUE, water use, staffing, maintenance"],
  ["SEC", "Security & compliance", "Physical, cyber, regulatory, ESG reporting"],
  ["INS", "Insurance & liability", "Builder's risk, property, catastrophe coverage gaps"],
];

const ROADMAP = [
  "Replace curated state grades with FEMA National Risk Index county-level data",
  "Nominatim geocoding and Leaflet map for site context",
  "Saved registers with month-over-month score change tracking",
  "PDF export of the register and leadership memo",
  "Risk library calibration against additional real-world project profiles",
];

function Section({ eyebrow, children }) {
  return (
    <section className="panel p-6">
      <p className="eyebrow mb-3">{eyebrow}</p>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-[880px] px-6 py-8 flex flex-col gap-5">
        <div>
          <p className="display text-[26px]">A lifecycle risk register for data center projects.</p>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
            DC Risk Register takes a ~22-field project profile and evaluates it against a curated
            library of 72 development and operating risks. Each risk is scored deterministically by
            trigger rules, plotted on a 5×5 heat matrix, and summarized in an AI-generated leadership
            memo. It is the second tool in a suite that follows a project from site selection
            (Site Screener) through lease economics (Lease Comparator) into lifecycle risk.
          </p>
        </div>

        <Section eyebrow="Methodology">
          <p className="text-[13px] leading-relaxed text-ink-2">
            The register follows the ISO 31000 sequence: identify, analyze, evaluate, treat. Every
            risk carries a likelihood (1–5) and impact (1–5); score = L × I. Bands are Low (1–4),
            Medium (5–9), High (10–15), and Critical (16–25). The project-level verdict is
            Contained, Moderate, or Elevated, driven by the count and concentration of High and
            Critical risks in the current phase.
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-2">
            Trigger rules read the profile fields directly. A 500 MW campus in permitting with no
            executed interconnection agreement, for example, raises PWR likelihood; a signed
            pre-lease lowers FIN impact. Any field left as unknown marks dependent risks as
            unverified and lists them in the Data gaps panel rather than silently assuming a value.
          </p>
        </Section>

        <Section eyebrow="Risk library · 11 categories, 72 risks">
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--line)" }}>
            {CATEGORIES.map(([code, name, desc]) => (
              <div key={code} className="grid py-2.5" style={{ gridTemplateColumns: "56px 200px 1fr", gap: 12 }}>
                <span className="mono text-[11px] text-ink-3">{code}</span>
                <span className="text-[13px]">{name}</span>
                <span className="text-[12px] text-ink-2">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Reviewer controls">
          <p className="text-[13px] leading-relaxed text-ink-2">
            Rule-based scores can be overridden per risk with a reason. Every override, revert, and
            clear is written to an audit log with reviewer name and timestamp, and the log is
            appended to the CSV export so the register remains traceable back to the rule baseline.
          </p>
        </Section>

        <Section eyebrow="Data sources and limits">
          <p className="text-[13px] leading-relaxed text-ink-2">
            The risk library and state-level ratings were curated by the author for this prototype.
            They are not sourced from proprietary company data and have not been validated against
            historical project outcomes. Three presets (West Texas early-stage, Northern Virginia
            under construction, Ohio operating) serve as calibration checks for the rule engine.
            Treat scores as a structured starting point for review, not a substitute for
            project-specific assessment.
          </p>
        </Section>

        <Section eyebrow="How it was built">
          <p className="text-[13px] leading-relaxed text-ink-2">
            Next.js 16 App Router, JavaScript, Tailwind v4, static JSON data layer, and a server
            route that calls the Anthropic API for the memo. Architecture and rule logic were
            scoped in conversation with Claude, files were generated and then assembled in Cursor,
            and the app is deployed on Vercel. Source is public at{" "}
            
              className="underline"
              href="https://github.com/jaehong-c/dc-risk"
              target="_blank"
              rel="noreferrer"
            >
              github.com/jaehong-c/dc-risk
            </a>
            .
          </p>
        </Section>

        <Section eyebrow="Roadmap">
          <ul className="flex flex-col gap-1.5 text-[13px] text-ink-2">
            {ROADMAP.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-ink-3">–</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <footer className="mx-auto max-w-[880px] px-6 pb-8 pt-2 text-[11px] text-ink-3">
        <p>© 2026 Jae Chung. All rights reserved.</p>
      </footer>
    </main>
  );
}