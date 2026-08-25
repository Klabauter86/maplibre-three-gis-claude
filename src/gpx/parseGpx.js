export function parseGpxToGeoJSON(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Ungültige GPX-Datei (kein valides XML)');
  }

  // GPX has no per-segment name (only <trk><name>), so a segment's label
  // comes from its parent track's name — with a "(Teil N)" suffix if that
  // track has more than one <trkseg> — falling back to "Segment N" for an
  // unnamed track.
  const tracks = Array.from(doc.querySelectorAll('trk'));
  const segmentFeatures = [];
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const track of tracks) {
    const trackName = track.querySelector(':scope > name')?.textContent?.trim() || '';
    const segmentsInTrack = Array.from(track.querySelectorAll('trkseg'));

    segmentsInTrack.forEach((segment, indexInTrack) => {
      const points = Array.from(segment.querySelectorAll('trkpt'))
        .map((point) => [parseFloat(point.getAttribute('lon')), parseFloat(point.getAttribute('lat'))])
        .filter(([lng, lat]) => Number.isFinite(lng) && Number.isFinite(lat));

      if (points.length < 2) return;

      const segmentIndex = segmentFeatures.length;
      const name = trackName
        ? segmentsInTrack.length > 1
          ? `${trackName} (Teil ${indexInTrack + 1})`
          : trackName
        : `Segment ${segmentIndex + 1}`;

      segmentFeatures.push({
        type: 'Feature',
        properties: { segmentIndex, name },
        geometry: { type: 'LineString', coordinates: points },
      });
      for (const [lng, lat] of points) {
        if (lng < minLng) minLng = lng;
        if (lat < minLat) minLat = lat;
        if (lng > maxLng) maxLng = lng;
        if (lat > maxLat) maxLat = lat;
      }
    });
  }

  if (segmentFeatures.length === 0) {
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
    features: segmentFeatures,
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
