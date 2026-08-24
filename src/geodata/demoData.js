const DEFAULT_CENTER = [11.35, 47.55];

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function offsetLngLat(center, eastMeters, northMeters) {
  const [lng, lat] = center;
  const dLat = northMeters / 111_320;
  const dLng = eastMeters / (111_320 * Math.cos((lat * Math.PI) / 180));
  return [lng + dLng, lat + dLat];
}

export function createDemoNatureData({ treeCount = 650, rockCount = 100, center = DEFAULT_CENTER, seed = 42 } = {}) {
  const random = mulberry32(seed);
  const features = [];

  for (let i = 0; i < treeCount; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 1800;
    const coordinates = offsetLngLat(center, Math.cos(angle) * radius, Math.sin(angle) * radius);
    const species = random() < 0.48 ? 'spruce' : random() < 0.72 ? 'pine' : 'deciduous';
    const height = species === 'spruce' ? 13 + random() * 16 : 9 + random() * 15;

    features.push({
      type: 'Feature',
      properties: {
        kind: 'tree',
        species,
        height,
        crown: 0.72 + random() * 0.7,
        rotation: random() * 360,
      },
      geometry: { type: 'Point', coordinates },
    });
  }

  for (let i = 0; i < rockCount; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = Math.sqrt(random()) * 1600;
    const coordinates = offsetLngLat(center, Math.cos(angle) * radius, Math.sin(angle) * radius);
    features.push({
      type: 'Feature',
      properties: {
        kind: 'rock',
        height: 1.2 + random() * 4.5,
        scale: 0.7 + random() * 1.9,
        rotation: random() * 360,
      },
      geometry: { type: 'Point', coordinates },
    });
  }

  return { type: 'FeatureCollection', features };
}

export async function loadGeoJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`GeoJSON konnte nicht geladen werden: ${response.status}`);
  return response.json();
}
