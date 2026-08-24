// Mirrors MapLibre's official "3D Terrain" example:
// https://github.com/maplibre/maplibre-gl-js/blob/main/test/examples/3d-terrain.html
export const MAP_CONFIG = {
  center: [11.39085, 47.27574],
  zoom: 12,
  pitch: 70,
  minZoom: 3,
  maxZoom: 18,
  maxPitch: 85,
  terrainExaggeration: 1,
};

export const SOURCES = {
  osm: {
    type: 'raster',
    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    attribution: '© OpenStreetMap Contributors',
    maxzoom: 19,
  },
  // Separate sources for terrain and hillshade (same TileJSON) improves
  // render quality over sharing one source for both, per the official example.
  terrainSource: {
    type: 'raster-dem',
    url: 'https://tiles.mapterhorn.com/tilejson.json',
  },
  hillshadeSource: {
    type: 'raster-dem',
    url: 'https://tiles.mapterhorn.com/tilejson.json',
  },
};
