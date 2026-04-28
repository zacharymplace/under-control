export function getDefaultPersonas(game: any) {
  return [
    {
      name: "ELENA",
      role: "Signal",
      text:
        (game.signalClarity ?? game.signal ?? 0) < 55
          ? "Confidence is low."
          : "Signal is stable enough to act.",
      suggests: (game.signalClarity ?? game.signal ?? 0) < 55 ? "OBSERVE" : "REROUTE",
    },
    {
      name: "MARA",
      role: "Infrastructure",
      text:
        game.integrity < 70
          ? "Integrity is at risk."
          : "Structure can still be protected.",
      suggests: game.integrity < 70 ? "STABILIZE" : "REROUTE",
    },
    {
      name: "ISHAAN",
      role: "Risk",
      text:
        game.drift > 35 || game.load > 80
          ? "Instability is increasing."
          : "No immediate threat detected.",
      suggests: game.drift > 35 || game.load > 80 ? "STABILIZE" : "OBSERVE",
    },
  ];
}
