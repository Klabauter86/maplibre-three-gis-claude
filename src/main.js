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

let loaded = false;
map.once('load', () => {
  loaded = true;
});
setTimeout(() => {
  if (loaded) return;
  status.set(
    `Timeout: Karten-„load“ nach 15s nicht ausgelöst (Kacheln: osm=${tileCounts.osm}, terrain=${tileCounts.terrain}) – vermutlich hängende Netzwerk-Requests`,
    'error',
  );
}, 15000);

async function getNatureData() {
  try {
    const external = await loadGeoJSON(`${import.meta.env.BASE_URL}data/example.geojson`);
    if (external?.features?.length) return external;
  } catch (error) {
    console.warn(error);
  }
  return createDemoNatureData();
}

map.on('load', async () => {
  status.set('Terrain geladen · erzeuge Vegetation …');
  await new Promise((resolve) => map.once('idle', resolve));

  const center = map.getCenter();
  const elevation = map.queryTerrainElevation(center);
  const terrain = map.getTerrain();
  terrainDebug.set(
    `Terrain: ${terrain ? 'aktiv' : 'AUS'} · Elevation@Zentrum: ${
      elevation != null ? Math.round(elevation) + ' m' : 'null'
    } · pitch=${Math.round(map.getPitch())}°`,
    elevation ? 'ready' : 'error',
  );

  const data = await getNatureData();
  map.addLayer(createNatureLayer({ data, status }));
});

map.on('error', (event) => {
  console.error(event.error ?? event);
  status.set('MapLibre-Fehler – Details in der Browser-Konsole', 'error');
});
