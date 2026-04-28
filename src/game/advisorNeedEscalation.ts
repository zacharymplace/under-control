import { getDominantNeed } from "./dominantNeed";
import { getNeedNeglectCount } from "./needNeglect";

export function getAdvisorNeedEscalation(name: string, game: any) {
  const need = getDominantNeed(game);
  const count = getNeedNeglectCount(game);

  if (!need || count < 2) return null;

  const key = name.toUpperCase();

  if (need === "REROUTE") {
    if (key === "ELENA") return "The dominant signal is load pressure. Continuing to delay is a misread.";
    if (key === "MARA") return "Structure is not the immediate problem. Load release is overdue.";
    if (key === "ISHAAN") return "Load is the failure vector. You are not addressing it.";
  }

  if (need === "STABILIZE") {
    if (key === "ELENA") return "The signal is no longer ambiguous. Instability needs correction.";
    if (key === "MARA") return "Structure is being exposed. Stabilization is overdue.";
    if (key === "ISHAAN") return "Drift is now the failure vector. You are not addressing it.";
  }

  if (need === "OBSERVE") {
    if (key === "ELENA") return "You do not have enough signal clarity to act cleanly.";
    if (key === "MARA") return "Acting without signal clarity is creating avoidable structural risk.";
    if (key === "ISHAAN") return "The risk is uncertainty itself. You need better signal.";
  }

  return null;
}
