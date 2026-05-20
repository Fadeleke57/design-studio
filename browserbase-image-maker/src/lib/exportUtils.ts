import type { PixelCell } from "@/components/ImageMaker";
import { octagonPoints } from "./shapes";

export function buildSvgString(
  grid: PixelCell[][],
  pixelSize: number,
  canvasWidth: number,
  canvasHeight: number,
  showGrid: boolean
): string {
  const lines: string[] = [];
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}" viewBox="0 0 ${canvasWidth} ${canvasHeight}">`
  );
  lines.push(`<rect width="${canvasWidth}" height="${canvasHeight}" fill="white"/>`);

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
      const cell = grid[row][col];
      if (!cell.filled && !showGrid) continue;

      const cx = col * pixelSize + pixelSize / 2;
      const cy = row * pixelSize + pixelSize / 2;
      const r = pixelSize / 2;
      const fill = cell.filled ? cell.color : "white";
      const stroke = showGrid && !cell.filled ? "#e5e7eb" : "none";
      const strokeW = showGrid && !cell.filled ? 0.5 : 0;

      if (cell.shape === "circle") {
        lines.push(
          `<circle cx="${cx}" cy="${cy}" r="${r * 0.9}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>`
        );
      } else if (cell.shape === "square") {
        lines.push(
          `<rect x="${col * pixelSize}" y="${row * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>`
        );
      } else {
        const pts = octagonPoints(cx, cy, r * 0.9);
        lines.push(
          `<polygon points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>`
        );
      }
    }
  }

  lines.push("</svg>");
  return lines.join("\n");
}

export function downloadSvg(svgString: string, filename: string = "image.svg") {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPng(
  svgString: string,
  scale: number,
  canvasWidth: number,
  canvasHeight: number,
  filename: string = "image.png"
) {
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasWidth * scale;
    canvas.height = canvasHeight * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };

  img.src = url;
}
