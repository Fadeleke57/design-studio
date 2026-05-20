"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Plus, Trash2, Replace } from "lucide-react";
import type { PixelCell, PaletteType, ColorMode } from "../ImageMaker";
import { BRAND_COLORS, hexToRgb, colorDistance, nearestColor, rgbToHex, toGreyscale } from "@/lib/colorUtils";

interface Props {
  paletteType: PaletteType;
  setPaletteType: (t: PaletteType) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  enabledColors: { color: string; enabled: boolean }[];
  setEnabledColors: (c: { color: string; enabled: boolean }[]) => void;
  grid: PixelCell[][];
  setGrid: React.Dispatch<React.SetStateAction<PixelCell[][]>>;
  drawingColor: string;
  setDrawingColor: (c: string) => void;
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
  drawingColor,
  setDrawingColor,
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

  const [newHex, setNewHex] = useState("#");

  const enableAll = () => setEnabledColors(enabledColors.map((c) => ({ ...c, enabled: true })));
  const disableAll = () => setEnabledColors(enabledColors.map((c) => ({ ...c, enabled: false })));

  const addCustomColor = () => {
    const hex = newHex.trim().toUpperCase();
    if (!/^#[0-9A-F]{6}$/.test(hex)) return;
    if (enabledColors.some((c) => c.color.toUpperCase() === hex)) return;
    setEnabledColors([...enabledColors, { color: hex, enabled: true }]);
    setNewHex("#");
  };

  const removeColor = (idx: number) => {
    setEnabledColors(enabledColors.filter((_, i) => i !== idx));
  };

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

  // Get the active palette colors for the current mode
  const getActivePalette = (): string[] => {
    const enabled = enabledColors.filter((c) => c.enabled).map((c) => c.color);
    if (colorMode === "full") return [];
    if (colorMode === "custom") return enabled;
    // one/two/three — take first N enabled colors
    const count = colorMode === "one" ? 1 : colorMode === "two" ? 2 : 3;
    return enabled.slice(0, count);
  };

  const activePalette = getActivePalette();

  // Distinct colors on canvas
  const distinctColors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of grid) {
      for (const cell of row) {
        if (cell.filled) {
          const upper = cell.color.toUpperCase();
          counts.set(upper, (counts.get(upper) ?? 0) + 1);
        }
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([color, count]) => ({ color, count }));
  }, [grid]);

  const [sourceColor, setSourceColor] = useState<string | null>(null);
  const [replaceColor, setReplaceColor] = useState("#000000");
  const [replaceRange, setReplaceRange] = useState(0);

  const handleReplace = () => {
    if (!sourceColor) return;
    const srcRgb = hexToRgb(sourceColor);
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => {
          if (!cell.filled) return cell;
          const dist = colorDistance(hexToRgb(cell.color), srcRgb);
          if (dist <= replaceRange) {
            return { ...cell, color: replaceColor.toUpperCase() };
          }
          return cell;
        })
      )
    );
  };

  // Count how many pixels would be affected
  const affectedCount = useMemo(() => {
    if (!sourceColor) return 0;
    const srcRgb = hexToRgb(sourceColor);
    let count = 0;
    for (const row of grid) {
      for (const cell of row) {
        if (cell.filled && colorDistance(hexToRgb(cell.color), srcRgb) <= replaceRange) {
          count++;
        }
      }
    }
    return count;
  }, [grid, sourceColor, replaceRange]);

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

      {/* Color Selection Grid — always visible */}
      <label style={sectionLabel}>Select Colors to Enable</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 8 }}>
        {enabledColors.map((c, i) => {
          const isCustom = !BRAND_COLORS.includes(c.color);
          const isLight = c.color === "#FFFFFF" || c.color === "#F5E6CA" || c.color === "#FFD700";
          return (
            <div key={i} style={{ position: "relative" }}>
              <button
                onClick={() => toggleColor(i)}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  background: c.color,
                  border: c.enabled
                    ? `3px solid var(--accent)`
                    : "2px solid var(--border)",
                  borderRadius: 4,
                  cursor: "pointer",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  opacity: c.enabled ? 1 : 0.4,
                }}
              >
                {!c.enabled && (
                  <X
                    size={18}
                    strokeWidth={3}
                    color={isLight ? "#666" : "white"}
                    style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
                  />
                )}
              </button>
              {isCustom && (
                <button
                  onClick={() => removeColor(i)}
                  title="Remove color"
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "1px solid var(--border)",
                    background: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <Trash2 size={9} color="#666" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
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

      {/* Add Custom Color */}
      <label style={sectionLabel}>Add Custom Color</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <input
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(newHex) ? newHex : "#000000"}
          onChange={(e) => setNewHex(e.target.value.toUpperCase())}
          style={{ width: 36, height: 28, border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", padding: 0 }}
        />
        <input
          type="text"
          value={newHex}
          onChange={(e) => setNewHex(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addCustomColor(); }}
          placeholder="#FF00AA"
          style={{
            flex: 1,
            padding: "4px 8px",
            fontSize: 12,
            border: "1px solid var(--border)",
            borderRadius: 4,
            fontFamily: "monospace",
          }}
        />
        <button
          onClick={addCustomColor}
          style={{
            padding: "4px 10px",
            fontSize: 12,
            border: "1px solid var(--border)",
            borderRadius: 4,
            background: "var(--accent)",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Pick drawing color from enabled palette */}
      {activePalette.length > 0 && (
        <>
          <label style={sectionLabel}>Draw with Color</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {activePalette.map((c, i) => (
              <button
                key={i}
                onClick={() => setDrawingColor(c)}
                style={{
                  width: 28,
                  height: 28,
                  background: c,
                  border: drawingColor === c ? "3px solid var(--accent)" : "1px solid var(--border)",
                  borderRadius: 4,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
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
          background: "var(--accent)",
          color: "white",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        Apply to Existing Artwork
      </button>

      {/* Color Replace */}
      <label style={sectionLabel}>Replace Color</label>
      {distinctColors.length === 0 ? (
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 12px" }}>
          No colors on canvas yet.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>
            Select a source color, set a tolerance range, then replace with a new color.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {distinctColors.map(({ color, count }) => (
              <button
                key={color}
                onClick={() => setSourceColor(color)}
                title={`${color} (${count} px)`}
                style={{
                  width: 28,
                  height: 28,
                  background: color,
                  border: sourceColor === color ? "3px solid var(--accent)" : "1px solid var(--border)",
                  borderRadius: 4,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {sourceColor && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 20, height: 20, background: sourceColor, border: "1px solid var(--border)", borderRadius: 3 }} />
                  <span style={{ fontSize: 11, fontFamily: "monospace" }}>{sourceColor}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>&rarr;</span>
                <input
                  type="color"
                  value={replaceColor}
                  onChange={(e) => setReplaceColor(e.target.value)}
                  style={{ width: 28, height: 20, border: "1px solid var(--border)", borderRadius: 3, cursor: "pointer", padding: 0 }}
                />
                <input
                  type="text"
                  value={replaceColor.toUpperCase()}
                  onChange={(e) => {
                    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setReplaceColor(e.target.value);
                  }}
                  style={{ width: 70, padding: "2px 6px", fontSize: 11, fontFamily: "monospace", border: "1px solid var(--border)", borderRadius: 3 }}
                />
              </div>

              <label style={{ ...sectionLabel, marginBottom: 4 }}>Tolerance: {replaceRange}</label>
              <input
                type="range"
                min={0}
                max={200}
                value={replaceRange}
                onChange={(e) => setReplaceRange(Number(e.target.value))}
                style={{ width: "100%", marginBottom: 4 }}
              />
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 8px" }}>
                0 = exact match only. Higher = includes similar colors. {affectedCount} pixel{affectedCount !== 1 ? "s" : ""} selected.
              </p>

              <button
                onClick={handleReplace}
                disabled={affectedCount === 0}
                style={{
                  width: "100%",
                  padding: "8px",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  background: affectedCount > 0 ? "var(--accent)" : "var(--border)",
                  color: "white",
                  cursor: affectedCount > 0 ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                <Replace size={14} /> Replace {affectedCount} pixel{affectedCount !== 1 ? "s" : ""}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
