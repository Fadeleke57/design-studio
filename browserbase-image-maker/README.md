# Browserbase Image Maker

A pixel art tool that renders geometric shapes (circles, squares, and octagons) on an SVG canvas. Draw freehand, import images that get pixelated into shape grids, manage color palettes, and export your creations as SVG or PNG.

Inspired by the custom image tool built by [Family Style](https://wearefamilystyle.com/browserbase-project) for Browserbase as part of their brand identity work. The original tool was designed to let the Browserbase team generate on-brand imagery quickly, processing source images into a simplified, grid-based style with controls for shape, scale, contrast, and color.

**Live demo:** [design-studio-wheat.vercel.app](https://design-studio-wheat.vercel.app/)

## Features

### Drawing
- Click and drag to draw on an SVG grid canvas
- Shapes are randomly assigned per cell — circles, squares, and octagons
- Bresenham line interpolation for smooth strokes at any speed
- Adjustable brush size (1x1 through 5x5) with draw and eraser modes

### Pixel Size & Canvas
- 12 pixel size presets (2px to 50px) — smaller sizes create denser, more detailed grids
- Adjustable canvas height (200px to 1600px)
- Canvas width adapts to the available viewport
- Grid overlay toggle for precise placement

### Shape Modes
- **Random** — each cell gets a random circle, square, or octagon
- **Circles / Squares / Octagons** — uniform shape across all cells
- **Small Circles + Squares** — mixed at reduced scale

### Image Import & Pixelation
- Import any JPG or PNG image
- The image is sampled at grid resolution, mapping average colors to each cell
- Contrast and lightness sliders to adjust the imported image before pixelation
- Palette restrictions snap imported colors to the nearest enabled color

### Color Palettes
- Full-color or greyscale modes
- Color mode restrictions: full palette, one color, two colors, three colors, or custom selection
- 12 brand-inspired color swatches with individual enable/disable toggles
- "Apply to Existing Artwork" remaps current grid colors to the active palette

### Patterns
- One-click fill patterns: checkerboard, horizontal/vertical/diagonal stripes, random 50%, border, and fill all
- Patterns use the current drawing color and shape mode
- Clear all to reset the canvas

### Export
- **SVG** — clean vector output, resolution-independent
- **PNG** — export at 2x, 4x, 8x, or 10x scale
- Quick save/load to localStorage

## Tech Stack

- **Next.js 16** (App Router) with TypeScript
- **Tailwind CSS** for base styling
- **SVG** for rendering and export — no canvas dependency for the main view
- **Browser Canvas API** for image import processing and PNG export

Entirely client-side. No backend, no API routes, no database.

## Getting Started

```bash
cd browserbase-image-maker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start drawing.

## Project Structure

```
src/
  app/              — Next.js app router (page, layout, globals.css)
  components/
    ImageMaker.tsx  — main layout and state management
    PixelCanvas.tsx — SVG grid rendering and mouse interaction
    Sidebar.tsx     — controls panel with tab navigation
    tabs/           — Tools, Patterns, Color, Image, Video tab components
  lib/
    shapes.ts       — shape generation with seeded PRNG
    drawing.ts      — Bresenham line algorithm, brush area calculation
    colorUtils.ts   — color conversion, distance, contrast/lightness
    imageProcessor.ts — image-to-grid pixelation pipeline
    exportUtils.ts  — SVG/PNG export
    patterns.ts     — pattern fill algorithms
```

## License

MIT
