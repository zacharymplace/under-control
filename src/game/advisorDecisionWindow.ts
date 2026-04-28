import { getDecisionWindow } from "./decisionWindow";

export function getAdvisorDecisionWindowNote(name: string, game: any) {
  const window = getDecisionWindow(game);
  if (window.state === "OPEN") return null;

  const key = name.toUpperCase();

  if (window.state === "COLLAPSED") {
    if (key === "ELENA") return "The window is closed. The signal must be acted on immediately.";
    if (key === "MARA") return "Control margin is gone. Only direct correction matters now.";
    if (key === "ISHAAN") return "Delay is no longer risk. It is consequence.";
  }

  if (window.state === "NARROWING") {
    if (key === "ELENA") return "The decision window is narrowing. Ambiguous reads are becoming costly.";
    if (key === "MARA") return "The system has less room for correction. Pick the control path.";
    if (key === "ISHAAN") return "Timing risk is rising. The wrong action will compound quickly.";
  }

  return null;
}
