export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function toGreyscale(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  return rgbToHex(grey, grey, grey);
}

export function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

export function nearestColor(target: RGB, palette: RGB[]): RGB {
  return palette.reduce((best, c) =>
    colorDistance(target, c) < colorDistance(target, best) ? c : best
  );
}

export function adjustContrast(r: number, g: number, b: number, contrast: number): [number, number, number] {
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  return [
    factor * (r - 128) + 128,
    factor * (g - 128) + 128,
    factor * (b - 128) + 128,
  ];
}

export function adjustLightness(r: number, g: number, b: number, lightness: number): [number, number, number] {
  const amount = (lightness / 100) * 255;
  return [r + amount, g + amount, b + amount];
}

export const BRAND_COLORS = [
  "#FF4500", "#E8383D", "#FF69B4", "#9B59B6",
  "#0000FF", "#1A1A2E", "#FFFFFF", "#F5E6CA",
  "#FFD700", "#00C853", "#FF8C00", "#000000",
];
