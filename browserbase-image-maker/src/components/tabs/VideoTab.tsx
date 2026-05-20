"use client";

export function VideoTab() {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "block" }}>
        Video Export
      </label>
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>
        Video recording and export functionality. Record your drawing session or animate the canvas.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          style={{
            padding: "8px 12px",
            fontSize: 12,
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "white",
            color: "var(--text-muted)",
            cursor: "not-allowed",
          }}
          disabled
        >
          🔴 Start Recording (Coming Soon)
        </button>
        <button
          style={{
            padding: "8px 12px",
            fontSize: 12,
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "white",
            color: "var(--text-muted)",
            cursor: "not-allowed",
          }}
          disabled
        >
          ⬇ Export as GIF (Coming Soon)
        </button>
      </div>
    </div>
  );
}
