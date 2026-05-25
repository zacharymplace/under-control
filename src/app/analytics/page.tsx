type AnalyticsRun = {
  state?: string;
  turn?: number | string | null;
  avgPressure?: number | string | null;
  summary?: {
    avgPressure?: number | string | null;
  } | null;
};

type MetricProps = {
  label: string;
  value: number;
};

async function getRuns(): Promise<AnalyticsRun[]> {
  try {
    const res = await fetch("http://localhost:3000/api/analytics", {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as AnalyticsRun[]) : [];
  } catch {
    return [];
  }
}

export default async function AnalyticsPage() {
  const runs = await getRuns();

  const total = runs.length;
  const failed = runs.filter((run) => run.state === "FAILED").length;
  const stabilized = runs.filter((run) => run.state === "STABILIZED").length;

  const avgTurn =
    total === 0
      ? 0
      : Math.round(
          runs.reduce((sum, run) => sum + Number(run.turn || 0), 0) / total
        );

  const avgPressure =
    total === 0
      ? 0
      : Math.round(
          runs.reduce(
            (sum, run) =>
              sum + Number(run.summary?.avgPressure || run.avgPressure || 0),
            0
          ) / total
        );

  return (
    <main className="uc-root">
      <div className="uc-shell">
        <section className="uc-card">
          <h1 className="uc-title">Run Analytics</h1>
          <div className="uc-subtle">Completed run history</div>

          <div className="uc-metrics">
            <Metric label="Runs" value={total} />
            <Metric label="Failed" value={failed} />
            <Metric label="Stabilized" value={stabilized} />
            <Metric label="Avg Turn" value={avgTurn} />
            <Metric label="Avg Pressure" value={avgPressure} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: MetricProps) {
  return (
    <div>
      <div className="uc-label">{label}</div>
      <div className="uc-value">{value}</div>
    </div>
  );
}
