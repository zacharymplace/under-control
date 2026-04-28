export function getAlignment(game: any) {
  const suggestions = (game.personas || []).map((p: any) => p.suggests);

  const unique = new Set(suggestions);

  if (unique.size === 1) return "HIGH";
  if (unique.size === 2) return "MEDIUM";
  return "LOW";
}
