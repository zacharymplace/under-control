type PlayerNarrative = {
  title?: string;
  lines?: string[];
};

export function PlayerNarrativePanel({
  narrative,
}: {
  narrative: PlayerNarrative | null | undefined;
}) {
  if (!narrative) return null;

  return (
    <section className="mt-5 rounded-lg border border-[#2A313A] bg-[#12161C] p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-[#8A93A3]">
          Player Narrative
        </div>
        <div className="text-[10px] uppercase tracking-widest text-[#5A646F]">
          Multi-run synthesis
        </div>
      </div>

      <div className="text-xl font-bold text-[#E6EAF0]">{narrative.title}</div>

      <div className="mt-3 space-y-2 text-sm text-[#8A93A3]">
        {(narrative.lines || []).map((line, index) => (
          <div key={`${line}-${index}`}>{line}</div>
        ))}
      </div>
    </section>
  );
}
