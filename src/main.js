import './styles.css';
import { createMap } from './map/createMap.js';
import { MAP_CONFIG, BASEMAP_STYLES } from './map/config.js';
import { applyBasemapStyle } from './map/basemap.js';
import { createStatus } from './ui/status.js';
import { parseGpxToGeoJSON } from './gpx/parseGpx.js';
import { showGpxTrack, showTrackMask, showWaypoints, removeGpxTrackAndMask } from './gpx/gpxTrack.js';
import { buildTrackMask } from './gpx/trackMask.js';
import { enableOrbitOnLongPress } from './map/orbitOnLongPress.js';

const status = createStatus();

const canvas = document.createElement('canvas');
const webgl2 = canvas.getContext('webgl2');
const webgl1 = webgl2 ? null : canvas.getContext('webgl');
if (!webgl2 && !webgl1) {
  status.set('Kein WebGL verfügbar – Browser/Gerät unterstützt kein WebGL', 'error');
  throw new Error('WebGL not available');
}

status.set(`Initialisiere 3D-GIS … (WebGL${webgl2 ? '2' : '1'} ok)`);

const map = createMap();
enableOrbitOnLongPress(map);

const tileCounts = { basemap: 0, terrainSource: 0 };
map.on('sourcedata', (event) => {
  if (event.sourceId && event.sourceId in tileCounts && event.tile) {
    tileCounts[event.sourceId] += 1;
  }
});

let started = false;

async function start(note) {
  if (started) return;
  started = true;

  await Promise.race([
    new Promise((resolve) => map.once('idle', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);

  status.set(note ?? 'Terrain geladen', note ? 'error' : 'ready');
}

map.once('load', () => start());

// isStyleLoaded() depends on every source's tiles being loaded, so it can
// go false again long after startup (e.g. terrain tiles retrying, or right
// after swapping the basemap) — and waiting on the public 'load' event a
// second time would hang forever, since it only ever fires once per map
// and itself waits on tile loading. 'style.load' is the right signal here:
// MapLibre fires it as soon as the style JSON is parsed and its
// sources/layers are registered, independent of whether any tile ever
// finishes loading, so it can't get stuck the way terrain-tile hangs get
// stuck (see the 15s fallback below).
let styleReady = false;
map.once('style.load', () => { styleReady = true; });

// Terrain (raster-dem) can hang indefinitely with zero tiles arriving and
// no error event — e.g. a network filter or content blocker silently
// dropping requests to the terrain host while normal raster tiles load
// fine. MapLibre's 'load' event waits on terrain, so without this
// fallback the app would be stuck on the initial status text forever.
setTimeout(() => {
  if (started) return;
  if (tileCounts.terrainSource === 0) {
    map.setTerrain(null);
    start(`Terrain deaktiviert – keine Kacheln nach 15s (basemap=${tileCounts.basemap} lud erfolgreich)`);
  } else {
    start(`Timeout nach 15s (basemap=${tileCounts.basemap}, terrain=${tileCounts.terrainSource})`);
  }
}, 15000);

map.on('error', (event) => {
  console.error(event.error ?? event);
  status.set('MapLibre-Fehler – Details in der Browser-Konsole', 'error');
});

async function ensureStyleLoaded() {
  if (styleReady) return;
  await new Promise((resolve) => map.once('style.load', resolve));
}

const resetButton = document.getElementById('reset-view');
resetButton?.addEventListener('click', () => {
  removeGpxTrackAndMask(map);
  map.easeTo({
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    pitch: MAP_CONFIG.pitch,
    bearing: 0,
    duration: 800,
  });
  resetButton.hidden = true;
  status.set('Ansicht zurückgesetzt', 'ready');
});

const basemapSelect = document.getElementById('basemap-select');
if (basemapSelect) {
  for (const style of BASEMAP_STYLES) {
    const option = document.createElement('option');
    option.value = style.id;
    option.textContent = style.label;
    basemapSelect.appendChild(option);
  }
  basemapSelect.value = BASEMAP_STYLES[0].id;
  basemapSelect.addEventListener('change', async () => {
    const style = BASEMAP_STYLES.find((candidate) => candidate.id === basemapSelect.value);
    if (!style) return;
    await ensureStyleLoaded();
    applyBasemapStyle(map, style);
    status.set(`Kartenstil: ${style.label}`, 'ready');
  });
}

const gpxInput = document.getElementById('gpx-input');
gpxInput?.addEventListener('change', async () => {
  const file = gpxInput.files?.[0];
  gpxInput.value = '';
  if (!file) return;

  try {
    const text = await file.text();
    const { geojson, waypoints, bounds } = parseGpxToGeoJSON(text);

    await ensureStyleLoaded();
    const trackMask = buildTrackMask(geojson.features[0]);
    showTrackMask(map, trackMask);
    showGpxTrack(map, geojson);
    showWaypoints(map, waypoints);
    map.fitBounds(bounds, { padding: 60, duration: 800 });
    if (resetButton) resetButton.hidden = false;

    status.set(`GPX-Track geladen: ${file.name}`, 'ready');
  } catch (error) {
    console.error(error);
    status.set(`GPX-Fehler: ${error.message}`, 'error');
  }
});
