export function getDecisionWindow(game: any) {
  const pressure = game.pressure ?? "LOW";
  const load = game.load ?? 0;
  const drift = game.drift ?? 0;
  const turn = game.turn ?? 1;

  if (pressure === "CRITICAL" || load >= 95 || drift >= 70) {
    return {
      state: "COLLAPSED",
      multiplier: 0.55,
      label: "Decision window collapsed",
      note: "The system is no longer tolerant of delayed or misaligned action.",
    };
  }

  if (pressure === "HIGH" || load >= 85 || drift >= 55 || turn >= 10) {
    return {
      state: "NARROWING",
      multiplier: 0.75,
      label: "Decision window narrowing",
      note: "Only strongly aligned actions remain effective.",
    };
  }

  if (load >= 70 || drift >= 40 || turn >= 6) {
    return {
      state: "COMPRESSED",
      multiplier: 0.9,
      label: "Decision window compressed",
      note: "Timing is beginning to matter.",
    };
  }

  return {
    state: "OPEN",
    multiplier: 1,
    label: "Decision window open",
    note: "The system still has room for adjustment.",
  };
}

export function getDecisionWindowPenalty(action: string, game: any) {
  const window = getDecisionWindow(game);
  const dominantNeed = game.primaryNeed || null;

  if (window.state === "OPEN") return 1;

  // If no dominant need exists, apply mild timing pressure only.
  if (!dominantNeed) return window.multiplier;

  // Aligned actions survive narrowing windows.
  if (action === dominantNeed) return 1;

  return window.multiplier;
}
