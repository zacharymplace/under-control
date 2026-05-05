"use client";

import { useMemo, useRef, useState } from "react";

type AdvisorSnapshot = {
  id?: string;
  name?: string;
  trust?: number;
  confidence?: number;
  state?: string;
};

type NodeSnapshot = {
  id?: string;
  label?: string;
  state?: string;
  pressure?: number;
  volatility?: number;
  integrity?: number;
  hiddenRisk?: number;
  observed?: boolean;
};

type EventSnapshot = {
  cycle?: number;
  tone?: string;
  message?: string;
};

type RunTelemetry = {
  schemaVersion?: string;
  exportedAt?: string;
  route?: string;
  scenario?: {
    id?: string;
    label?: string;
  };
  status?: string;
  cycleReached?: number;
  cyclesSurvived?: number;
  maxCycles?: number;
  score?: number;
  operatorProfile?: {
    name?: string;
    summary?: string;
  };
  finalState?: {
    integrity?: number;
    pressure?: number;
    cascadeRisk?: number;
    cascadeBreaches?: number;
    energy?: number;
  };
  actions?: {
    total?: number;
    observe?: number;
    reroute?: number;
    stabilize?: number;
    reckless?: number;
    observedBeforeCriticalAction?: number;
  };
  advisors?: AdvisorSnapshot[];
  nodes?: NodeSnapshot[];
  events?: EventSnapshot[];
};

type ImportedRun = {
  id: string;
  filename: string;
  importedAt: string;
  telemetry: RunTelemetry;
};

function safeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getStatusColor(status: string | undefined) {
  if (status === "won") return "#86efac";
  if (status === "lost") return "#fb7185";
  return "#fbbf24";
}

function getAverageTrust(run: RunTelemetry) {
  const advisors = run.advisors ?? [];

  if (advisors.length === 0) return 0;

  return Math.round(
    advisors.reduce((sum, advisor) => sum + safeNumber(advisor.trust), 0) / advisors.length
  );
}

function getCriticalNodeCount(run: RunTelemetry) {
  return (run.nodes ?? []).filter((node) => node.state === "critical").length;
}

function getMostUsedAction(run: RunTelemetry) {
  const observe = safeNumber(run.actions?.observe);
  const reroute = safeNumber(run.actions?.reroute);
  const stabilize = safeNumber(run.actions?.stabilize);

  const ranked = [
    { label: "OBSERVE", value: observe },
    { label: "REROUTE", value: reroute },
    { label: "STABILIZE", value: stabilize },
  ].sort((a, b) => b.value - a.value);

  return ranked[0].value > 0 ? ranked[0].label : "NONE";
}

function getActionTotal(run: RunTelemetry) {
  return safeNumber(run.actions?.total);
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.1 }}>
        {label}
      </div>
      <div style={{ color: "#f8fafc", fontSize: 14, marginTop: 3 }}>
        {value}
      </div>
    </div>
  );
}

function analyzeRuns(runs: ImportedRun[]) {
  if (runs.length === 0) {
    return ["Import one or more exported run JSON files to start reviewing balance."];
  }

  const wonRuns = runs.filter((run) => run.telemetry.status === "won").length;
  const lostRuns = runs.filter((run) => run.telemetry.status === "lost").length;

  const avgCycles = Math.round(
    runs.reduce((sum, run) => sum + safeNumber(run.telemetry.cyclesSurvived), 0) / runs.length
  );

  const avgScore = Math.round(
    runs.reduce((sum, run) => sum + safeNumber(run.telemetry.score), 0) / runs.length
  );

  const avgCascade = Math.round(
    runs.reduce((sum, run) => sum + safeNumber(run.telemetry.finalState?.cascadeRisk), 0) /
      runs.length
  );

  const avgCommitted = Math.round(
    runs.reduce((sum, run) => sum + getActionTotal(run.telemetry), 0) / runs.length
  );

  const notes = [
    `${runs.length} run${runs.length === 1 ? "" : "s"} loaded: ${wonRuns} won, ${lostRuns} lost.`,
    `Average cycles survived: ${avgCycles}. Average score: ${avgScore}.`,
    `Average committed actions: ${avgCommitted}. Average final cascade: ${avgCascade}%.`,
  ];

  if (runs.length >= 3 && lostRuns / runs.length > 0.7) {
    notes.push("Balance note: loss rate is high. Consider softening critical pressure growth or cascade penalties.");
  }

  if (runs.length >= 3 && wonRuns / runs.length > 0.7) {
    notes.push("Balance note: win rate is high. Consider increasing late-cycle pressure or critical persistence penalties.");
  }

  if (avgCommitted < 5 && avgCycles < 8) {
    notes.push("Behavior note: players may not understand when to act. Improve prompts or first-run guidance.");
  }

  if (avgCascade > 80) {
    notes.push("System note: cascade risk is ending very high. Add stronger tools to reduce cascade or warn earlier.");
  }

  return notes;
}

