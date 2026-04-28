export function detectDisagreement(suggestions: string[]) {
  const unique = new Set(suggestions);

  if (unique.size === 1) {
    return { level: "NONE", penalty: 0 };
  }

  if (unique.size === 2) {
    return { level: "MEDIUM", penalty: 0.15 };
  }

  return { level: "HIGH", penalty: 0.3 };
}
