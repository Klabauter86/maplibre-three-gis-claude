export function parseGpxToGeoJSON(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Ungültige GPX-Datei (kein valides XML)');
  }

  const segments = Array.from(doc.querySelectorAll('trkseg'));
  const lineStrings = [];
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const segment of segments) {
    const points = Array.from(segment.querySelectorAll('trkpt'))
      .map((point) => [parseFloat(point.getAttribute('lon')), parseFloat(point.getAttribute('lat'))])
      .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

    if (points.length < 2) continue;
    lineStrings.push(points);
    for (const [lng, lat] of points) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  }

  if (lineStrings.length === 0) {
    throw new Error('Keine gültigen Track-Punkte (trkseg/trkpt) in der GPX-Datei gefunden');
  }

  const waypoints = Array.from(doc.querySelectorAll('wpt'))
    .map((wpt) => ({
      lng: parseFloat(wpt.getAttribute('lon')),
      lat: parseFloat(wpt.getAttribute('lat')),
      name: wpt.querySelector('name')?.textContent?.trim() || '',
    }))
    .filter((wp) => Number.isFinite(wp.lng) && Number.isFinite(wp.lat));

  for (const { lng, lat } of waypoints) {
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  const geojson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'MultiLineString', coordinates: lineStrings },
      },
    ],
  };

  return {
    geojson,
    waypoints,
    bounds: [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
  };
}
