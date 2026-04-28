"use client";

import { getDisagreementPenalty } from "@/game/disagreementScore";

function scoreAction(action: string, game: any, disagreementMultiplier: number) {
  let score = 1;

  const signal = game.signalClarity ?? game.signal ?? 0;

  if (game.drift > 50 && action === "STABILIZE") score += 0.5;
  if (game.load > 80 && action === "REROUTE") score += 0.5;
  if (signal < 55 && action === "OBSERVE") score += 0.5;

  return (score * disagreementMultiplier).toFixed(2);
}

export function ActionBar({ game }: { game: any }) {
  const actions = ["STABILIZE", "REROUTE", "OBSERVE"];
  const advisors = game.personas || [];
  const suggestions = advisors
    .map((advisor: any) => advisor.suggests || advisor.action || advisor.suggestion)
    .filter(Boolean);

  const disagreementMultiplier = getDisagreementPenalty(suggestions);

  const impact =
    disagreementMultiplier > 1
      ? "Aligned signal"
      : disagreementMultiplier < 1
      ? "Conflict detected"
      : "Partial disagreement";

  return (
    <section>
      <div className="uc-action-grid">
        {actions.map((action) => (
          <button key={action} className="uc-action" type="button">
            <div className="uc-action-name">{action}</div>
            <div className="uc-action-score">
              score: {scoreAction(action, game, disagreementMultiplier)}
            </div>
          </button>
        ))}
      </div>

      <div className="uc-footer-note">
        Alignment impact: {impact}
      </div>
      <div className="uc-footer-note">
        Scores reflect current load, drift, signal pressure, and team disagreement.
      </div>
    </section>
  );
}
