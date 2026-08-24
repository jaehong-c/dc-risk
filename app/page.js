export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="h-14 border-b border-line bg-surface">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
          <div className="flex items-baseline gap-3">
            <span className="display text-[15px]">DC Risk Register</span>
            <span className="eyebrow">Lifecycle risk · v0.1</span>
          </div>
          <span className="mono text-[11px] text-ink-3">
            Prototype · curated risk library
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] grid-cols-[320px_1fr] gap-5 px-6 py-6">
        <aside className="panel p-5">
          <p className="eyebrow mb-4">Project profile</p>
          <p className="text-[13px] text-ink-2">
            Input form arrives in the next build step.
          </p>
        </aside>

        <section className="flex flex-col gap-5">
          <div className="panel p-5">
            <p className="eyebrow mb-4">Heat matrix</p>
            <div className="grid h-[280px] place-items-center text-[13px] text-ink-3">
              Likelihood × impact matrix renders here.
            </div>
          </div>
          <div className="panel p-5">
            <p className="eyebrow mb-4">Register</p>
            <div className="grid h-[200px] place-items-center text-[13px] text-ink-3">
              Risk register table renders here.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}