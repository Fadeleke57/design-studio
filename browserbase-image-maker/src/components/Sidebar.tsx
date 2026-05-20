"use client";

import type { PixelCell, BrushType, PaletteType, ColorMode, TabName } from "./ImageMaker";
import type { ShapeMode } from "@/lib/shapes";
import { ToolsTab } from "./tabs/ToolsTab";
import { PatternsTab } from "./tabs/PatternsTab";
import { ColorTab } from "./tabs/ColorTab";
import { ImageTab } from "./tabs/ImageTab";
import { VideoTab } from "./tabs/VideoTab";

const TABS: TabName[] = ["tools", "patterns", "color", "image", "video"];

interface Props {
  pixelSize: number;
  setPixelSize: (n: number) => void;
  pixelSizes: number[];
  activeTab: TabName;
  setActiveTab: (t: TabName) => void;
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
  paletteType: PaletteType;
  setPaletteType: (t: PaletteType) => void;
  colorMode: ColorMode;
  setColorMode: (m: ColorMode) => void;
  enabledColors: { color: string; enabled: boolean }[];
  setEnabledColors: (c: { color: string; enabled: boolean }[]) => void;
  imageContrast: number;
  setImageContrast: (n: number) => void;
  imageLightness: number;
  setImageLightness: (n: number) => void;
  grid: PixelCell[][];
  setGrid: React.Dispatch<React.SetStateAction<PixelCell[][]>>;
  rows: number;
  cols: number;
  canvasWidth: number;
}

const sidebarStyle: React.CSSProperties = {
  width: 320,
  minWidth: 320,
  background: "var(--sidebar-bg)",
  borderRight: "1px solid var(--border)",
  padding: "16px",
  overflowY: "auto",
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
  color: "var(--text)",
};

export function Sidebar(props: Props) {
  const {
    pixelSize, setPixelSize, pixelSizes,
    activeTab, setActiveTab,
  } = props;

  return (
    <div style={sidebarStyle}>
      {/* Pixel Size */}
      <label style={labelStyle}>Pixel Size: {pixelSize}px</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 16 }}>
        {pixelSizes.map((s) => (
          <button
            key={s}
            onClick={() => setPixelSize(s)}
            style={{
              padding: "4px 0",
              fontSize: 12,
              border: "1px solid var(--border)",
              borderRadius: 4,
              background: s === pixelSize ? "var(--accent)" : "white",
              color: s === pixelSize ? "white" : "var(--text)",
              cursor: "pointer",
              fontWeight: s === pixelSize ? 700 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--border)",
          marginBottom: 16,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "6px 0",
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              borderRight: tab !== "video" ? "1px solid var(--border)" : "none",
              background: activeTab === tab ? "var(--accent)" : "white",
              color: activeTab === tab ? "white" : "var(--text)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "tools" && (
        <ToolsTab
          drawingColor={props.drawingColor}
          setDrawingColor={props.setDrawingColor}
          colorHistory={props.colorHistory}
          brushType={props.brushType}
          setBrushType={props.setBrushType}
          brushSize={props.brushSize}
          setBrushSize={props.setBrushSize}
          shapeMode={props.shapeMode}
          setShapeMode={props.setShapeMode}
          showGrid={props.showGrid}
          setShowGrid={props.setShowGrid}
        />
      )}
      {activeTab === "patterns" && (
        <PatternsTab
          setGrid={props.setGrid}
          rows={props.rows}
          cols={props.cols}
          drawingColor={props.drawingColor}
          shapeMode={props.shapeMode}
        />
      )}
      {activeTab === "color" && (
        <ColorTab
          paletteType={props.paletteType}
          setPaletteType={props.setPaletteType}
          colorMode={props.colorMode}
          setColorMode={props.setColorMode}
          enabledColors={props.enabledColors}
          setEnabledColors={props.setEnabledColors}
          grid={props.grid}
          setGrid={props.setGrid}
          drawingColor={props.drawingColor}
          setDrawingColor={props.setDrawingColor}
        />
      )}
      {activeTab === "image" && (
        <ImageTab
          grid={props.grid}
          setGrid={props.setGrid}
          rows={props.rows}
          cols={props.cols}
          pixelSize={props.pixelSize}
          canvasWidth={props.canvasWidth}
          canvasHeight={props.canvasWidth}
          shapeMode={props.shapeMode}
          showGrid={props.showGrid}
          imageContrast={props.imageContrast}
          setImageContrast={props.setImageContrast}
          imageLightness={props.imageLightness}
          setImageLightness={props.setImageLightness}
          enabledColors={props.enabledColors}
        />
      )}
      {activeTab === "video" && <VideoTab />}
    </div>
  );
}
