# MapLibre 3D Terrain GIS

Starter project for a browser-based 3D terrain map using MapLibre GL JS and Vite.

## Current baseline

- OpenStreetMap raster basemap
- Mapterhorn Terrain Tiles (Terrarium DEM)
- MapLibre `raster-dem` terrain + hillshade
- Automatic terrain fallback: if terrain tiles don't arrive within 15s (e.g. blocked by a
  content/network filter), terrain is disabled and the app continues with a flat map
  instead of hanging
- GPX import: load a `.gpx` file via the "GPX laden" button, its track is drawn on the
  map, the view zooms in to it, and the map/terrain outside a corridor around the
  track is masked out so only that area is visible; "Ansicht zurücksetzen" removes it
  and returns to the default view
- Long-press a point on the map to arm orbiting around it, then drag vertically to
  steer: up spins the view clockwise, down spins it counter-clockwise, speed scales
  with how far up/down you've moved; release to stop
- Vite development/build setup
- GitHub Codespaces/devcontainer port forwarding for port 5173

## Start locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite. The dev script binds to `0.0.0.0`, which also works well in Codespaces.

## Build

```bash
npm run build
npm run preview
```

## Architecture

```text
src/
├── map/
│   ├── config.js
│   ├── createMap.js
│   └── orbitOnLongPress.js
├── gpx/
│   ├── parseGpx.js
│   ├── trackMask.js
│   └── gpxTrack.js
├── ui/
│   └── status.js
├── main.js
└── styles.css
```

## Notes

OpenStreetMap's public tile server is suitable for light development/demo usage but not as a production tile backend for heavy traffic. Replace it with an appropriate production tile provider or self-hosted tiles before scaling up.

## Entwicklung nur mit dem iPhone

Siehe [IPHONE_SETUP.md](./IPHONE_SETUP.md) für den empfohlenen Workflow mit GitHub Codespaces und Safari.