function RunCard({ run }: { run: ImportedRun }) {
  const telemetry = run.telemetry;
  const status = telemetry.status ?? "unknown";
  const statusColor = getStatusColor(status);
  const profile = telemetry.operatorProfile?.name ?? "Unclassified";
  const scenarioLabel = telemetry.scenario?.label ?? "Unknown Scenario";
  const avgTrust = getAverageTrust(telemetry);
  const criticalNodes = getCriticalNodeCount(telemetry);
  const mostUsedAction = getMostUsedAction(telemetry);

  return (
    <article
      style={{
        border: "1px solid rgba(148,163,184,0.24)",
        background: "rgba(15,23,42,0.74)",
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div
            style={{
              color: statusColor,
              fontSize: 11,
              letterSpacing: 1.6,
              textTransform: "uppercase",
            }}
          >
            {status}
          </div>
          <div style={{ color: "#f8fafc", fontSize: 17, marginTop: 4 }}>
            {profile}
          </div>
          <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
            {scenarioLabel} · {run.filename}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: 1.2 }}>
            SCORE
          </div>
          <div style={{ color: "#f8fafc", fontSize: 20 }}>
            {safeNumber(telemetry.score)}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          color: "#cbd5e1",
          fontSize: 12,
        }}
      >
        <Metric label="Scenario" value={scenarioLabel} />
        <Metric label="Cycles" value={safeNumber(telemetry.cyclesSurvived)} />
        <Metric label="Integrity" value={safeNumber(telemetry.finalState?.integrity) + "%"} />
        <Metric label="Cascade" value={safeNumber(telemetry.finalState?.cascadeRisk) + "%"} />
        <Metric label="Trust" value={avgTrust + "%"} />
        <Metric label="Actions" value={getActionTotal(telemetry)} />
        <Metric label="Main Action" value={mostUsedAction} />
        <Metric label="Reckless" value={safeNumber(telemetry.actions?.reckless)} />
        <Metric label="Critical Nodes" value={criticalNodes} />
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(148,163,184,0.18)",
          paddingTop: 10,
          color: "#94a3b8",
          fontSize: 12,
          lineHeight: 1.45,
        }}
      >
        {telemetry.operatorProfile?.summary ?? "No profile summary available."}
      </div>
    </article>
  );
}

