import type { PixelCell } from "@/components/ImageMaker";
import { randomShape, setSeed, type ShapeMode } from "./shapes";

type PatternFn = (
  rows: number,
  cols: number,
  color: string,
  shapeMode: ShapeMode
) => PixelCell[][];

function makeGrid(rows: number, cols: number, shapeMode: ShapeMode): PixelCell[][] {
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

export const patterns: Record<string, { label: string; fn: PatternFn }> = {
  checkerboard: {
    label: "Checkerboard",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if ((r + c) % 2 === 0) {
            grid[r][c].filled = true;
            grid[r][c].color = color;
          }
      return grid;
    },
  },
  horizontalStripes: {
    label: "H. Stripes",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        if (r % 2 === 0)
          for (let c = 0; c < cols; c++) {
            grid[r][c].filled = true;
            grid[r][c].color = color;
          }
      return grid;
    },
  },
  verticalStripes: {
    label: "V. Stripes",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (c % 2 === 0) {
            grid[r][c].filled = true;
            grid[r][c].color = color;
          }
      return grid;
    },
  },
  diagonalStripes: {
    label: "Diag. Stripes",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if ((r + c) % 3 === 0) {
            grid[r][c].filled = true;
            grid[r][c].color = color;
          }
      return grid;
    },
  },
  randomFill: {
    label: "Random 50%",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (Math.random() < 0.5) {
            grid[r][c].filled = true;
            grid[r][c].color = color;
          }
      return grid;
    },
  },
  border: {
    label: "Border",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
            grid[r][c].filled = true;
            grid[r][c].color = color;
          }
      return grid;
    },
  },
  fillAll: {
    label: "Fill All",
    fn: (rows, cols, color, mode) => {
      const grid = makeGrid(rows, cols, mode);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          grid[r][c].filled = true;
          grid[r][c].color = color;
        }
      return grid;
    },
  },
};
