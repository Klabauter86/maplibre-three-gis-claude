export const MAP_CONFIG = {
  center: [11.35, 47.55],
  zoom: 12.8,
  pitch: 67,
  bearing: -18,
  minZoom: 3,
  maxZoom: 18,
  terrainExaggeration: 1,
};

export const SOURCES = {
  osm: {
    type: 'raster',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    attribution: '© OpenStreetMap contributors',
    maxzoom: 19,
  },
  terrain: {
    type: 'raster-dem',
    tiles: ['https://tiles.mapterhorn.com/{z}/{x}/{y}.webp'],
    tileSize: 512,
    encoding: 'terrarium',
    maxzoom: 14,
    attribution: 'Terrain: <a href="https://mapterhorn.com/attribution" target="_blank" rel="noopener">Mapterhorn</a>',
  },
};