export function RunTelemetryReview() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [runs, setRuns] = useState<ImportedRun[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastImportMessage, setLastImportMessage] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const sortedRuns = useMemo(() => {
    return [...runs].sort(
      (a, b) => safeNumber(b.telemetry.score) - safeNumber(a.telemetry.score)
    );
  }, [runs]);

  const analysis = useMemo(() => analyzeRuns(sortedRuns), [sortedRuns]);

  async function importFileList(files: FileList | File[]) {
    setError(null);
    setLastImportMessage(null);

    const fileArray = Array.from(files).filter((file) => file.name.endsWith(".json"));

    if (fileArray.length === 0) {
      setError("No JSON files selected. Export a run from /playable-v01, then import that JSON here.");
      return;
    }

    const imported: ImportedRun[] = [];
    const failed: string[] = [];

    for (const file of fileArray) {
      try {
        const text = await file.text();
        const telemetry = JSON.parse(text) as RunTelemetry;

        if (!telemetry || typeof telemetry !== "object") {
          throw new Error("Invalid telemetry object.");
        }

        imported.push({
          id: file.name + "-" + Date.now() + "-" + Math.random().toString(16).slice(2),
          filename: file.name,
          importedAt: new Date().toISOString(),
          telemetry,
        });
      } catch {
        failed.push(file.name);
      }
    }

    if (imported.length > 0) {
      setRuns((current) => [...imported, ...current]);
      setLastImportMessage(`Imported ${imported.length} run${imported.length === 1 ? "" : "s"}.`);
    }

    if (failed.length > 0) {
      setError(`Could not import: ${failed.join(", ")}.`);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 20%, rgba(14,116,144,0.12), transparent 32%), #020617",
        color: "#f8fafc",
        padding: 22,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: 16 }}>
        <header
          style={{
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(2,6,23,0.72)",
            borderRadius: 20,
            padding: 18,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 24, letterSpacing: 4 }}>PLAYTEST RUNS</div>
            <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 6 }}>
              Import exported Under Control run JSON files and compare balance patterns.
            </div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
              Source: export from <strong>/playable-v01</strong>, then import the downloaded JSON here.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: "1px solid rgba(103,232,249,0.5)",
                background: "rgba(8,47,73,0.45)",
                color: "#cffafe",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: "pointer",
                letterSpacing: 1.3,
                fontSize: 12,
              }}
            >
              IMPORT RUN JSON
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              multiple
              onChange={(event) => {
                if (event.currentTarget.files) {
                  importFileList(event.currentTarget.files);
                  event.currentTarget.value = "";
                }
              }}
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => setRuns([])}
              disabled={runs.length === 0}
              style={{
                border: "1px solid rgba(148,163,184,0.28)",
                background: "rgba(15,23,42,0.6)",
                color: runs.length === 0 ? "#64748b" : "#cbd5e1",
                borderRadius: 14,
                padding: "12px 14px",
                cursor: runs.length === 0 ? "not-allowed" : "pointer",
                letterSpacing: 1.2,
                fontSize: 12,
              }}
            >
              CLEAR
            </button>
          </div>
        </header>

        <section
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragActive(false);
            importFileList(event.dataTransfer.files);
          }}
          style={{
            border: "1px dashed " + (isDragActive ? "rgba(103,232,249,0.9)" : "rgba(103,232,249,0.38)"),
            background: isDragActive ? "rgba(8,47,73,0.42)" : "rgba(8,47,73,0.18)",
            borderRadius: 20,
            padding: 18,
            color: "#cbd5e1",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Drag exported run JSON files here, or use <strong>IMPORT RUN JSON</strong>. Loaded runs:{" "}
          <strong>{runs.length}</strong>.
        </section>

        {lastImportMessage && (
          <section
            style={{
              border: "1px solid rgba(134,239,172,0.36)",
              background: "rgba(20,83,45,0.22)",
              borderRadius: 16,
              padding: 14,
              color: "#bbf7d0",
              fontSize: 13,
            }}
          >
            {lastImportMessage}
          </section>
        )}

        {error && (
          <section
            style={{
              border: "1px solid rgba(251,113,133,0.45)",
              background: "rgba(127,29,29,0.22)",
              borderRadius: 16,
              padding: 14,
              color: "#fecdd3",
              fontSize: 13,
            }}
          >
            {error}
          </section>
        )}

        <section
          style={{
            border: "1px solid rgba(251,191,36,0.32)",
            background: "rgba(120,53,15,0.14)",
            borderRadius: 20,
            padding: 16,
          }}
        >
          <div
            style={{
              color: "#fde68a",
              fontSize: 12,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Balance Notes
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {analysis.map((note) => (
              <div key={note} style={{ color: "#e2e8f0", fontSize: 13 }}>
                {note}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 14,
          }}
        >
          {sortedRuns.map((run) => (
            <RunCard run={run} key={run.id} />
          ))}
        </section>
      </section>
    </main>
  );
}
