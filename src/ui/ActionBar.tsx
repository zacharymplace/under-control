"use client";

function scoreAction(action: string, game: any) {
  let score = 1;

  if (game.drift > 50 && action === "STABILIZE") score += 0.5;
  if (game.load > 80 && action === "REROUTE") score += 0.5;
  if ((game.signalClarity ?? game.signal) < 55 && action === "OBSERVE") score += 0.5;

  return score.toFixed(2);
}

export function ActionBar({ game }: { game: any }) {
  const actions = ["STABILIZE", "REROUTE", "OBSERVE"];

  return (
    <section>
      <div className="uc-action-grid">
        {actions.map((action) => (
          <button key={action} className="uc-action">
            <div className="uc-action-name">{action}</div>
            <div className="uc-action-score">score: {scoreAction(action, game)}</div>
          </button>
        ))}
      </div>

      <div className="uc-footer-note">
        Scores reflect current load, drift, and signal pressure.
      </div>
    </section>
  );
}
