export function detectFailurePattern(actions: string[]) {
  const last = actions.slice(-5);

  if (last.every(a => a === "STABILIZE")) {
    return {
      title: "Over-Stabilization",
      detail: "Repeated stabilization increased load without releasing pressure.",
      recommendation: "Reroute earlier to create capacity."
    };
  }

  if (last.every(a => a === "OBSERVE")) {
    return {
      title: "Over-Observation",
      detail: "You delayed action too long while pressure built.",
      recommendation: "Act earlier when pressure is rising."
    };
  }

  if (actions.filter(a => a === "REROUTE").length > actions.length * 0.6) {
    return {
      title: "Excessive Rerouting",
      detail: "Load was reduced, but instability compounded.",
      recommendation: "Stabilize intermittently to control drift."
    };
  }

  return {
    title: "General Instability",
    detail: "Multiple small inefficiencies compounded.",
    recommendation: "Balance actions earlier across signals."
  };
}
