"use client";

import { Pencil, Eraser } from "lucide-react";
import type { BrushType } from "../ImageMaker";
import type { ShapeMode } from "@/lib/shapes";

interface Props {
  drawingColor: string;
  setDrawingColor: (c: string) => void;
  colorHistory: string[];
  brushType: BrushType;
  setBrushType: (t: BrushType) => void;
  brushSize: number;
  setBrushSize: (n: number) => void;
  shapeMode: ShapeMode;
  setShapeMode: (m: ShapeMode) => void;
  showGrid: boolean;
  setShowGrid: (b: boolean) => void;
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
  color: "var(--text)",
};

const btnStyle = (active: boolean): React.CSSProperties => ({
  padding: "5px 12px",
  fontSize: 12,
  border: "1px solid var(--border)",
  borderRadius: 4,
  background: active ? "var(--accent)" : "white",
  color: active ? "white" : "var(--text)",
  cursor: "pointer",
  fontWeight: active ? 600 : 400,
});

const radioRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 4,
  fontSize: 12,
  cursor: "pointer",
};

export function ToolsTab({
  drawingColor,
  setDrawingColor,
  colorHistory,
  brushType,
  setBrushType,
  brushSize,
  setBrushSize,
  shapeMode,
  setShapeMode,
  showGrid,
  setShowGrid,
}: Props) {
  return (
    <div>
      {/* Drawing Color */}
      <label style={sectionLabel}>Drawing Color</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <input
          type="color"
          value={drawingColor}
          onChange={(e) => setDrawingColor(e.target.value)}
          style={{ width: 36, height: 28, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", padding: 0 }}
        />
        <input
          type="text"
          value={drawingColor.toUpperCase()}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(v)) setDrawingColor(v);
          }}
          style={{
            flex: 1,
            padding: "4px 8px",
            fontSize: 12,
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontFamily: "monospace",
          }}
        />
      </div>

      {/* Color Swatches */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 16 }}>
        {colorHistory.map((c, i) => (
          <button
            key={`${c}-${i}`}
            onClick={() => setDrawingColor(c)}
            style={{
              width: 24,
              height: 24,
              background: c,
              border: c === drawingColor ? "2px solid var(--accent)" : "1px solid var(--border)",
              borderRadius: 3,
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Brush Type */}
      <label style={sectionLabel}>Brush Type</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => setBrushType("draw")} style={{ ...btnStyle(brushType === "draw"), display: "flex", alignItems: "center", gap: 4 }}>
          <Pencil size={14} /> Draw
        </button>
        <button onClick={() => setBrushType("eraser")} style={{ ...btnStyle(brushType === "eraser"), display: "flex", alignItems: "center", gap: 4 }}>
          <Eraser size={14} /> Eraser
        </button>
      </div>

      {/* Brush Size */}
      <label style={sectionLabel}>Brush Size: {brushSize}x{brushSize}</label>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setBrushSize(s)} style={btnStyle(brushSize === s)}>
            {s}x{s}
          </button>
        ))}
      </div>

      {/* Shape Mode */}
      <label style={sectionLabel}>Shape Mode</label>
      <div style={{ marginBottom: 16 }}>
        {(
          [
            ["random", "Random"],
            ["circles", "Circles"],
            ["squares", "Squares"],
            ["octagons", "Octagons"],
            ["smallCirclesSquares", "Small Circles + Squares"],
          ] as [ShapeMode, string][]
        ).map(([mode, label]) => (
          <label key={mode} style={radioRow}>
            <input
              type="radio"
              name="shapeMode"
              checked={shapeMode === mode}
              onChange={() => setShapeMode(mode)}
              style={{ accentColor: "var(--accent)" }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Grid Toggle */}
      <label style={sectionLabel}>Grid</label>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setShowGrid(true)} style={btnStyle(showGrid)}>
          On
        </button>
        <button onClick={() => setShowGrid(false)} style={btnStyle(!showGrid)}>
          Off
        </button>
      </div>
    </div>
  );
}
