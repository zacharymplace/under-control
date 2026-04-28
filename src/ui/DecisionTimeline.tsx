import { buildFlowNarrative } from "@/game/timelineFlow";
import { formatDelta, getTurnRisk, getTurnStory } from "@/game/timelineStory";
import { buildFlowNarrative } from "@/game/timelineFlow";
import { getPhase } from "@/game/timelinePhase";

export function DecisionTimeline({ game, criticalTurn }: any) {
  if (game.state !== "FAILED" && game.state !== "STABILIZED") return null;

  const log = game.actionLog || [];
  if (!log.length) return null;

  const criticalEntry = criticalTurn
    ? log.find((entry: any) => entry.turn === criticalTurn)
    : null;

  const finalEntry = log[log.length - 1];

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

      <div className="relative space-y-2 border-l border-[#2A313A] pl-4">
        {log.map((entry: any, i: number) => {
          const story = getTurnStory(entry);
          const risk = getTurnRisk(entry);
          const phase = getPhase(entry);
          const showPhaseHeader = phase !== lastPhase;
          lastPhase = phase;

          const isCritical = entry.turn === criticalTurn;

          const phaseLabel =
            phase === "STABLE"
              ? "Stable Phase"
              : phase === "ESCALATING"
              ? "Escalation"
              : "Critical State";

          const phaseColor =
            phase === "STABLE"
              ? "text-[#4FAF7B] border-[#4FAF7B]"
              : phase === "ESCALATING"
              ? "text-[#D4A84F] border-[#D4A84F]"
              : "text-[#C75C5C] border-[#C75C5C]";

          const phaseBg =
            phase === "STABLE"
              ? "bg-[#0B0F0C]"
              : phase === "ESCALATING"
              ? "bg-[#0F0D08]"
              : "bg-[#120909]";

          const loadDelta = entry.after.load - entry.before.load;
          const driftDelta = entry.after.drift - entry.before.drift;
          const integrityDelta = entry.after.integrity - entry.before.integrity;
          const signalDelta =
            entry.after.signalClarity - entry.before.signalClarity;

          return (
            <div key={i}>
              {showPhaseHeader && (
                <div
                  className={`mt-4 border-l-4 pl-2 text-[10px] uppercase tracking-widest ${phaseColor}`}
                >
                  {phaseLabel}
                </div>
              )}

              <details
                open={isCritical || i >= log.length - 2}
                className={`group relative rounded-lg border ${
                  isCritical
                    ? "border-[#D4A84F] bg-gradient-to-r from-[#3A120E] via-[#2A150C] to-[#18140B] shadow-[0_0_24px_rgba(255,80,80,0.18)]"
                    : `border-[#2A313A] ${phaseBg}`
                }`}
              >
                <summary className="cursor-pointer list-none p-3">
                  <div
                    className={`absolute -left-[23px] top-4 h-3 w-3 rounded-full border ${
                      isCritical
                        ? "border-[#D4A84F] bg-[#D4A84F]"
                        : "border-[#2A313A] bg-[#12161C]"
                    }`}
                  />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
                        Turn {entry.turn}
                        {isCritical ? " — Turning Point" : ""}
                        {phase === "CRITICAL" && (
                          <span className="ml-2 text-[#C75C5C]">
                            System Under Strain
                          </span>
                        )}
                      </div>

                      <div
                        className={`mt-1 font-bold ${
                          isCritical
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
                    <span className="mx-2 text-[#2A313A]">•</span>
                    <DeltaLine label="Drift" delta={driftDelta} />
                    <span className="mx-2 text-[#2A313A]">•</span>
                    <DeltaLine label="Integrity" delta={integrityDelta} invert />
                    <span className="mx-2 text-[#2A313A]">•</span>
                    <DeltaLine label="Signal" delta={signalDelta} invert />
                  </div>

                  {isCritical && (
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

function dominantAction(log: any[]) {
  const counts: Record<string, number> = {};
  log.forEach((entry) => {
    counts[entry.action] = (counts[entry.action] || 0) + 1;
  });

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Mixed";
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
