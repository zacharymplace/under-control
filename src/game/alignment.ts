type AdvisorSuggestion = {
  suggests?: string | null;
};

type AlignmentGameState = {
  personas?: AdvisorSuggestion[];
};

export function getAlignment(game: AlignmentGameState) {
  const suggestions = (game.personas || []).map((persona) => persona.suggests);

  const unique = new Set(suggestions);

  if (unique.size === 1) return "HIGH";
  if (unique.size === 2) return "MEDIUM";
  return "LOW";
}
