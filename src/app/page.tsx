export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "var(--paper)",
        color: "var(--ink)",
        padding: 24,
        fontFamily: "var(--font-body)",
      }}
    >
      <section
        style={{
          maxWidth: 920,
          margin: "0 auto",
          display: "grid",
          gap: 18,
        }}
      >
        <header
          style={{
            border: "1px solid var(--rule-strong)",
            background: "var(--paper)",
            borderRadius: 0,
            padding: 22,
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 2, fontFamily: "var(--font-display)" }}>UNDER CONTROL</div>
          <div style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 8 }}>
            Playable systems arena and telemetry review lab.
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          <a
            href="/playable-v01"
            style={{
              border: "1px solid var(--data)",
              background: "var(--data-tint)",
              color: "var(--ink)",
              borderRadius: 0,
              padding: 18,
              textDecoration: "none",
              display: "grid",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18, letterSpacing: 1.6 }}>PLAYABLE V0.1</span>
            <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>
              Run the systems arena, commit actions, export telemetry.
            </span>
          </a>

          <a
            href="/playtest-runs"
            style={{
              border: "1px solid var(--spot)",
              background: "var(--spot-tint)",
              color: "var(--ink)",
              borderRadius: 0,
              padding: 18,
              textDecoration: "none",
              display: "grid",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18, letterSpacing: 1.6 }}>PLAYTEST RUNS</span>
            <span style={{ color: "var(--ink-muted)", fontSize: 13 }}>
              Import exported run JSON files and compare balance patterns.
            </span>
          </a>
        </section>
      </section>
    </main>
  );
}
