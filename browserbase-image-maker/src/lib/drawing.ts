// Bresenham line algorithm for smooth drawing interpolation
export function getLineCells(
  r0: number,
  c0: number,
  r1: number,
  c1: number
): [number, number][] {
  const cells: [number, number][] = [];
  let dr = Math.abs(r1 - r0);
  let dc = Math.abs(c1 - c0);
  const sr = r0 < r1 ? 1 : -1;
  const sc = c0 < c1 ? 1 : -1;
  let err = dr - dc;
  let r = r0;
  let c = c0;

  while (true) {
    cells.push([r, c]);
    if (r === r1 && c === c1) break;
    const e2 = 2 * err;
    if (e2 > -dc) {
      err -= dc;
      r += sr;
    }
    if (e2 < dr) {
      err += dr;
      c += sc;
    }
  }
  return cells;
}

// Get all cells in a brush area centered at (row, col)
export function getBrushCells(
  row: number,
  col: number,
  brushSize: number,
  maxRows: number,
  maxCols: number
): [number, number][] {
  const cells: [number, number][] = [];
  const offset = Math.floor(brushSize / 2);
  for (let dr = 0; dr < brushSize; dr++) {
    for (let dc = 0; dc < brushSize; dc++) {
      const r = row - offset + dr;
      const c = col - offset + dc;
      if (r >= 0 && r < maxRows && c >= 0 && c < maxCols) {
        cells.push([r, c]);
      }
    }
  }
  return cells;
}
