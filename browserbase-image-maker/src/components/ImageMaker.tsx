"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PixelCanvas } from "./PixelCanvas";
import { Sidebar } from "./Sidebar";
import { randomShape, setSeed, type ShapeMode, type ShapeType } from "@/lib/shapes";
import { hexToRgb, rgbToHex } from "@/lib/colorUtils";

export interface PixelCell {
  row: number;
  col: number;
  color: string;
  shape: ShapeType;
  filled: boolean;
}

export type BrushType = "draw" | "eraser";
export type PaletteType = "full-color" | "greyscale";
export type ColorMode = "full" | "one" | "two" | "three" | "custom";
export type TabName = "tools" | "patterns" | "color" | "image" | "video";

// Resample old grid into new dimensions by finding the dominant color
// in each new cell's covered area of the old grid
function resampleGrid(
  newRows: number,
  newCols: number,
  oldGrid: PixelCell[][],
  oldPixelSize: number,
  newPixelSize: number,
  shapeMode: ShapeMode
): PixelCell[][] {
  const oldRows = oldGrid.length;
  const oldCols = oldGrid[0]?.length ?? 0;
  if (oldRows === 0 || oldCols === 0) return buildEmptyGrid(newRows, newCols, shapeMode);

  setSeed(42);
  return Array.from({ length: newRows }, (_, row) =>
    Array.from({ length: newCols }, (_, col) => {
      // Find which old cells this new cell covers
      const newX0 = col * newPixelSize;
      const newY0 = row * newPixelSize;
      const newX1 = newX0 + newPixelSize;
      const newY1 = newY0 + newPixelSize;

      const oldColStart = Math.floor(newX0 / oldPixelSize);
      const oldColEnd = Math.min(Math.ceil(newX1 / oldPixelSize), oldCols);
      const oldRowStart = Math.floor(newY0 / oldPixelSize);
      const oldRowEnd = Math.min(Math.ceil(newY1 / oldPixelSize), oldRows);

      // Count colors in covered area
      const colorCounts = new Map<string, number>();
      let filledCount = 0;
      let totalCount = 0;

      for (let or = oldRowStart; or < oldRowEnd; or++) {
        for (let oc = oldColStart; oc < oldColEnd; oc++) {
          if (or >= 0 && or < oldRows && oc >= 0 && oc < oldCols) {
            totalCount++;
            const oldCell = oldGrid[or][oc];
            if (oldCell.filled) {
              filledCount++;
              colorCounts.set(oldCell.color, (colorCounts.get(oldCell.color) ?? 0) + 1);
            }
          }
        }
      }

      // If majority of covered area was filled, fill with dominant color
      if (filledCount > 0 && filledCount >= totalCount * 0.3) {
        let dominantColor = "#000000";
        let maxCount = 0;
        for (const [color, count] of colorCounts) {
          if (count > maxCount) {
            maxCount = count;
            dominantColor = color;
          }
        }
        return {
          row, col,
          color: dominantColor,
          shape: randomShape(shapeMode),
          filled: true,
        };
      }

      return {
        row, col,
        color: "#000000",
        shape: randomShape(shapeMode),
        filled: false,
      };
    })
  );
}

function buildEmptyGrid(rows: number, cols: number, shapeMode: ShapeMode): PixelCell[][] {
  setSeed(42);
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      color: "#000000",
      shape: randomShape(shapeMode),
      filled: false,
    }))
  );
}

const PIXEL_SIZES = [2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export function ImageMaker() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [containerHeight, setContainerHeight] = useState(800);
  const [pixelSize, setPixelSize] = useState(20);
  const canvasSize = Math.min(containerWidth, containerHeight);
  const canvasWidth = canvasSize;
  const canvasHeight = canvasSize;
  const [activeTab, setActiveTab] = useState<TabName>("tools");
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [colorHistory, setColorHistory] = useState<string[]>(["#000000", "#FFFFFF"]);
  const [brushType, setBrushType] = useState<BrushType>("draw");
  const [brushSize, setBrushSize] = useState(1);
  const [shapeMode, setShapeMode] = useState<ShapeMode>("random");
  const [showGrid, setShowGrid] = useState(true);
  const [paletteType, setPaletteType] = useState<PaletteType>("full-color");
  const [colorMode, setColorMode] = useState<ColorMode>("full");
  const [enabledColors, setEnabledColors] = useState<{ color: string; enabled: boolean }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("bbim-colors");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [imageContrast, setImageContrast] = useState(0);
  const [imageLightness, setImageLightness] = useState(0);

  useEffect(() => {
    try { localStorage.setItem("bbim-colors", JSON.stringify(enabledColors)); } catch {}
  }, [enabledColors]);

  const prevPixelSize = useRef(pixelSize);
  const cols = Math.floor(canvasWidth / pixelSize);
  const rows = Math.floor(canvasHeight / pixelSize);

  const [grid, setGrid] = useState<PixelCell[][]>(() => buildEmptyGrid(rows, cols, shapeMode));

  // Measure canvas container
  useEffect(() => {
    const measure = () => {
      if (canvasContainerRef.current) {
        const w = canvasContainerRef.current.clientWidth - 32;
        const h = canvasContainerRef.current.clientHeight - 32;
        if (w > 0) setContainerWidth(w);
        if (h > 0) setContainerHeight(h);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Rebuild grid when dimensions change — resample to preserve artwork
  useEffect(() => {
    const newCols = Math.floor(canvasWidth / pixelSize);
    const newRows = Math.floor(canvasHeight / pixelSize);
    const oldPS = prevPixelSize.current;
    prevPixelSize.current = pixelSize;
    setGrid((prev) => resampleGrid(newRows, newCols, prev, oldPS, pixelSize, shapeMode));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelSize, canvasHeight, canvasWidth]);

  const addToColorHistory = useCallback((color: string) => {
    setColorHistory((prev) => {
      if (prev.includes(color)) return prev;
      return [color, ...prev].slice(0, 12);
    });
  }, []);

  const handleSetDrawingColor = useCallback((color: string) => {
    setDrawingColor(color);
    addToColorHistory(color);
  }, [addToColorHistory]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "16px 24px 8px", flexShrink: 0 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Browserbase Image Maker</h1>
        <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: 13 }}>
          Draw with randomized circle and square pixels! Click or drag to create art.
        </p>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar
          pixelSize={pixelSize}
          setPixelSize={setPixelSize}
          pixelSizes={PIXEL_SIZES}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          drawingColor={drawingColor}
          setDrawingColor={handleSetDrawingColor}
          colorHistory={colorHistory}
          brushType={brushType}
          setBrushType={setBrushType}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          shapeMode={shapeMode}
          setShapeMode={setShapeMode}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          paletteType={paletteType}
          setPaletteType={setPaletteType}
          colorMode={colorMode}
          setColorMode={setColorMode}
          enabledColors={enabledColors}
          setEnabledColors={setEnabledColors}
          imageContrast={imageContrast}
          setImageContrast={setImageContrast}
          imageLightness={imageLightness}
          setImageLightness={setImageLightness}
          grid={grid}
          setGrid={setGrid}
          rows={rows}
          cols={cols}
          canvasWidth={canvasWidth}
        />
        <div
          ref={canvasContainerRef}
          style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <PixelCanvas
            grid={grid}
            setGrid={setGrid}
            pixelSize={pixelSize}
            canvasWidth={cols * pixelSize}
            canvasHeight={rows * pixelSize}
            drawingColor={drawingColor}
            brushType={brushType}
            brushSize={brushSize}
            shapeMode={shapeMode}
            showGrid={showGrid}
          />
        </div>
      </div>
    </div>
  );
}
