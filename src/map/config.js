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

// Texture draped over the 3D terrain relief. All of these are free, keyless
// XYZ raster tile services so they can be swapped at runtime for testing —
// the terrain (height data, above) stays on Mapterhorn regardless of choice.
export const BASEMAP_STYLES = [
  {
    id: 'osm',
    label: 'OpenStreetMap Standard',
    tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    attribution: '© OpenStreetMap Contributors',
    maxzoom: 19,
  },
  {
    id: 'opentopomap',
    label: 'OpenTopoMap (Topografie)',
    tiles: [
      'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
      'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
    ],
    tileSize: 256,
    attribution: 'Kartendaten: © OpenStreetMap-Mitwirkende, SRTM | Kartendarstellung: © OpenTopoMap (CC-BY-SA)',
    maxzoom: 17,
  },
  {
    id: 'esriImagery',
    label: 'Esri Satellit',
    tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
    tileSize: 256,
    attribution: '© Esri, Maxar, Earthstar Geographics',
    maxzoom: 19,
  },
  {
    id: 'cartoPositron',
    label: 'CARTO Positron (hell)',
    tiles: [
      'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    ],
    tileSize: 256,
    attribution: '© OpenStreetMap-Mitwirkende © CARTO',
    maxzoom: 20,
  },
  {
    id: 'cartoDark',
    label: 'CARTO Dark Matter (dunkel)',
    tiles: [
      'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    ],
    tileSize: 256,
    attribution: '© OpenStreetMap-Mitwirkende © CARTO',
    maxzoom: 20,
  },
];
