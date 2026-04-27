export function ActionBar({ onAction, disabled, hints }: any) {
  return (
    <section className="mb-3 grid grid-cols-3 gap-2">
      {["STABILIZE", "REROUTE", "OBSERVE"].map((action) => (
        <div key={action}>
          <button
            disabled={disabled}
            onClick={() => onAction(action)}
            className={`w-full border border-[#2A313A] px-3 py-4 text-xs font-bold uppercase tracking-widest ${
              disabled
                ? "cursor-not-allowed bg-[#0F1318] text-[#5A646F]"
                : "bg-[#1A1F26] text-[#E6EAF0] hover:bg-[#222A34]"
            }`}
          >
            {action}
          </button>

          {hints?.[action] && (
            <div className="mt-1 text-[10px] text-[#8A93A3] text-center">
              {hints[action]}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
