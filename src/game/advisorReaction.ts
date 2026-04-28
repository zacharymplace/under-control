export function getAdvisorReactions(action: string, judgment: string | null) {
  if (!judgment) return {};

  return {
    ELENA: getElenaReaction(action, judgment),
    MARA: getMaraReaction(action, judgment),
    ISHAAN: getIshaanReaction(action, judgment),
  };
}

function getElenaReaction(action: string, judgment: string) {
  if (judgment.includes("Risky") || judgment.includes("Costly")) {
    return "That signal was readable. It should not have been misinterpreted.";
  }
  if (judgment.includes("Good")) {
    return "Clear read. That aligns with the signal.";
  }
  return "Signal was mixed. Confidence should have been adjusted.";
}

function getMaraReaction(action: string, judgment: string) {
  if (judgment.includes("Risky")) {
    return "Structure took on unnecessary strain.";
  }
  if (judgment.includes("Good")) {
    return "That maintained system integrity.";
  }
  if (judgment.includes("Mixed")) {
    return "Partial stabilization, but not sufficient.";
  }
  return "Structure response was inconsistent.";
}

function getIshaanReaction(action: string, judgment: string) {
  if (judgment.includes("Risky")) {
    return "Downside exposure increased. That was avoidable.";
  }
  if (judgment.includes("Good")) {
    return "Risk was managed appropriately.";
  }
  if (judgment.includes("Costly")) {
    return "Waiting introduced avoidable risk.";
  }
  return "Risk profile remains unstable.";
}
