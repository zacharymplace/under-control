import { applyReactionTone, getPersonaReaction } from "./personaReaction";

type DefaultPersonasGameState = {
  signalClarity?: number;
  signal?: number;
  load?: number;
  integrity?: number;
  drift?: number;
  trust?: Record<string, number | undefined>;
  ignoredCounts?: Record<string, number | undefined>;
};

export function getDefaultPersonas(game: DefaultPersonasGameState) {
  const signal = game.signalClarity ?? game.signal ?? 0;
  const load = game.load ?? 0;
  const integrity = game.integrity ?? 0;
  const drift = game.drift ?? 0;

  const elenaReaction = getPersonaReaction("ELENA", game);
  const maraReaction = getPersonaReaction("MARA", game);
  const ishaanReaction = getPersonaReaction("ISHAAN", game);

  const elenaText =
    signal < 55
      ? "Confidence is low."
      : "Signal is stable enough to act.";

  const maraText =
    integrity < 70
      ? "Integrity is at risk."
      : "Structure can still be protected.";

  const ishaanText =
    drift > 35 || load > 80
      ? "Instability is increasing."
      : "No immediate threat detected.";

  return [
    {
      name: "ELENA",
      role: "Signal",
      mood: elenaReaction.mood,
      reactionNote: elenaReaction.note,
      text: applyReactionTone("ELENA", elenaText, elenaReaction),
      suggests: signal < 55 ? "OBSERVE" : "REROUTE",
    },
    {
      name: "MARA",
      role: "Infrastructure",
      mood: maraReaction.mood,
      reactionNote: maraReaction.note,
      text: applyReactionTone("MARA", maraText, maraReaction),
      suggests: integrity < 70 ? "STABILIZE" : "REROUTE",
    },
    {
      name: "ISHAAN",
      role: "Risk",
      mood: ishaanReaction.mood,
      reactionNote: ishaanReaction.note,
      text: applyReactionTone("ISHAAN", ishaanText, ishaanReaction),
      suggests: drift > 35 || load > 80 ? "STABILIZE" : "OBSERVE",
    },
  ];
}
