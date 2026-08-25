import * as maplibregl from 'maplibre-gl';

const MASK_SOURCE_ID = 'gpx-mask';
const MASK_LAYER_ID = 'gpx-mask-fill';
const TRACK_SOURCE_ID = 'gpx-track';
const TRACK_LAYER_ID = 'gpx-track-line';

// Cycled by segmentIndex % length so each <trkseg> gets a visually distinct
// color, making breaks/gaps in the recorded track obvious on the map.
const SEGMENT_COLORS = ['#ff5a3d', '#22d3ee', '#a3e635', '#f472b6', '#fbbf24', '#818cf8'];

let waypointMarkers = [];

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
      'line-color': [
        'match',
        ['%', ['get', 'segmentIndex'], SEGMENT_COLORS.length],
        ...SEGMENT_COLORS.flatMap((color, index) => [index, color]),
        SEGMENT_COLORS[0],
      ],
      'line-width': 4,
      'line-opacity': 0.9,
    },
  });
}

// DOM-based markers (not a symbol layer) so waypoint labels don't depend on
// the style having a `glyphs` font server configured.
export function showWaypoints(map, waypoints) {
  removeWaypoints();
  for (const waypoint of waypoints) {
    // anchor: 'bottom' pins the element's bottom edge to the coordinate, so
    // the dot (the actual point) must be the last child, with any label
    // stacked above it rather than below.
    const el = document.createElement('div');
    el.className = 'gpx-waypoint';
    if (waypoint.name) {
      const label = document.createElement('div');
      label.className = 'gpx-waypoint-label';
      label.textContent = waypoint.name;
      el.appendChild(label);
    }
    el.insertAdjacentHTML('beforeend', '<div class="gpx-waypoint-dot"></div>');

    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([waypoint.lng, waypoint.lat])
      .addTo(map);
    waypointMarkers.push(marker);
  }
}

function removeWaypoints() {
  for (const marker of waypointMarkers) marker.remove();
  waypointMarkers = [];
}

export function setWaypointsVisible(visible) {
  for (const marker of waypointMarkers) {
    marker.getElement().style.display = visible ? '' : 'none';
  }
}

export function setSegmentsVisible(map, visible) {
  if (!map.getLayer(TRACK_LAYER_ID)) return;
  map.setLayoutProperty(TRACK_LAYER_ID, 'visibility', visible ? 'visible' : 'none');
}
