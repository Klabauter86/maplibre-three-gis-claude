import * as maplibregl from 'maplibre-gl';

const MASK_SOURCE_ID = 'gpx-mask';
const MASK_LAYER_ID = 'gpx-mask-fill';
const TRACK_SOURCE_ID = 'gpx-track';
const TRACK_LAYER_ID = 'gpx-track-line';

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
      'line-color': '#ff5a3d',
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

export function removeWaypoints() {
  for (const marker of waypointMarkers) marker.remove();
  waypointMarkers = [];
}

export function removeGpxTrackAndMask(map) {
  removeWaypoints();
  for (const [layerId, sourceId] of [
    [TRACK_LAYER_ID, TRACK_SOURCE_ID],
    [MASK_LAYER_ID, MASK_SOURCE_ID],
  ]) {
    if (map.getLayer(layerId)) map.removeLayer(layerId);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  }
}
