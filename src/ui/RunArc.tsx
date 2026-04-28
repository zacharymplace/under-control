export function RunArc({ arc }: any) {
  if (!arc) return null;

  return (
    <section className="mt-6 rounded-lg border border-[#2A313A] bg-[#12161C] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
          Run Arc
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#5A646F]">
          Narrative summary
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <ArcStep label="Early Phase" value={arc.early} />
        <ArcStep label="Mid Phase" value={arc.middle} />
        <ArcStep label="Late Phase" value={arc.late} />
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-3">
          <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
            Failure Mode
          </div>
          <div className="mt-1 font-bold text-[#E6EAF0]">
            {arc.failureMode}
          </div>
        </div>

        <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-3">
          <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
            Run Difficulty
          </div>
          <div className="mt-1 font-bold text-[#E6EAF0]">
            {arc.difficulty.label}
          </div>
          <div className="mt-1 text-xs text-[#8A93A3]">
            {arc.difficulty.detail}
          </div>
        </div>
      </div>
    </section>
  );
}

function ArcStep({ label, value }: any) {
  return (
    <div className="rounded border border-[#2A313A] bg-[#0B0D10] p-3">
      <div className="text-[10px] uppercase tracking-widest text-[#8A93A3]">
        {label}
      </div>
      <div className="mt-1 font-bold text-[#E6EAF0]">{value}</div>
    </div>
  );
}
