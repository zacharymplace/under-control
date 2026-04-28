export function getActionFeedback(action: string, before: any, after: any) {
  const parts: string[] = [];

  if ((after.drift ?? 0) < (before.drift ?? 0)) {
    parts.push("reduced drift");
  }
  if ((after.drift ?? 0) > (before.drift ?? 0)) {
    parts.push("increased drift");
  }

  if ((after.load ?? 0) < (before.load ?? 0)) {
    parts.push("reduced load");
  }
  if ((after.load ?? 0) > (before.load ?? 0)) {
    parts.push("increased load");
  }

  if ((after.integrity ?? 0) > (before.integrity ?? 0)) {
    parts.push("improved integrity");
  }
  if ((after.integrity ?? 0) < (before.integrity ?? 0)) {
    parts.push("reduced integrity");
  }

  if ((after.signalClarity ?? 0) > (before.signalClarity ?? 0)) {
    parts.push("improved signal clarity");
  }

  if (!parts.length) {
    return `${action} caused no significant change`;
  }

  return `${action} ${parts.join(", ")}`;
}
