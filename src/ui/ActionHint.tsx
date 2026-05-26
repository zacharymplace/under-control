type ActionHintProps = {
  load?: number;
  drift?: number;
  signal?: number;
  pressure?: string;
};

export function ActionHint({
  load = 0,
  drift = 0,
  signal = 0,
  pressure,
}: ActionHintProps) {
  let hint = "";

  if (pressure === "CRITICAL" || pressure === "HIGH") {
    hint = "Pressure is high — delaying action increases failure risk.";
  } else if (drift > 50) {
    hint = "Drift is compounding — instability may cascade.";
  } else if (signal < 60) {
    hint = "Signal is weak — decisions may be unreliable.";
  } else if (load > 80) {
    hint = "Load is elevated — capacity is narrowing.";
  } else {
    hint = "System is balanced — timing matters more than action type.";
  }

  return <div className="mb-3 text-sm text-[#8A93A3]">{hint}</div>;
}
