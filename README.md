# MapLibre 3D Terrain GIS

Starter project for a browser-based 3D terrain map using MapLibre GL JS and Vite.

## Current baseline

- OpenStreetMap raster basemap
- Mapterhorn Terrain Tiles (Terrarium DEM)
- MapLibre `raster-dem` terrain + hillshade
- On-screen diagnostics (WebGL check, tile-load counter, terrain elevation readout)
- Automatic terrain fallback: if terrain tiles don't arrive within 15s (e.g. blocked by a
  content/network filter), terrain is disabled and the app continues with a flat map
  instead of hanging
- GPX import: load a `.gpx` file via the "GPX laden" button, its track is drawn on the
  map and the view zooms in to it
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
│   └── createMap.js
├── gpx/
│   ├── parseGpx.js
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
