export function getSimpleFeedback(action: string, before: any, after: any) {
  if (action === "REROUTE") {
    return {
      result: "Load reduced, drift increased.",
      meaning: "Short-term relief is creating long-term instability.",
    };
  }

  if (action === "STABILIZE") {
    return {
      result: "Integrity improved, pressure continued rising.",
      meaning: "The structure is stronger, but the system is still under load.",
    };
  }

  if (action === "OBSERVE") {
    return {
      result: "Signal improved, time passed.",
      meaning: "You understand more, but the system kept degrading.",
    };
  }

  return {
    result: "Action processed.",
    meaning: "The system state has changed.",
  };
}
