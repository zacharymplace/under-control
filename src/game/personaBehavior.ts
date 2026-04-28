export type PersonaBehavior = {
  name: string;
  stressResponse: "WITHDRAWS" | "OVERSTRUCTURES" | "OVERWARNS";
  bias: "OBSERVE" | "STABILIZE" | "REROUTE";
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

export function getThreatLevel(game: any) {
  if (game.drift > 60 || game.load > 90) return "CRITICAL";
  if (game.drift > 40 || game.load > 75) return "HIGH";
  return "NORMAL";
}
