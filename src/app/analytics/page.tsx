async function getRuns() {
  const res = await fetch("http://localhost:3000/api/analytics", {
    cache: "no-store",
  }).catch(() => null);

  if (!res) return [];
  const data = await res.json();
  return data.runs ?? [];
}

export default async function AnalyticsPage() {
  const runs = await getRuns();

  const total = runs.length;
  const failed = runs.filter((r: any) => r.result === "FAILED").length;
  const stabilized = runs.filter((r: any) => r.result === "STABILIZED").length;

  const avgTurn =
    total === 0
      ? 0
      : Math.round(runs.reduce((sum: number, r: any) => sum + r.turn, 0) / total);

  const avgPressure =
    total === 0
      ? 0
      : Math.round(
          runs.reduce(
            (sum: number, r: any) => sum + (r.summary?.avgPressure ?? 0),
            0
          ) / total
        );

  const maxTurn = runs.reduce((max: number, r: any) => Math.max(max, r.turn), 0);

  return (
    <main className="min-h-screen bg-[#0B0D10] px-5 py-6 text-[#E6EAF0]">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
            Under Control
          </div>
          <h1 className="text-2xl font-bold">Run Analytics</h1>
        </div>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Metric label="Runs" value={total} />
          <Metric label="Failed" value={failed} />
          <Metric label="Stabilized" value={stabilized} />
          <Metric label="Avg Turn" value={avgTurn} />
          <Metric label="Best Turn" value={maxTurn} />
        </section>

        <section className="mb-6 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
          <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
            Pressure
          </div>
          <div className="text-3xl font-bold">{avgPressure}</div>
          <div className="mt-1 text-sm text-[#8A93A3]">Average pressure across completed runs</div>
        </section>

        <section className="space-y-2">
          {runs
            .slice()
            .reverse()
            .slice(0, 20)
            .map((run: any, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-[#2A313A] bg-[#12161C] p-4"
              >
                <div className="mb-1 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
                  <span>{run.result}</span>
                  <span>Turn {run.turn}</span>
                </div>
                <div className="text-sm text-[#8A93A3]">
                  Load {run.load} • Integrity {run.integrity} • Signal {run.signalClarity} • Drift {run.drift}
                </div>
              </div>
            ))}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
      <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
