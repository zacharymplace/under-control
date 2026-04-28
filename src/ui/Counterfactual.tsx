"use client";

import { simulateAlternatePath } from "@/game/counterfactual";

export function Counterfactual({ game }: { game: any }) {
  if (game.state !== "FAILED") return null;

  const log = game.actionLog || [];
  if (log.length < 3) return null;

  // Pick turning point (same logic as replay)
  const breakIndex = log.findIndex(
    (e: any) => e.after?.load >= 95 || e.after?.drift >= 55
  );

  const idx = breakIndex >= 0 ? breakIndex : log.length - 2;

  const alt = simulateAlternatePath(game, idx, "REROUTE");
  if (!alt) return null;

  return (
    <section className="uc-counterfactual">
      <div className="uc-replay-kicker">Alternate Path</div>

      <div className="uc-counterfactual-main">
        If you had chosen <strong>{alt.alternate}</strong> on Turn {alt.turn}
      </div>

      <div className="uc-counterfactual-outcome">
        {alt.outcome}
      </div>

      <div className="uc-replay-deltas">
        <Delta label="Load" value={alt.deltas.load} />
        <Delta label="Drift" value={alt.deltas.drift} />
        <Delta label="Integrity" value={alt.deltas.integrity} invert />
        <Delta label="Signal" value={alt.deltas.signal} invert />
      </div>
    </section>
  );
}

function Delta({ label, value, invert = false }: any) {
  const good = invert ? value > 0 : value < 0;
  const bad = invert ? value < 0 : value > 0;

  const cls = good ? "good" : bad ? "bad" : "neutral";
  const sign = value > 0 ? "+" : "";

  return (
    <div className={`uc-delta ${cls}`}>
      {label}: {sign}
      {value}
    </div>
  );
}
