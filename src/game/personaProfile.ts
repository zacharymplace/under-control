export type PersonaProfile = {
  name: string;
  temperament: "ANALYTICAL" | "STRUCTURAL" | "WATCHFUL";
  riskBias: "LOW" | "MEDIUM" | "HIGH";
  defaultActionBias: "OBSERVE" | "STABILIZE" | "REROUTE";
  trustSensitivity: number;
};

export const personaProfiles: Record<string, PersonaProfile> = {
  ELENA: {
    name: "ELENA",
    temperament: "ANALYTICAL",
    riskBias: "LOW",
    defaultActionBias: "OBSERVE",
    trustSensitivity: 1.15,
  },
  MARA: {
    name: "MARA",
    temperament: "STRUCTURAL",
    riskBias: "MEDIUM",
    defaultActionBias: "STABILIZE",
    trustSensitivity: 1,
  },
  ISHAAN: {
    name: "ISHAAN",
    temperament: "WATCHFUL",
    riskBias: "HIGH",
    defaultActionBias: "STABILIZE",
    trustSensitivity: 0.9,
  },
};

export function getPersonaProfile(name: string) {
  return personaProfiles[name];
}

export function applyProfileBias({
  profile,
  action,
  game,
}: {
  profile: PersonaProfile;
  action: string;
  game: any;
}) {
  if (!profile) return action;

  if (profile.name === "ELENA" && game.signalClarity < 65) return "OBSERVE";
  if (profile.name === "MARA" && game.integrity < 70) return "STABILIZE";
  if (profile.name === "ISHAAN" && (game.drift > 35 || game.load > 85)) return "STABILIZE";

  return action;
}

export function profileConfidenceAdjustment(profile: PersonaProfile, game: any) {
  if (!profile) return 0;

  if (profile.name === "ELENA" && game.signalClarity >= 70) return 1;
  if (profile.name === "MARA" && game.integrity <= 65) return 1;
  if (profile.name === "ISHAAN" && (game.drift >= 45 || game.load >= 90)) return 1;

  if (profile.name === "ELENA" && game.signalClarity < 45) return -1;
  if (profile.name === "MARA" && game.integrity > 85) return -1;
  if (profile.name === "ISHAAN" && game.drift < 20 && game.load < 75) return -1;

  return 0;
}

export function profileVoicePrefix(profile: PersonaProfile) {
  if (!profile) return "";

  if (profile.temperament === "ANALYTICAL") return "Reading the signal:";
  if (profile.temperament === "STRUCTURAL") return "From the structure:";
  if (profile.temperament === "WATCHFUL") return "Risk read:";

  return "";
}
