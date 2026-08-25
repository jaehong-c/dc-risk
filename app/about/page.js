import Header from "@/components/Header";

export const metadata = {
  title: "About · DC Risk Register",
  description:
    "Methodology, scoring logic, data sources, and roadmap for the DC Risk Register.",
};

const REPO_URL = "https://github.com/jaehong-c/dc-risk";

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

function Para({ children, first }) {
  return (
    <p className={`text-[13px] leading-relaxed text-ink-2 ${first ? "" : "mt-3"}`}>
      {children}
    </p>
  );
}

export default function About() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-[880px] px-6 py-8 flex flex-col gap-5">
        <div>
          <p className="eyebrow mb-2">About</p>
          <h1 className="display text-[26px]">Lifecycle risk intelligence for data center development</h1>
          <p className="mt-3 text-[14px] text-ink-2">
            Built by Jae Chung. Code and data are public on <a className="underline" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>.
          </p>
        </div>

        <Section eyebrow="What it does">
          <Para first>
            DC Risk Register takes a 22-field project profile and evaluates it against a curated
            library of 72 development and operating risks. Each risk is scored deterministically by
            trigger rules, plotted on a 5x5 heat matrix, and summarized in an AI-generated leadership
            memo. It is the second tool in a suite that follows a project from site selection
            (Site Screener) through lease economics (Lease Comparator) into lifecycle risk.
          </Para>
        </Section>

        <Section eyebrow="Methodology">
          <Para first>
            The register follows the ISO 31000 sequence: identify, analyze, evaluate, treat. Every
            risk carries a likelihood (1 to 5) and impact (1 to 5); score equals L times I. Bands are
            Low (1 to 4), Medium (5 to 9), High (10 to 15), and Critical (16 to 25). The project-level
            verdict is Contained, Moderate, or Elevated, driven by the count and concentration of
            High and Critical risks in the current phase.
          </Para>
          <Para>
            Trigger rules read the profile fields directly. A 500 MW campus in permitting with no
            executed interconnection agreement, for example, raises PWR likelihood; a signed
            pre-lease lowers FIN impact. Any field left as unknown marks dependent risks as
            unverified and lists them in the Data gaps panel rather than silently assuming a value.
          </Para>
        </Section>

        <Section eyebrow="Risk library: 11 categories, 72 risks">
          <div>
            {CATEGORIES.map(([code, name, desc]) => (
              <div
                key={code}
                className="py-2.5 border-b last:border-b-0"
                style={{ display: "grid", gridTemplateColumns: "56px 200px 1fr", gap: 12 }}
              >
                <span className="mono text-[11px] text-ink-3">{code}</span>
                <span className="text-[13px]">{name}</span>
                <span className="text-[12px] text-ink-2">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Reviewer controls">
          <Para first>
            Rule-based scores can be overridden per risk with a reason. Every override, revert, and
            clear is written to an audit log with reviewer name and timestamp, and the log is
            appended to the CSV export so the register remains traceable back to the rule baseline.
          </Para>
        </Section>

        <Section eyebrow="Data sources and limits">
          <Para first>
            The risk library and state-level ratings were curated by the author for this prototype.
            They are not sourced from proprietary company data and have not been validated against
            historical project outcomes. Three presets (West Texas early-stage, Northern Virginia
            under construction, Ohio operating) serve as calibration checks for the rule engine.
            Treat scores as a structured starting point for review, not a substitute for
            project-specific assessment.
          </Para>
        </Section>

        <Section eyebrow="How it was built">
          <Para first>
            Next.js 16 App Router, JavaScript, Tailwind v4, static JSON data layer, and a server
            route that calls the Anthropic API for the memo. Architecture and rule logic were
            scoped in conversation with Claude, files were generated and then assembled in Cursor,
            and the app is deployed on Vercel.
          </Para>
        </Section>

        <Section eyebrow="Roadmap">
          <ul className="flex flex-col gap-1.5 text-[13px] text-ink-2">
            {ROADMAP.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-ink-3">-</span>
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