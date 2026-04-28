import {
  getTeamAlignment,
  interpretActionScore,
} from "@/game/actionInterpretation";

export function ActionBar({ onAction, disabled, hints, disagreement }: any) {
  const scores = disagreement?.scores || {};
  const maxScore = Math.max(...Object.values(scores).map(Number), 0);
  const alignment = getTeamAlignment(scores);

  return (
    <section className="mb-4">
      <div className="mb-2 flex items-center justify-between rounded border border-[#2A313A] bg-[#12161C] px-3 py-2">
        <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
          Team Alignment (decision tension) (decision tension)
        </div>
        <div
          className={`text-[10px] uppercase tracking-widest ${
            alignment === "HIGH"
              ? "text-[#4FAF7B]"
              : alignment === "MEDIUM"
              ? "text-[#D4A84F]"
              : "text-[#C75C5C]"
          }`}
        >
          {alignment}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["STABILIZE", "REROUTE", "OBSERVE"].map((action) => {
          const score = Number(scores[action] ?? 0);
          const label = interpretActionScore(score, maxScore);
          const isTop = action === disagreement?.consensusAction;
          const weakConsensus = (disagreement?.spread ?? 0) < 1;

          return (
            <div key={action}>
              <button
                disabled={disabled}
                onClick={() => onAction(action)}
                className={`w-full border px-3 py-4 text-xs font-bold uppercase tracking-widest ${
                  disabled
                    ? "cursor-not-allowed border-[#2A313A] bg-[#0F1318] text-[#5A646F]"
                    : isTop && !weakConsensus
                    ? "border-[#4FAF7B] bg-[#1E2A22]"
                    : isTop && weakConsensus
                    ? "border-[#D4A84F] bg-[#2A2418]"
                    : "border-[#2A313A] bg-[#1A1F26] hover:bg-[#222A34]"
                }`}
              >
                <div>{action}</div>
                <div className="mt-1 text-[10px] text-[#8A93A3]">
                  {label}
                </div>
                <div className="mt-1 text-[10px] text-[#5A646F]">
                  score: {score.toFixed(2)}
                </div>
              </button>

              {hints?.[action] && (
                <div className="mt-1 text-center text-[10px] text-[#5A646F]">
                  {hints[action]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-center text-[10px] text-[#5A646F]">
        Scores reflect weighted trust × confidence × mood influence.
      </div>
    </section>
  );
}
