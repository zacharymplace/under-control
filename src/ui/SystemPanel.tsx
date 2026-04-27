export function SystemPanel({ game }: any) {
  return (
    <section className="mb-3 rounded-lg border border-[#1F2630] bg-[#12161C] p-4">
      <h1 className="mb-1 font-semibold">{game.eventTitle}</h1>
      <p className="mb-4 text-sm text-[#8A93A3]">{game.eventSub}</p>

      <div className="space-y-1 text-sm">
        <div>Load: {game.load}</div>
        <div>Integrity: {game.integrity}</div>
        <div>
          Signal:{" "}
          <span className={game.signalClarity < 50 ? "text-[#D4A84F]" : ""}>
            {game.signalClarity} {game.signalClarity < 50 ? "⚠" : ""}
          </span>
        </div>
        {game.driftVisible && <div>Drift: {game.drift} rising</div>}
      </div>
    </section>
  );
}
