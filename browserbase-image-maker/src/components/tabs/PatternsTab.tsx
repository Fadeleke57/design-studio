"use client";

import type { PixelCell } from "../ImageMaker";
import type { ShapeMode } from "@/lib/shapes";
import { randomShape } from "@/lib/shapes";
import { patterns } from "@/lib/patterns";

interface Props {
  setGrid: React.Dispatch<React.SetStateAction<PixelCell[][]>>;
  rows: number;
  cols: number;
  drawingColor: string;
  shapeMode: ShapeMode;
}

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12,
  border: "1px solid var(--border)",
  borderRadius: 4,
  background: "white",
  color: "var(--text)",
  cursor: "pointer",
  textAlign: "left",
};

export function PatternsTab({ setGrid, rows, cols, drawingColor, shapeMode }: Props) {
  const applyPattern = (key: string) => {
    const pattern = patterns[key];
    if (pattern) {
      setGrid(pattern.fn(rows, cols, drawingColor, shapeMode));
    }
  };

  const clearAll = () => {
    setGrid(
      Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          row,
          col,
          color: "#000000",
          shape: randomShape(shapeMode),
          filled: false,
        }))
      )
    );
  };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, display: "block" }}>
        Fill Patterns
      </label>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
        {Object.entries(patterns).map(([key, { label }]) => (
          <button key={key} onClick={() => applyPattern(key)} style={btnStyle}>
            {label}
          </button>
        ))}
      </div>
      <button
        onClick={clearAll}
        style={{
          ...btnStyle,
          width: "100%",
          background: "#fee2e2",
          color: "#991b1b",
          borderColor: "#fca5a5",
          textAlign: "center",
        }}
      >
        Clear All
      </button>
    </div>
  );
}
