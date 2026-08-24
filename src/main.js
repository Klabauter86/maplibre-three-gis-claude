import './styles.css';
import { createMap } from './map/createMap.js';
import { createDemoNatureData, loadGeoJSON } from './geodata/demoData.js';
import { createNatureLayer } from './three/createNatureLayer.js';
import { createStatus } from './ui/status.js';

const status = createStatus();
const map = createMap();

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
  const data = await getNatureData();
  map.addLayer(createNatureLayer({ data, status }));
});

map.on('error', (event) => {
  console.error(event.error ?? event);
  status.set('MapLibre-Fehler – Details in der Browser-Konsole', 'error');
});
