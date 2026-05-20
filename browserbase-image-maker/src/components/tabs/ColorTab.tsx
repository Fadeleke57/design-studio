"use client";

import { useEffect } from "react";
import type { PixelCell, PaletteType, ColorMode } from "../ImageMaker";
import { BRAND_COLORS, hexToRgb, nearestColor, rgbToHex, toGreyscale } from "@/lib/colorUtils";

interface Props {
  paletteType: PaletteType;
  setPaletteType: (t: PaletteType) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  enabledColors: { color: string; enabled: boolean }[];
  setEnabledColors: (c: { color: string; enabled: boolean }[]) => void;
  grid: PixelCell[][];
  setGrid: React.Dispatch<React.SetStateAction<PixelCell[][]>>;
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

const radioRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 4,
  fontSize: 12,
  cursor: "pointer",
};

export function ColorTab({
  paletteType,
  setPaletteType,
  colorMode,
  setColorMode,
  enabledColors,
  setEnabledColors,
  grid,
  setGrid,
}: Props) {
  // Initialize enabled colors from brand colors
  useEffect(() => {
    if (enabledColors.length === 0) {
      setEnabledColors(BRAND_COLORS.map((c) => ({ color: c, enabled: true })));
    }
  }, [enabledColors.length, setEnabledColors]);

  const toggleColor = (idx: number) => {
    const next = [...enabledColors];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    setEnabledColors(next);
  };

  const enableAll = () => setEnabledColors(enabledColors.map((c) => ({ ...c, enabled: true })));
  const disableAll = () => setEnabledColors(enabledColors.map((c) => ({ ...c, enabled: false })));

  const applyToExisting = () => {
    const palette = enabledColors.filter((c) => c.enabled).map((c) => hexToRgb(c.color));
    if (palette.length === 0) return;

    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => {
          if (!cell.filled) return cell;
          let color = cell.color;
          if (paletteType === "greyscale") {
            color = toGreyscale(color);
          }
          const rgb = hexToRgb(color);
          const nearest = nearestColor(rgb, palette);
          return { ...cell, color: rgbToHex(nearest.r, nearest.g, nearest.b) };
        })
      )
    );
  };

  return (
    <div>
      {/* Palette Type */}
      <label style={sectionLabel}>Palette Type</label>
      <div style={{ marginBottom: 12 }}>
        {(["full-color", "greyscale"] as PaletteType[]).map((t) => (
          <label key={t} style={radioRow}>
            <input
              type="radio"
              name="paletteType"
              checked={paletteType === t}
              onChange={() => setPaletteType(t)}
              style={{ accentColor: "var(--accent)" }}
            />
            {t === "full-color" ? "Full-Color" : "Greyscale"}
          </label>
        ))}
      </div>

      {/* Color Mode */}
      <label style={sectionLabel}>Color Mode</label>
      <div style={{ marginBottom: 12 }}>
        {(
          [
            ["full", "Full Palette (All Colors)"],
            ["one", "One Color"],
            ["two", "Two Colors"],
            ["three", "Three Colors"],
            ["custom", "Custom Selection"],
          ] as [ColorMode, string][]
        ).map(([mode, label]) => (
          <label key={mode} style={radioRow}>
            <input
              type="radio"
              name="colorMode"
              checked={colorMode === mode}
              onChange={() => setColorMode(mode)}
              style={{ accentColor: "var(--accent)" }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* Color Selection Grid */}
      {colorMode === "custom" && (
        <>
          <label style={sectionLabel}>Select Colors to Enable</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
            {enabledColors.map((c, i) => (
              <button
                key={i}
                onClick={() => toggleColor(i)}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: c.color,
                  border: "2px solid var(--border)",
                  borderRadius: 4,
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                {!c.enabled && (
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: c.color === "#FFFFFF" || c.color === "#F5E6CA" || c.color === "#FFD700" ? "#666" : "white",
                      textShadow: "0 0 3px rgba(0,0,0,0.5)",
                    }}
                  >
                    ✕
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <button
              onClick={enableAll}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 11,
                border: "1px solid var(--border)",
                borderRadius: 4,
                background: "white",
                cursor: "pointer",
              }}
            >
              Enable All
            </button>
            <button
              onClick={disableAll}
              style={{
                flex: 1,
                padding: "5px 0",
                fontSize: 11,
                border: "1px solid var(--border)",
                borderRadius: 4,
                background: "white",
                cursor: "pointer",
              }}
            >
              Disable All
            </button>
          </div>
        </>
      )}

      {/* Apply to Existing */}
      <button
        onClick={applyToExisting}
        style={{
          width: "100%",
          padding: "8px",
          fontSize: 12,
          fontWeight: 600,
          border: "1px solid var(--border)",
          borderRadius: 4,
          background: "white",
          cursor: "pointer",
        }}
      >
        Apply to Existing Artwork
      </button>
    </div>
  );
}
