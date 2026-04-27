export function MessageFeed({ personas }: any) {
  return (
    <section className="mb-3 space-y-2">
      {personas.map((p: any, i: number) => (
        <div
          key={i}
          className="rounded-lg border border-[#2A313A] bg-[#12161C] p-3"
        >
          <div className="mb-1 text-[10px] uppercase tracking-widest text-[#8A93A3]">
            {p.name} — {p.role}
          </div>
          <div className="text-sm">{p.text}</div>
          <div className="mt-1 text-[10px] text-[#5A646F]">
            Suggests: {p.action}
          </div>
        </div>
      ))}
    </section>
  );
}
