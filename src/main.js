import './styles.css';
import { createMap } from './map/createMap.js';
import { createStatus } from './ui/status.js';

const status = createStatus();
const terrainDebug = createStatus('terrain-debug');
const fetchDebug = createStatus('fetch-debug');

// Independent, direct fetch() of the terrain TileJSON — bypasses MapLibre
// entirely so a CORS rejection or network failure shows up as an explicit,
// on-screen error message instead of a silent hang inside the map's
// internal source-loading logic.
fetchDebug.set('Prüfe Terrain-Erreichbarkeit …');
fetch('https://tiles.mapterhorn.com/tilejson.json', { mode: 'cors' })
  .then((response) => {
    if (!response.ok) {
      fetchDebug.set(`Fetch-Test: HTTP ${response.status} ${response.statusText}`, 'error');
      return;
    }
    return response.json().then((json) => {
      fetchDebug.set(`Fetch-Test OK: tiles=${json.tiles?.[0] ?? '?'}`, 'ready');
    });
  })
  .catch((error) => {
    fetchDebug.set(`Fetch-Test FEHLER: ${error.name}: ${error.message}`, 'error');
  });

const canvas = document.createElement('canvas');
const webgl2 = canvas.getContext('webgl2');
const webgl1 = webgl2 ? null : canvas.getContext('webgl');
if (!webgl2 && !webgl1) {
  status.set('Kein WebGL verfügbar – Browser/Gerät unterstützt kein WebGL', 'error');
  throw new Error('WebGL not available');
}

status.set(`Initialisiere 3D-GIS … (WebGL${webgl2 ? '2' : '1'} ok)`);

const map = createMap();

const tileCounts = { osm: 0, terrainSource: 0 };
map.on('sourcedata', (event) => {
  if (event.sourceId && event.sourceId in tileCounts && event.tile) {
    tileCounts[event.sourceId] += 1;
    terrainDebug.set(`Lade Kacheln … osm=${tileCounts.osm} terrain=${tileCounts.terrainSource}`);
  }
});

map.on('error', (event) => {
  if (event.sourceId === 'terrainSource' || event.sourceId === 'hillshadeSource') {
    terrainDebug.set(`Terrain-Fehler: ${event.error?.message ?? 'unbekannt'}`, 'error');
  }
});

let started = false;

async function start(note) {
  if (started) return;
  started = true;

  status.set('Terrain geladen', 'ready');
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
}

map.once('load', () => start());

// Terrain (raster-dem) can hang indefinitely with zero tiles arriving and
// no error event — e.g. a network filter or content blocker silently
// dropping requests to the terrain host while normal raster tiles load
// fine. MapLibre's 'load' event waits on terrain, so without this
// fallback the app would be stuck on the initial status text forever.
setTimeout(() => {
  if (started) return;
  if (tileCounts.terrainSource === 0) {
    map.setTerrain(null);
    start(`Terrain deaktiviert – keine Kacheln nach 15s (osm=${tileCounts.osm} lud erfolgreich)`);
  } else {
    start(`Timeout nach 15s (osm=${tileCounts.osm}, terrain=${tileCounts.terrainSource})`);
  }
}, 15000);

map.on('error', (event) => {
  console.error(event.error ?? event);
  status.set('MapLibre-Fehler – Details in der Browser-Konsole', 'error');
});
