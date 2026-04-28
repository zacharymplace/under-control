import { getDecisionWindow } from "./decisionWindow";

export type PointOfNoReturn = {
  turn: number;
  load: number;
  drift: number;
  reason: string;
};

export function maybeMarkPointOfNoReturn(game: any): PointOfNoReturn | null {
  if (game.pointOfNoReturn) return game.pointOfNoReturn;

  const window = getDecisionWindow(game);

  if (window.state !== "COLLAPSED") return null;

  return {
    turn: game.turn ?? 1,
    load: game.load ?? 0,
    drift: game.drift ?? 0,
    reason: window.note,
  };
}
