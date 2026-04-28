"use client";

export function StickyHud({ game }: { game: any }) {
  if (!game) return null;

  return (
    <section className="uc-sticky-hud">
      <div className="uc-hud-item">
        <span>Load</span>
        <strong>{game.load}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Integrity</span>
        <strong>{game.integrity}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Signal</span>
        <strong>{game.signalClarity ?? game.signal}</strong>
      </div>
      <div className="uc-hud-item">
        <span>Drift</span>
        <strong>{game.drift}</strong>
      </div>
      <div className="uc-hud-state">
        {game.state} · {game.pressure} · Turn {game.turn}
      </div>
    </section>
  );
}
