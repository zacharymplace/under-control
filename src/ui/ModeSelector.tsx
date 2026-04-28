import type { ScenarioId } from "@/game/scenarios";
import { scenarios } from "@/game/scenarios";

export function ModeSelector({
  scenarioId,
  onScenarioChange,
  disabled,
}: {
  scenarioId: ScenarioId;
  onScenarioChange: (id: ScenarioId) => void;
  disabled?: boolean;
}) {
  return (
    <section className="mb-3 rounded-lg border border-[#2A313A] bg-[#12161C] p-3">
      <div className="mb-2 text-xs uppercase tracking-widest text-[#8A93A3]">
        Mode
      </div>
      <select
        value={scenarioId}
        disabled={disabled}
        onChange={(e) => onScenarioChange(e.target.value as ScenarioId)}
        className="w-full border border-[#2A313A] bg-[#0B0D10] px-3 py-3 text-sm text-[#E6EAF0]"
      >
        {Object.values(scenarios).map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.label}
          </option>
        ))}
      </select>
    </section>
  );
}
