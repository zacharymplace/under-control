type TrustBarProps = {
  trust: Record<string, number | string | null | undefined>;
};

export function TrustBar({ trust }: TrustBarProps) {
  return (
    <section className="mb-3 grid grid-cols-3 gap-2 text-center text-xs">
      {Object.entries(trust).map(([name, value]) => (
        <div key={name} className="rounded border border-[#2A313A] bg-[#12161C] p-2">
          <div className="text-[#8A93A3]">{name}</div>
          <div className="font-bold">{value}</div>
        </div>
      ))}
    </section>
  );
}
