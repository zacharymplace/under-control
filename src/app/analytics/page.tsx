async function getRuns() {
  try {
    const res = await fetch("http://localhost:3000/api/analytics", {
      cache: "no-store",
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function AnalyticsPage() {
  const runs = await getRuns();

  const total = runs.length;
  const failed = runs.filter((r: any) => r.state === "FAILED").length;
  const stabilized = runs.filter((r: any) => r.state === "STABILIZED").length;

  const avgTurn =
    total === 0
      ? 0
      : Math.round(
          runs.reduce((sum: number, r: any) => sum + Number(r.turn || 0), 0) /
            total
        );

  const avgPressure =
    total === 0
      ? 0
      : Math.round(
          runs.reduce(
            (sum: number, r: any) =>
              sum + Number(r.summary?.avgPressure || r.avgPressure || 0),
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

function Metric({ label, value }: any) {
  return (
    <div>
      <div className="uc-label">{label}</div>
      <div className="uc-value">{value}</div>
    </div>
  );
}
