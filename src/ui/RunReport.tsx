type RunReportGameState = {
  state?: string;
  turn?: number;
  load?: number;
  drift?: number;
  actionHistory?: string[];
  summary?: {
    peakLoad?: number;
    peakDrift?: number;
    avgPressure?: number;
  };
};

type SmallMetricProps = {
  label: string;
  value?: string | number | null;
};

export function RunReport({ game }: { game: RunReportGameState }) {
  if (game.state !== "FAILED" && game.state !== "STABILIZED") return null;

  const actions = game.actionHistory || [];
  const count = (a: string) => actions.filter((x: string) => x === a).length;

  return (
    <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
      <div className="mb-3 text-xs uppercase tracking-widest text-[#8A93A3]">
        Run Report
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <Metric label="Turns" value={game.turn} />
        <Metric label="Peak Load" value={game.summary?.peakLoad ?? game.load} />
        <Metric label="Peak Drift" value={game.summary?.peakDrift ?? game.drift} />
        <Metric label="Avg Pressure" value={game.summary?.avgPressure ?? 0} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Action label="Stabilize" value={count("STABILIZE")} />
        <Action label="Reroute" value={count("REROUTE")} />
        <Action label="Observe" value={count("OBSERVE")} />
      </div>
    </section>
  );
}

function Metric({ label, value }: SmallMetricProps) {
  return (
    <div>
      <div className="text-[#8A93A3]">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}

function Action({ label, value }: SmallMetricProps) {
  return (
    <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-2 text-center">
      <div className="text-[#8A93A3]">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}
