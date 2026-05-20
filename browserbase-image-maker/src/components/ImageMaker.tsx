"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PixelCanvas } from "./PixelCanvas";
import { Sidebar } from "./Sidebar";
import { randomShape, setSeed, type ShapeMode, type ShapeType } from "@/lib/shapes";

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

function buildGrid(rows: number, cols: number, shapeMode: ShapeMode, oldGrid?: PixelCell[][]): PixelCell[][] {
  setSeed(42); // deterministic seed so SSR matches client
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      if (oldGrid && oldGrid[row]?.[col]) {
        return { ...oldGrid[row][col], row, col };
      }
      return {
        row,
        col,
        color: "#000000",
        shape: randomShape(shapeMode),
        filled: false,
      };
    })
  );
}

const PIXEL_SIZES = [2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

export function ImageMaker() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [pixelSize, setPixelSize] = useState(20);
  const [canvasHeight, setCanvasHeight] = useState(1136);
  const [activeTab, setActiveTab] = useState<TabName>("tools");
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [colorHistory, setColorHistory] = useState<string[]>(["#000000", "#FFFFFF"]);
  const [brushType, setBrushType] = useState<BrushType>("draw");
  const [brushSize, setBrushSize] = useState(1);
  const [shapeMode, setShapeMode] = useState<ShapeMode>("random");
  const [showGrid, setShowGrid] = useState(true);
  const [paletteType, setPaletteType] = useState<PaletteType>("full-color");
  const [colorMode, setColorMode] = useState<ColorMode>("full");
  const [enabledColors, setEnabledColors] = useState<{ color: string; enabled: boolean }[]>([]);
  const [imageContrast, setImageContrast] = useState(0);
  const [imageLightness, setImageLightness] = useState(0);

  const cols = Math.floor(canvasWidth / pixelSize);
  const rows = Math.floor(canvasHeight / pixelSize);

  const [grid, setGrid] = useState<PixelCell[][]>(() => buildGrid(rows, cols, shapeMode));

  // Measure canvas container
  useEffect(() => {
    const measure = () => {
      if (canvasContainerRef.current) {
        const w = canvasContainerRef.current.clientWidth;
        if (w > 0) setCanvasWidth(w);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Rebuild grid when dimensions change
  useEffect(() => {
    const newCols = Math.floor(canvasWidth / pixelSize);
    const newRows = Math.floor(canvasHeight / pixelSize);
    setGrid((prev) => buildGrid(newRows, newCols, shapeMode, prev));
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
          canvasHeight={canvasHeight}
          setCanvasHeight={setCanvasHeight}
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
          style={{ flex: 1, overflow: "auto", padding: 16 }}
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
