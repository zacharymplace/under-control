export function ActionBar({ onAction, disabled, hints, personas, disagreement }: any) {
  return (
    <section className="mb-3 grid grid-cols-3 gap-2">
      {["STABILIZE", "REROUTE", "OBSERVE"].map((action) => {
        const score = disagreement?.scores?.[action] ?? 0;
        const top = disagreement?.consensusAction;
        const spread = disagreement?.spread ?? 0;

        const isTop = action === top;
        const weakConsensus = spread < 1;

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
              {action}

              <div className="mt-1 text-[10px] text-[#8A93A3]">
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
    </section>
  );
}
