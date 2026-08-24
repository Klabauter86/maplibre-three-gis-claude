const SOURCE_ID = 'gpx-track';
const LAYER_ID = 'gpx-track-line';

export function showGpxTrack(map, geojson) {
  const source = map.getSource(SOURCE_ID);
  if (source) {
    source.setData(geojson);
    return;
  }

  map.addSource(SOURCE_ID, { type: 'geojson', data: geojson });
  map.addLayer({
    id: LAYER_ID,
    type: 'line',
    source: SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#ff5a3d',
      'line-width': 4,
      'line-opacity': 0.9,
    },
  });
}

// Pads a [[minLng, minLat], [maxLng, maxLat]] box so the restricted view
// covers some area *around* the track rather than clamping tight to it.
export function padBounds([[minLng, minLat], [maxLng, maxLat]], factor = 0.3) {
  const lngSpan = Math.max(maxLng - minLng, 0.01);
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const padLng = lngSpan * factor;
  const padLat = latSpan * factor;
  return [
    [minLng - padLng, minLat - padLat],
    [maxLng + padLng, maxLat + padLat],
  ];
}
