export type PersonaBehavior = {
  name: string;
  stressResponse: "WITHDRAWS" | "OVERSTRUCTURES" | "OVERWARNS";
  bias: "OBSERVE" | "STABILIZE" | "REROUTE";
};

type ThreatLevelGameState = {
  drift?: number;
  load?: number;
};

export const PERSONA_BEHAVIORS: Record<string, PersonaBehavior> = {
  ELENA: {
    name: "ELENA",
    stressResponse: "WITHDRAWS",
    bias: "OBSERVE",
  },
  MARA: {
    name: "MARA",
    stressResponse: "OVERSTRUCTURES",
    bias: "STABILIZE",
  },
  ISHAAN: {
    name: "ISHAAN",
    stressResponse: "OVERWARNS",
    bias: "STABILIZE",
  },
};

export function getThreatLevel(game: ThreatLevelGameState) {
  if ((game.drift ?? 0) > 60 || (game.load ?? 0) > 90) return "CRITICAL";
  if ((game.drift ?? 0) > 40 || (game.load ?? 0) > 75) return "HIGH";
  return "NORMAL";
}
