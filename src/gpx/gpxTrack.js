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
