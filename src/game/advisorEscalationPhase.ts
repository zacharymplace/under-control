import { getPointOfNoReturn } from "./irreversibility";
import { getNeedNeglectCount } from "./needNeglect";

export function getAdvisorEscalationPhase(name: string, game: any) {
  const key = name.toUpperCase();
  const pointOfNoReturn = getPointOfNoReturn(game);
  const neglect = getNeedNeglectCount(game);

  if (pointOfNoReturn) {
    if (key === "ELENA") return "This is no longer a read. The signal has become a failure warning.";
    if (key === "MARA") return "Recovery margin is gone. Structural control is no longer enough.";
    if (key === "ISHAAN") return "You are past the safe decision window. Risk has become consequence.";
  }

  if (neglect >= 3) {
    if (key === "ELENA") return "This is no longer a suggestion. The dominant signal is being ignored.";
    if (key === "MARA") return "Correction is overdue. The system cannot absorb more delay.";
    if (key === "ISHAAN") return "Risk is compounding. You are running out of margin.";
  }

  return null;
}
