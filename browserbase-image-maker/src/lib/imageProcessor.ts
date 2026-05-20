import { adjustContrast, adjustLightness, rgbToHex, hexToRgb, nearestColor, type RGB } from "./colorUtils";
import { randomShape, type ShapeMode, type ShapeType } from "./shapes";

export interface ProcessedCell {
  color: string;
  shape: ShapeType;
}

export function processImage(
  imageData: ImageData,
  cols: number,
  rows: number,
  contrast: number,
  lightness: number,
  shapeMode: ShapeMode,
  palette: string[] | null
): ProcessedCell[][] {
  const { width, height, data } = imageData;
  const cellW = width / cols;
  const cellH = height / rows;
  const grid: ProcessedCell[][] = [];

  const paletteRgb: RGB[] | null = palette
    ? palette.map((c) => hexToRgb(c))
    : null;

  for (let row = 0; row < rows; row++) {
    const rowCells: ProcessedCell[] = [];
    for (let col = 0; col < cols; col++) {
      const x0 = Math.floor(col * cellW);
      const y0 = Math.floor(row * cellH);
      const x1 = Math.floor((col + 1) * cellW);
      const y1 = Math.floor((row + 1) * cellH);

      let rSum = 0, gSum = 0, bSum = 0, count = 0;
      for (let y = y0; y < y1 && y < height; y++) {
        for (let x = x0; x < x1 && x < width; x++) {
          const idx = (y * width + x) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          count++;
        }
      }

      if (count === 0) count = 1;
      let r = rSum / count;
      let g = gSum / count;
      let b = bSum / count;

      // Apply contrast
      if (contrast !== 0) {
        const contrastMapped = (contrast / 100) * 255;
        [r, g, b] = adjustContrast(r, g, b, contrastMapped);
      }

      // Apply lightness
      if (lightness !== 0) {
        [r, g, b] = adjustLightness(r, g, b, lightness);
      }

      r = Math.max(0, Math.min(255, Math.round(r)));
      g = Math.max(0, Math.min(255, Math.round(g)));
      b = Math.max(0, Math.min(255, Math.round(b)));

      let color = rgbToHex(r, g, b);

      if (paletteRgb) {
        const nearest = nearestColor({ r, g, b }, paletteRgb);
        color = rgbToHex(nearest.r, nearest.g, nearest.b);
      }

      rowCells.push({
        color,
        shape: randomShape(shapeMode),
      });
    }
    grid.push(rowCells);
  }

  return grid;
}

export function loadImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      resolve(data);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}
