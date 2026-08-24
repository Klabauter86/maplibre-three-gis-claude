# MapLibre + Three.js 3D GIS

Starter project for a browser-based 3D GIS / landscape application using MapLibre GL JS, Three.js and Vite.

## Current baseline

- OpenStreetMap raster basemap
- AWS Terrain Tiles (Terrarium DEM)
- MapLibre `raster-dem` terrain + hillshade
- Three.js inside a MapLibre custom 3D layer using the same WebGL context
- Terrain-aware placement via `queryTerrainElevation()`
- GeoJSON point features for trees and rocks
- GPU instancing with `THREE.InstancedMesh`
- Procedural low-poly placeholder trees and rocks
- Vite development/build setup
- GitHub Codespaces/devcontainer port forwarding for port 5173

The app first tries `/public/data/example.geojson`. If that file has no features it generates approximately 650 trees and 100 rocks around the demo location.

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

## GeoJSON feature schema

Tree example:

```json
{
  "type": "Feature",
  "properties": {
    "kind": "tree",
    "species": "spruce",
    "height": 22,
    "crown": 1.1,
    "rotation": 145
  },
  "geometry": {
    "type": "Point",
    "coordinates": [11.35, 47.55]
  }
}
```

Rock example:

```json
{
  "type": "Feature",
  "properties": {
    "kind": "rock",
    "height": 3.5,
    "scale": 1.2,
    "rotation": 30
  },
  "geometry": {
    "type": "Point",
    "coordinates": [11.352, 47.551]
  }
}
```

## Roadmap

1. Validate terrain and geospatial alignment.
2. Replace procedural geometry with GLB/GLTF assets.
3. Preserve instancing by extracting reusable model geometry/materials.
4. Load real GeoJSON datasets.
5. Add forest polygon sampling.
6. Add species-aware models, dimensions and rotations.
7. Add rock polygon generation.
8. Spatial tiling, frustum/distance culling and LOD.
9. Integrate OSM paths/buildings, LiDAR, PMTiles/PostGIS.
10. Scale toward 100k+ vegetation instances.

## Architecture

```text
src/
├── map/
│   ├── config.js
│   └── createMap.js
├── three/
│   └── createNatureLayer.js
├── geodata/
│   └── demoData.js
├── ui/
│   └── status.js
├── main.js
└── styles.css
public/
├── data/
│   └── example.geojson
└── models/
```

## Notes

OpenStreetMap's public tile server is suitable for light development/demo usage but not as a production tile backend for heavy traffic. Replace it with an appropriate production tile provider or self-hosted tiles before scaling up.

## Entwicklung nur mit dem iPhone

Siehe [IPHONE_SETUP.md](./IPHONE_SETUP.md) für den empfohlenen Workflow mit GitHub Codespaces und Safari.
