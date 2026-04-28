"use client";

import { getDisagreementPenalty } from "@/game/disagreementScore";
import {
  buildWeightedSupport,
  getWeightedSupportMultiplier,
} from "@/game/personaConfidence";

function scoreAction(
  action: string,
  game: any,
  suggestions: string[],
  disagreementMultiplier: number
) {
  let score = 1;

  const signal = game.signalClarity ?? game.signal ?? 0;

  if (game.drift > 50 && action === "STABILIZE") score += 0.5;
  if (game.load > 80 && action === "REROUTE") score += 0.5;
  if (signal < 55 && action === "OBSERVE") score += 0.5;

  const weightedSupport = getWeightedSupportMultiplier(action, game);

  return (score * disagreementMultiplier * weightedSupport).toFixed(2);
}

function explainAction(action: string, game: any) {
  const signal = game.signalClarity ?? game.signal ?? 0;

  if (game.drift > 50 && action === "STABILIZE") {
    return "High drift favors stabilization";
  }

  if (game.load > 80 && action === "REROUTE") {
    return "High load favors reroute";
  }

  if (signal < 55 && action === "OBSERVE") {
    return "Low signal favors observation";
  }

  return "No strong signal advantage";
}

export function ActionBar({
  game,
  onAction,
  disabled = false,
}: {
  game: any;
  onAction?: (action: string) => void;
  disabled?: boolean;
}) {
  const actions = ["STABILIZE", "REROUTE", "OBSERVE"];
  const advisors = game.personas || [];

  const suggestions = advisors
    .map((a: any) => a.suggests || a.action || a.suggestion)
    .filter(Boolean);

  const disagreementMultiplier = getDisagreementPenalty(suggestions);
  const weightedSupport = buildWeightedSupport(game);

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
          <button
            key={action}
            className="uc-action"
            type="button"
            disabled={disabled}
            onClick={() => onAction?.(action)}
          >
            <div className="uc-action-name">{action}</div>
            <div className="uc-action-score">
              score: {scoreAction(
                action,
                game,
                suggestions,
                disagreementMultiplier
              )}
            </div>
            <div className="uc-action-score">
              support: {(weightedSupport[action] ?? 0).toFixed(2)}
            </div>
            <div className="uc-action-reason">{explainAction(action, game)}</div>
          </button>
        ))}
      </div>

      <div className="uc-footer-note">Alignment impact: {impact}</div>
      <div className="uc-footer-note">
        Scores reflect state pressure, disagreement, trust, ignored penalties,
        and confidence-weighted support.
      </div>
    </section>
  );
}
