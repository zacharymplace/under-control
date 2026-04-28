import { formatDelta, getTurnRisk, getTurnStory } from "@/game/timelineStory";
import { getPhase } from "@/game/timelinePhase";

export function DecisionTimeline({ game, criticalTurn }: any) {
  if (game.state !== "FAILED" && game.state !== "STABILIZED") return null;

  const log = game.actionLog || [];
  if (!log.length) return null;

  const finalEntry = log[log.length - 1];
  const criticalEntry = criticalTurn
    ? log.find((entry: any) => entry.turn === criticalTurn)
    : null;

  let lastPhase: string | null = null;

  return (
    <section className="mt-5 rounded-lg border border-[#2A313A] bg-[#12161C] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
          Decision Timeline
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#5A646F]">
          Incident replay
        </div>
      </div>

      <div className="mb-4 grid gap-2 text-xs md:grid-cols-3">
        <SummaryCard
          label="Critical Turn"
          value={criticalTurn ? `Turn ${criticalTurn}` : "None"}
          detail={criticalEntry ? criticalEntry.action : "No single inflection"}
        />
        <SummaryCard
          label="Final Risk"
          value={getTurnRisk(finalEntry)}
          detail={`Load ${finalEntry.after.load} • Drift ${finalEntry.after.drift}`}
        />
        <SummaryCard
          label="Run Shape"
          value={dominantAction(log)}
          detail={`${log.length} decisions logged`}
        />
      </div>

      <div className="relative border-l border-[#2A313A] pl-4">
        {log.map((entry: any, index: number) => {
          const story = getTurnStory(entry);
          const risk = getTurnRisk(entry);
          const phase = getPhase(entry);
          const showPhaseHeader = phase !== lastPhase;
          lastPhase = phase;

          const isCriticalTurn = entry.turn === criticalTurn;
          const isDanger =
            risk !== "CONTROLLED" ||
            phase === "CRITICAL" ||
            isCriticalTurn ||
            index >= log.length - 2;

          const loadDelta = entry.after.load - entry.before.load;
          const driftDelta = entry.after.drift - entry.before.drift;
          const integrityDelta = entry.after.integrity - entry.before.integrity;
          const signalDelta =
            entry.after.signalClarity - entry.before.signalClarity;

          return (
            <div key={`${entry.turn}-${index}`} className="mb-2">
              {showPhaseHeader && <PhaseHeader phase={phase} />}

              <details
                open={isDanger}
                className={`group relative rounded-lg border ${cardStyle(
                  phase,
                  isCriticalTurn,
                  risk
                )}`}
              >
                <summary className="cursor-pointer list-none p-3">
                  <TimelineDot phase={phase} active={isDanger} />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
                        Turn {entry.turn}
                        {isCriticalTurn ? " — Turning Point" : ""}
                        {phase === "CRITICAL" && (
                          <span className="ml-2 text-[#C75C5C]">
                            System Under Strain
                          </span>
                        )}
                      </div>

                      <div
                        className={`mt-1 font-bold ${
                          isCriticalTurn
                            ? "text-lg text-[#F1D08A]"
                            : "text-[#E6EAF0]"
                        }`}
                      >
                        {story.label}
                      </div>

                      <p className="mt-1 text-xs text-[#8A93A3]">
                        {story.summary}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
                        {entry.action}
                      </div>
                      <RiskBadge risk={risk} />
                    </div>
                  </div>
                </summary>

                <div className="px-3 pb-3">
                  <div className="mb-2 text-[10px] text-[#5A646F]">
                    {story.causal}
                  </div>

                  <div className="rounded border border-[#1F2630] bg-[#080A0D] px-3 py-2 text-[11px] text-[#8A93A3]">
                    <DeltaLine label="Load" delta={loadDelta} />
                    <Divider />
                    <DeltaLine label="Drift" delta={driftDelta} />
                    <Divider />
                    <DeltaLine label="Integrity" delta={integrityDelta} invert />
                    <Divider />
                    <DeltaLine label="Signal" delta={signalDelta} invert />
                  </div>

                  {isCriticalTurn && (
                    <div className="mt-3 rounded border border-[#4A3918] bg-[#120F08] p-2 text-xs text-[#E6A15A]">
                      Key inflection point: recovery became materially harder after
                      this decision.
                    </div>
                  )}
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function cardStyle(phase: string, isCriticalTurn: boolean, risk: string) {
  if (isCriticalTurn) {
    return "border-[#D4A84F] bg-gradient-to-r from-[#3A120E] via-[#2A150C] to-[#18140B] shadow-[0_0_24px_rgba(255,80,80,0.18)]";
  }

  if (risk === "LOAD CRITICAL" || risk === "DRIFT CRITICAL") {
    return "border-[#5E2D2D] bg-[#150B0D]";
  }

  if (phase === "CRITICAL") {
    return "border-[#3A2426] bg-[#120909]";
  }

  if (phase === "ESCALATING") {
    return "border-[#3A311E] bg-[#0F0D08]";
  }

  return "border-[#223027] bg-[#0B0F0C]";
}

function PhaseHeader({ phase }: any) {
  const label =
    phase === "STABLE"
      ? "Controlled"
      : phase === "ESCALATING"
      ? "Rising Instability"
      : "System Breakdown";

  const color =
    phase === "STABLE"
      ? "border-[#4FAF7B] text-[#4FAF7B]"
      : phase === "ESCALATING"
      ? "border-[#D4A84F] text-[#D4A84F]"
      : "border-[#C75C5C] text-[#C75C5C]";

  return (
    <div className={`mb-2 mt-4 border-l-4 pl-2 text-[10px] uppercase tracking-widest ${color}`}>
      {label}
    </div>
  );
}

function TimelineDot({ phase, active }: any) {
  const color =
    phase === "STABLE"
      ? "border-[#4FAF7B]"
      : phase === "ESCALATING"
      ? "border-[#D4A84F]"
      : "border-[#C75C5C]";

  return (
    <div
      className={`absolute -left-[23px] top-4 h-3 w-3 rounded-full border ${
        active ? `${color} bg-[#12161C]` : "border-[#2A313A] bg-[#12161C]"
      }`}
    />
  );
}

function RiskBadge({ risk }: any) {
  const cls =
    risk === "CONTROLLED"
      ? "border-[#2B5D45] text-[#4FAF7B]"
      : risk === "WARNING"
      ? "border-[#5F4A1F] text-[#D4A84F]"
      : "border-[#6B2E2E] text-[#C75C5C]";

  return (
    <div className={`mt-1 rounded border px-2 py-1 text-[10px] ${cls}`}>
      {risk}
    </div>
  );
}

function DeltaLine({ label, delta, invert = false }: any) {
  const isGood = invert ? delta > 0 : delta < 0;
  const isBad = invert ? delta < 0 : delta > 0;

  const cls = isGood
    ? "text-[#4FAF7B]"
    : isBad
    ? "text-[#D4A84F]"
    : "text-[#8A93A3]";

  return (
    <span>
      {label} <span className={cls}>{formatDelta(delta)}</span>
    </span>
  );
}

function Divider() {
  return <span className="mx-2 text-[#2A313A]">•</span>;
}

function SummaryCard({ label, value, detail }: any) {
  return (
    <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
        {label}
      </div>
      <div className="mt-1 font-bold text-[#E6EAF0]">{value}</div>
      <div className="mt-1 text-[10px] text-[#5A646F]">{detail}</div>
    </div>
  );
}

function dominantAction(log: any[]) {
  const counts: Record<string, number> = {};

  log.forEach((entry) => {
    counts[entry.action] = (counts[entry.action] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mixed";
}
