"use client";

import { useRef, useCallback } from "react";
import { Save, FolderOpen, Download, Image as ImageIcon } from "lucide-react";
import type { PixelCell } from "../ImageMaker";
import type { ShapeMode } from "@/lib/shapes";
import { randomShape } from "@/lib/shapes";
import { loadImageData, processImage } from "@/lib/imageProcessor";
import { buildSvgString, downloadSvg, downloadPng } from "@/lib/exportUtils";

interface Props {
  grid: PixelCell[][];
  setGrid: React.Dispatch<React.SetStateAction<PixelCell[][]>>;
  rows: number;
  cols: number;
  pixelSize: number;
  canvasWidth: number;
  canvasHeight: number;
  shapeMode: ShapeMode;
  showGrid: boolean;
  imageContrast: number;
  setImageContrast: (n: number) => void;
  imageLightness: number;
  setImageLightness: (n: number) => void;
  enabledColors: { color: string; enabled: boolean }[];
}

const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 6,
  display: "block",
};

const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  fontSize: 12,
  border: "1px solid var(--border)",
  borderRadius: 4,
  background: "white",
  color: "var(--text)",
  cursor: "pointer",
};

export function ImageTab({
  grid,
  setGrid,
  rows,
  cols,
  pixelSize,
  canvasWidth,
  canvasHeight,
  shapeMode,
  showGrid,
  imageContrast,
  setImageContrast,
  imageLightness,
  setImageLightness,
  enabledColors,
}: Props) {
  const imageFileRef = useRef<HTMLInputElement>(null);
  const svgFileRef = useRef<HTMLInputElement>(null);
  const storedImageData = useRef<ImageData | null>(null);

  // Quick Save / Load
  const handleSave = () => {
    try {
      localStorage.setItem("bbim-grid", JSON.stringify(grid));
      localStorage.setItem("bbim-meta", JSON.stringify({ pixelSize, canvasWidth, canvasHeight }));
    } catch {
      alert("Save failed — localStorage may be full.");
    }
  };

  const handleLoad = () => {
    try {
      const saved = localStorage.getItem("bbim-grid");
      if (saved) {
        const parsed = JSON.parse(saved) as PixelCell[][];
        setGrid(parsed);
      }
    } catch {
      alert("Load failed.");
    }
  };

  // Import Image
  const handleImageImport = useCallback(
    async (file: File) => {
      const imgData = await loadImageData(file);
      storedImageData.current = imgData;
      const palette = enabledColors.filter((c) => c.enabled).map((c) => c.color);
      const processed = processImage(
        imgData,
        cols,
        rows,
        imageContrast,
        imageLightness,
        shapeMode,
        palette.length > 0 ? palette : null
      );
      setGrid(
        processed.map((row, ri) =>
          row.map((cell, ci) => ({
            row: ri,
            col: ci,
            color: cell.color,
            shape: cell.shape,
            filled: true,
          }))
        )
      );
    },
    [cols, rows, imageContrast, imageLightness, shapeMode, enabledColors, setGrid]
  );

  // Re-process when contrast/lightness change
  const reprocessImage = useCallback(
    (contrast: number, lightness: number) => {
      if (!storedImageData.current) return;
      const palette = enabledColors.filter((c) => c.enabled).map((c) => c.color);
      const processed = processImage(
        storedImageData.current,
        cols,
        rows,
        contrast,
        lightness,
        shapeMode,
        palette.length > 0 ? palette : null
      );
      setGrid(
        processed.map((row, ri) =>
          row.map((cell, ci) => ({
            row: ri,
            col: ci,
            color: cell.color,
            shape: cell.shape,
            filled: true,
          }))
        )
      );
    },
    [cols, rows, shapeMode, enabledColors, setGrid]
  );

  // SVG Import (basic: parse rects/circles from SVG)
  const handleSvgImport = async (file: File) => {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "image/svg+xml");
    // Render SVG to canvas then process as image
    const svgBlob = new Blob([text], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      storedImageData.current = imgData;
      URL.revokeObjectURL(url);
      reprocessImage(imageContrast, imageLightness);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert("Failed to load SVG");
    };
    img.src = url;
  };

  // Export
  const handleExportSvg = () => {
    const svg = buildSvgString(grid, pixelSize, cols * pixelSize, rows * pixelSize, false);
    downloadSvg(svg);
  };

  const handleExportPng = (scale: number) => {
    const w = cols * pixelSize;
    const h = rows * pixelSize;
    const svg = buildSvgString(grid, pixelSize, w, h, false);
    downloadPng(svg, scale, w, h, `image-${scale}x.png`);
  };

  return (
    <div>
      {/* Quick Save */}
      <label style={sectionLabel}>Quick Save</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={handleSave} style={{ ...btnStyle, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Save size={14} /> Save
        </button>
        <button onClick={handleLoad} style={{ ...btnStyle, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <FolderOpen size={14} /> Load
        </button>
      </div>

      {/* Import */}
      <label style={sectionLabel}>Import</label>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <button onClick={() => svgFileRef.current?.click()} style={{ ...btnStyle, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <Download size={14} /> SVG
        </button>
        <button onClick={() => imageFileRef.current?.click()} style={{ ...btnStyle, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          <ImageIcon size={14} /> Image
        </button>
        <input
          ref={svgFileRef}
          type="file"
          accept=".svg"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleSvgImport(f);
            e.target.value = "";
          }}
        />
        <input
          ref={imageFileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleImageImport(f);
            e.target.value = "";
          }}
        />
      </div>

      {/* Contrast */}
      <label style={sectionLabel}>Image Contrast: {imageContrast}</label>
      <input
        type="range"
        min={-100}
        max={100}
        value={imageContrast}
        onChange={(e) => {
          const v = Number(e.target.value);
          setImageContrast(v);
          reprocessImage(v, imageLightness);
        }}
        style={{ width: "100%", marginBottom: 4 }}
      />
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 12px" }}>
        Adjust contrast of imported image
      </p>

      {/* Lightness */}
      <label style={sectionLabel}>Image Lightness: {imageLightness}</label>
      <input
        type="range"
        min={-100}
        max={100}
        value={imageLightness}
        onChange={(e) => {
          const v = Number(e.target.value);
          setImageLightness(v);
          reprocessImage(imageContrast, v);
        }}
        style={{ width: "100%", marginBottom: 4 }}
      />
      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 16px" }}>
        Adjust brightness of imported image
      </p>

      {/* Export */}
      <label style={sectionLabel}>Export</label>
      <button
        onClick={handleExportSvg}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: 13,
          fontWeight: 600,
          background: "var(--accent)",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        <Download size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> Download as SVG
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[2, 4, 8, 10].map((s) => (
          <button key={s} onClick={() => handleExportPng(s)} style={btnStyle}>
            PNG {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
