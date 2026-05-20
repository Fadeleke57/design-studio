export type ShapeType = "circle" | "square" | "octagon";
export type ShapeMode = "random" | "circles" | "squares" | "octagons" | "smallCirclesSquares";

// Seeded PRNG (mulberry32) for deterministic shape assignment
let _seed = 1;
export function setSeed(s: number) { _seed = s; }
function seededRandom(): number {
  _seed |= 0;
  _seed = (_seed + 0x6d2b79f5) | 0;
  let t = Math.imul(_seed ^ (_seed >>> 15), 1 | _seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomShape(mode: ShapeMode): ShapeType {
  if (mode === "circles") return "circle";
  if (mode === "squares") return "square";
  if (mode === "octagons") return "octagon";
  if (mode === "smallCirclesSquares") {
    return seededRandom() < 0.5 ? "circle" : "square";
  }
  // random
  const r = seededRandom();
  if (r < 0.33) return "circle";
  if (r < 0.66) return "square";
  return "octagon";
}

export function octagonPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI / 8 + i * (Math.PI / 4);
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}
