export function ActionBar({ onAction, disabled, hints, personas, disagreement }: any) {
  const dominant = personas?.reduce((a: any, b: any) =>
    (a?.trust ?? 0) > (b?.trust ?? 0) ? a : b
  );

  return (
    <section className="mb-3 grid grid-cols-3 gap-2">
      {["STABILIZE", "REROUTE", "OBSERVE"].map((action) => {
        const isDominant = dominant?.action === action && dominant?.trust > 1;
        const isConsensus = disagreement?.consensusAction === action;
        const highDisagreement = disagreement?.level === "HIGH";

        return (
          <div key={action}>
            <button
              disabled={disabled}
              onClick={() => onAction(action)}
              className={`w-full border px-3 py-4 text-xs font-bold uppercase tracking-widest ${
                disabled
                  ? "cursor-not-allowed border-[#2A313A] bg-[#0F1318] text-[#5A646F]"
                  : highDisagreement
                  ? "border-[#D4A84F] bg-[#221E14] text-[#E6EAF0]"
                  : isConsensus || isDominant
                  ? "border-[#4FAF7B] bg-[#1E2A22] text-[#E6EAF0]"
                  : "border-[#2A313A] bg-[#1A1F26] text-[#E6EAF0] hover:bg-[#222A34]"
              }`}
            >
              {action}
            </button>

            {hints?.[action] && (
              <div className="mt-1 text-center text-[10px] text-[#8A93A3]">
                {hints[action]}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
