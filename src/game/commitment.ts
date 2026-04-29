import { getDominantNeed } from "./dominantNeed";

export function getCommitmentScore(game: any) {
  const history = game.actionHistory || [];
  const need = getDominantNeed(game);

  if (!need || history.length < 3) return 1;

  let streak = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i] === need) streak++;
    else break;
  }

  if (streak >= 3) return 1.15;
  if (streak === 2) return 1;
  if (streak === 1) return 0.85;

  return 0.7;
}

export function getCommitmentLabel(game: any) {
  const score = getCommitmentScore(game);

  if (score >= 1.1) return "Strong commitment";
  if (score === 1) return "Stable commitment";
  if (score >= 0.85) return "Fragile commitment";

  return "Broken commitment";
}

export function getCommitmentInsight(game: any) {
  const history = game.actionHistory || [];
  const need = getDominantNeed(game);
  const score = getCommitmentScore(game);

  if (!need || history.length < 3 || score >= 1) return null;

  if (game.state === "STABILIZED") {
    return `Control was achieved under pressure. Execution was imperfect but sufficient: ${need}.`;
  }

  return `Correct strategy was identified but not sustained long enough: ${need}.`;
}
