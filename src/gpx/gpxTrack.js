const MASK_SOURCE_ID = 'gpx-mask';
const MASK_LAYER_ID = 'gpx-mask-fill';
const TRACK_SOURCE_ID = 'gpx-track';
const TRACK_LAYER_ID = 'gpx-track-line';

// Opaque fill hiding everything outside the track corridor. Must be added
// (or already exist) before the track line layer so the line stays drawn
// on top of it.
export function showTrackMask(map, maskGeojson) {
  const source = map.getSource(MASK_SOURCE_ID);
  if (source) {
    source.setData(maskGeojson);
    return;
  }

  map.addSource(MASK_SOURCE_ID, { type: 'geojson', data: maskGeojson });
  map.addLayer({
    id: MASK_LAYER_ID,
    type: 'fill',
    source: MASK_SOURCE_ID,
    paint: {
      'fill-color': '#111827',
      'fill-opacity': 1,
    },
  });
}

export function showGpxTrack(map, geojson) {
  const source = map.getSource(TRACK_SOURCE_ID);
  if (source) {
    source.setData(geojson);
    return;
  }

  map.addSource(TRACK_SOURCE_ID, { type: 'geojson', data: geojson });
  map.addLayer({
    id: TRACK_LAYER_ID,
    type: 'line',
    source: TRACK_SOURCE_ID,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': '#ff5a3d',
      'line-width': 4,
      'line-opacity': 0.9,
    },
  });
}
