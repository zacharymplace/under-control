export function MessageFeed({ personas }: any) {
  return (
    <section className="mb-3 space-y-2">
      {personas.map((p: any, i: number) => (
        <div
          key={i}
          className="rounded-lg border border-[#2A313A] bg-[#12161C] p-3"
        >
          <div className="mb-1 flex justify-between text-[10px] uppercase tracking-widest text-[#8A93A3]">
            <span>
              {p.name} — {p.role}
            </span>
            <span>{p.mood ? `${p.mood} / ${p.strategy}` : p.strategy}</span>
          </div>

          <div className="text-sm">{p.text}</div>

          <div className="mt-1 flex justify-between text-[10px] text-[#5A646F]">
            <span>Suggests: {p.action}</span>
            <span>
              Trust: {p.trust} • Ignored: {p.ignoredCount}
            </span>
          </div>
        </div>
      ))}
    </section>
  );
}
