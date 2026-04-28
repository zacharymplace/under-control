export function DecisionTimeline({ game }: any) {
  if (game.state !== "FAILED" && game.state !== "STABILIZED") return null;

  const log = game.actionLog || [];

  if (!log.length) return null;

  return (
    <section className="mt-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-4">
      <div className="mb-3 text-xs uppercase tracking-widest text-[#8A93A3]">
        Decision Timeline
      </div>

      <div className="space-y-2">
        {log.map((entry: any, i: number) => (
          <div
            key={i}
            className="rounded border border-[#2A313A] bg-[#0B0D10] p-3"
          >
            <div className="mb-1 flex justify-between text-xs uppercase tracking-widest text-[#8A93A3]">
              <span>Turn {entry.turn}</span>
              <span>{entry.action}</span>
            </div>

            <div className="text-sm text-[#8A93A3]">
              Load {entry.before.load} → {entry.after.load} • Drift{" "}
              {entry.before.drift} → {entry.after.drift} • Integrity{" "}
              {entry.before.integrity} → {entry.after.integrity}
            </div>

            {entry.note && (
              <div className="mt-1 text-xs text-[#E6EAF0]">{entry.note}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
