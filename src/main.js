import './styles.css';
import { createMap } from './map/createMap.js';
import { createDemoNatureData, loadGeoJSON } from './geodata/demoData.js';
import { createNatureLayer } from './three/createNatureLayer.js';
import { createStatus } from './ui/status.js';

const status = createStatus();
const terrainDebug = createStatus('terrain-debug');

const canvas = document.createElement('canvas');
const webgl2 = canvas.getContext('webgl2');
const webgl1 = webgl2 ? null : canvas.getContext('webgl');
if (!webgl2 && !webgl1) {
  status.set('Kein WebGL verfügbar – Browser/Gerät unterstützt kein WebGL', 'error');
  throw new Error('WebGL not available');
}

status.set(`Initialisiere 3D-GIS … (WebGL${webgl2 ? '2' : '1'} ok)`);

const map = createMap();

const tileCounts = { osm: 0, terrain: 0 };
map.on('sourcedata', (event) => {
  if (event.sourceId && event.sourceId in tileCounts && event.tile) {
    tileCounts[event.sourceId] += 1;
    terrainDebug.set(`Lade Kacheln … osm=${tileCounts.osm} terrain=${tileCounts.terrain}`);
  }
});

map.on('error', (event) => {
  if (event.sourceId === 'terrain') {
    terrainDebug.set(`Terrain-Fehler: ${event.error?.message ?? 'unbekannt'}`, 'error');
  }
});

async function getNatureData() {
  try {
    const external = await loadGeoJSON(`${import.meta.env.BASE_URL}data/example.geojson`);
    if (external?.features?.length) return external;
  } catch (error) {
    console.warn(error);
  }
  return createDemoNatureData();
}

let started = false;

async function start(note) {
  if (started) return;
  started = true;

  status.set('Terrain geladen · erzeuge Vegetation …');
  await Promise.race([
    new Promise((resolve) => map.once('idle', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);

  const center = map.getCenter();
  const elevation = map.queryTerrainElevation(center);
  const terrain = map.getTerrain();
  terrainDebug.set(
    `Terrain: ${terrain ? 'aktiv' : 'AUS'} · Elevation@Zentrum: ${
      elevation != null ? Math.round(elevation) + ' m' : 'null'
    } · pitch=${Math.round(map.getPitch())}°${note ? ` · ${note}` : ''}`,
    elevation ? 'ready' : 'error',
  );

  const data = await getNatureData();
  map.addLayer(createNatureLayer({ data, status }));
}

map.once('load', () => start());

// Terrain (raster-dem via AWS S3) can hang indefinitely with zero tiles
// arriving and no error event — e.g. an ad/content blocker silently
// dropping requests to amazonaws.com while normal raster tiles load fine.
// MapLibre's 'load' event waits on terrain, so without this fallback the
// app would be stuck on the initial status text forever.
setTimeout(() => {
  if (started) return;
  if (tileCounts.terrain === 0) {
    map.setTerrain(null);
    start(`Terrain deaktiviert – keine Kacheln nach 15s (osm=${tileCounts.osm} lud erfolgreich, evtl. Blocker auf amazonaws.com)`);
  } else {
    start(`Timeout nach 15s (osm=${tileCounts.osm}, terrain=${tileCounts.terrain})`);
  }
}, 15000);

map.on('error', (event) => {
  console.error(event.error ?? event);
  status.set('MapLibre-Fehler – Details in der Browser-Konsole', 'error');
});
