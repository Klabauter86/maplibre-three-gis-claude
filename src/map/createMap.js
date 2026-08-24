import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_CONFIG, SOURCES } from './config.js';

export function createMap(container = 'map') {
  const map = new maplibregl.Map({
    container,
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    pitch: MAP_CONFIG.pitch,
    bearing: MAP_CONFIG.bearing,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    canvasContextAttributes: { antialias: true },
    style: {
      version: 8,
      sources: {
        osm: SOURCES.osm,
        terrain: SOURCES.terrain,
      },
      layers: [
        {
          id: 'osm-base',
          type: 'raster',
          source: 'osm',
          paint: { 'raster-opacity': 0.92 },
        },
        {
          id: 'terrain-hillshade',
          type: 'hillshade',
          source: 'terrain',
          paint: {
            'hillshade-exaggeration': 0.22,
            'hillshade-shadow-color': '#263238',
          },
        },
      ],
      terrain: {
        source: 'terrain',
        exaggeration: MAP_CONFIG.terrainExaggeration,
      },
    },
  });

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  map.addControl(new maplibregl.ScaleControl({ maxWidth: 140, unit: 'metric' }), 'bottom-right');
  return map;
}
