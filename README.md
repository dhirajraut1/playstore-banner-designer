# Flowbanner — Play Store Listing Banner Creator (React + Vite)

A client-side design tool for creating Google Play Store feature graphics and
screenshot banners, built with React, Vite, and [react-konva](https://konvajs.org/docs/react/index.html).

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

No backend, database, or auth — everything lives in the browser. Projects
autosave to `localStorage`.

## Project structure

```
src/
  constants.js              shared data: presets, palettes, single-screen templates, icon paths
  multiTemplates.js          multi-screen (up to 7) quick-start template generators
  state/store.jsx            React context + reducer, undo/redo history, autosave
  hooks/useHtmlImage.js       loads an <img> element from a data URL for Konva
  components/
    TopBar.jsx                app name, undo/redo, projects/preview/export
    LeftSidebar.jsx            Shapes / Text / Backgrounds / Device / Uploads / Templates
    RightSidebar.jsx            Properties panel + Layers panel
    CanvasStage.jsx             the live editable Konva stage
    CanvasObjectNode.jsx        renders one design object (shape/text/image/device)
    Filmstrip.jsx                the up-to-2-screen strip, with live thumbnails
    ExportHiddenStages.jsx      full-resolution offscreen stages used for PNG/ZIP export
    Modals.jsx                   export / projects / preview dialogs
  App.jsx                        layout + keyboard shortcuts
```

## Key features

- Up to **7 screens** per project
- **Sync across screens**: mark any object (logo, decoration, background flourish)
  as synced from the Properties panel, and it appears at the same position on
  every screen and updates everywhere the moment you edit it
- **Multi-screen quick-start templates**: generate a full set of screens (up to 7)
  in one click — each screen uses a different mix of shapes, icons, gradient
  types, and device tilt, tied together with a synced logo mark and consistent
  style. See `src/multiTemplates.js`.
- **Connect flow**: toggle in the filmstrip to make the background gradient
  flow continuously across every screen
- Shapes, icons, text (with shadow/outline/glow presets), phone & tablet device
  mockups with screenshot drop-in, image uploads
- **Tilt (3D perspective)**: every object has Tilt X / Tilt Y sliders (skew-based)
  plus one-click left/flat/right presets, for the angled-phone look
- Layers panel (lock/hide/duplicate/delete/reorder via Layers list)
- Undo/redo, keyboard shortcuts (Ctrl+Z/Y, Ctrl+D, Ctrl+C/V, Delete, arrows, +/-)
- Single-screen quick styles, plus a tilted-phone wallet-app template
- Export current screen or all screens as a ZIP, at 1×/2×/3×, PNG or JPG
- Duplicate a fully-designed screen from the filmstrip to build a matching set

## Deployment (Cloudflare Workers via GitHub Actions)

Flowbanner is configured to automatically deploy to **Cloudflare Workers** (with Static Assets) via GitHub Actions whenever changes are pushed to the `main` branch.

### Setting up GitHub Secrets:
In your GitHub repository, navigate to **Settings** → **Secrets and variables** → **Actions** and add:
1. `CLOUDFLARE_API_TOKEN` *(Required)*: A Cloudflare API token with **Account: Cloudflare Workers: Edit** permissions.
2. `CLOUDFLARE_ACCOUNT_ID` *(Optional)*: Your Cloudflare Account ID (found on the right sidebar of the Cloudflare dashboard).

### Manual or Local Deployment:
You can also deploy manually at any time using Wrangler:
```bash
pnpm run deploy
# or
npx wrangler deploy
```

## Notes / intentional scope

This is a focused rebuild of a larger spec. A few secondary features from the
original brief (object-level blur filter, rulers/smart guides, group/ungroup,
a large SVG icon/pattern library, tablet-specific chrome variants) were left
out to keep the codebase clean — happy to add any of them back on request.

