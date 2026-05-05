export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 50% 20%, rgba(14,116,144,0.12), transparent 32%), #020617",
        color: "#f8fafc",
        padding: 24,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
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
            border: "1px solid rgba(148,163,184,0.22)",
            background: "rgba(2,6,23,0.72)",
            borderRadius: 22,
            padding: 22,
          }}
        >
          <div style={{ fontSize: 28, letterSpacing: 5 }}>UNDER CONTROL</div>
          <div style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>
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
              border: "1px solid rgba(103,232,249,0.42)",
              background: "rgba(8,47,73,0.36)",
              color: "#cffafe",
              borderRadius: 18,
              padding: 18,
              textDecoration: "none",
              display: "grid",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18, letterSpacing: 1.6 }}>PLAYABLE V0.1</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              Run the systems arena, commit actions, export telemetry.
            </span>
          </a>

          <a
            href="/playtest-runs"
            style={{
              border: "1px solid rgba(251,191,36,0.42)",
              background: "rgba(120,53,15,0.22)",
              color: "#fde68a",
              borderRadius: 18,
              padding: 18,
              textDecoration: "none",
              display: "grid",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18, letterSpacing: 1.6 }}>PLAYTEST RUNS</span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>
              Import exported run JSON files and compare balance patterns.
            </span>
          </a>
        </section>
      </section>
    </main>
  );
}
