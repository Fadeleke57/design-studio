"use client";

import { useCallback, useRef } from "react";
import type { PixelCell } from "./ImageMaker";
import type { BrushType } from "./ImageMaker";
import type { ShapeMode } from "@/lib/shapes";
import { randomShape } from "@/lib/shapes";
import { octagonPoints } from "@/lib/shapes";
import { getLineCells, getBrushCells } from "@/lib/drawing";

interface Props {
  grid: PixelCell[][];
  setGrid: React.Dispatch<React.SetStateAction<PixelCell[][]>>;
  pixelSize: number;
  canvasWidth: number;
  canvasHeight: number;
  drawingColor: string;
  brushType: BrushType;
  brushSize: number;
  shapeMode: ShapeMode;
  showGrid: boolean;
}

export function PixelCanvas({
  grid,
  setGrid,
  pixelSize,
  canvasWidth,
  canvasHeight,
  drawingColor,
  brushType,
  brushSize,
  shapeMode,
  showGrid,
}: Props) {
  const isDrawing = useRef(false);
  const lastCell = useRef<[number, number] | null>(null);

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / pixelSize);
      const row = Math.floor(y / pixelSize);
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        return [row, col] as [number, number];
      }
      return null;
    },
    [pixelSize, rows, cols]
  );

  const paintCells = useCallback(
    (cells: [number, number][]) => {
      setGrid((prev) => {
        const next = prev.map((r) => [...r]);
        for (const [r, c] of cells) {
          const brushCells = getBrushCells(r, c, brushSize, rows, cols);
          for (const [br, bc] of brushCells) {
            if (brushType === "eraser") {
              next[br][bc] = { ...next[br][bc], filled: false };
            } else {
              next[br][bc] = {
                ...next[br][bc],
                filled: true,
                color: drawingColor,
                shape: next[br][bc].filled ? next[br][bc].shape : randomShape(shapeMode),
              };
            }
          }
        }
        return next;
      });
    },
    [setGrid, brushType, brushSize, drawingColor, shapeMode, rows, cols]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      isDrawing.current = true;
      const cell = getCellFromEvent(e);
      if (cell) {
        lastCell.current = cell;
        paintCells([cell]);
      }
    },
    [getCellFromEvent, paintCells]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing.current) return;
      const cell = getCellFromEvent(e);
      if (!cell) return;

      if (lastCell.current) {
        const lineCells = getLineCells(
          lastCell.current[0],
          lastCell.current[1],
          cell[0],
          cell[1]
        );
        paintCells(lineCells);
      } else {
        paintCells([cell]);
      }
      lastCell.current = cell;
    },
    [getCellFromEvent, paintCells]
  );

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    lastCell.current = null;
  }, []);

  const isSmallMode = pixelSize <= 5;

  return (
    <svg
      width={canvasWidth}
      height={canvasHeight}
      style={{ background: "white", cursor: "crosshair", display: "block" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {grid.map((row, ri) =>
        row.map((cell, ci) => {
          if (!cell.filled && !showGrid) return null;

          const cx = ci * pixelSize + pixelSize / 2;
          const cy = ri * pixelSize + pixelSize / 2;
          const fill = cell.filled ? cell.color : "white";
          const stroke = showGrid && !cell.filled ? "#e5e7eb" : "none";
          const strokeW = showGrid && !cell.filled ? (isSmallMode ? 0.25 : 0.5) : 0;

          if (cell.shape === "circle") {
            const r = pixelSize * 0.45;
            return (
              <circle
                key={`${ri}-${ci}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
              />
            );
          } else if (cell.shape === "square") {
            return (
              <rect
                key={`${ri}-${ci}`}
                x={ci * pixelSize}
                y={ri * pixelSize}
                width={pixelSize}
                height={pixelSize}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
              />
            );
          } else {
            const pts = octagonPoints(cx, cy, pixelSize * 0.45);
            return (
              <polygon
                key={`${ri}-${ci}`}
                points={pts}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeW}
              />
            );
          }
        })
      )}
    </svg>
  );
}
