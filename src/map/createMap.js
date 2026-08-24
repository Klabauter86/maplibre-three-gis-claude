import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_CONFIG, SOURCES } from './config.js';

// Mirrors MapLibre's official "3D Terrain" example:
// https://github.com/maplibre/maplibre-gl-js/blob/main/test/examples/3d-terrain.html
export function createMap(container = 'map') {
  const map = new maplibregl.Map({
    container,
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    pitch: MAP_CONFIG.pitch,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    maxPitch: MAP_CONFIG.maxPitch,
    hash: true,
    style: {
      version: 8,
      sources: {
        osm: SOURCES.osm,
        terrainSource: SOURCES.terrainSource,
        hillshadeSource: SOURCES.hillshadeSource,
      },
      layers: [
        { id: 'osm', type: 'raster', source: 'osm' },
        {
          id: 'hills',
          type: 'hillshade',
          source: 'hillshadeSource',
          layout: { visibility: 'visible' },
          paint: { 'hillshade-shadow-color': '#473B24' },
        },
      ],
      terrain: {
        source: 'terrainSource',
        exaggeration: MAP_CONFIG.terrainExaggeration,
      },
      sky: {},
    },
  });

  map.addControl(
    new maplibregl.NavigationControl({ visualizePitch: true, showZoom: true, showCompass: true }),
    'top-right',
  );
  map.addControl(
    new maplibregl.TerrainControl({ source: 'terrainSource', exaggeration: MAP_CONFIG.terrainExaggeration }),
    'top-right',
  );
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 140, unit: 'metric' }), 'bottom-right');
  return map;
}
