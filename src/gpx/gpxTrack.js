import * as maplibregl from 'maplibre-gl';

const MASK_SOURCE_ID = 'gpx-mask';
const MASK_LAYER_ID = 'gpx-mask-fill';
const TRACK_SOURCE_ID = 'gpx-track';
const TRACK_LAYER_SOLID_ID = 'gpx-track-line-solid';
const TRACK_LAYER_DASHED_ID = 'gpx-track-line-dashed';

let waypointMarkers = [];
let segmentLabelMarkers = [];

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

// "Gehen" (walking) segments render dashed; everything else solid. Split
// into two layers because line-dasharray isn't data-driven per feature in
// MapLibre's style spec, only per layer.
export function showGpxTrack(map, geojson) {
  const source = map.getSource(TRACK_SOURCE_ID);
  if (source) {
    source.setData(geojson);
    return;
  }

  map.addSource(TRACK_SOURCE_ID, { type: 'geojson', data: geojson });
  map.addLayer({
    id: TRACK_LAYER_SOLID_ID,
    type: 'line',
    source: TRACK_SOURCE_ID,
    filter: ['!=', ['get', 'dashed'], true],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 4,
      'line-opacity': 0.9,
    },
  });
  map.addLayer({
    id: TRACK_LAYER_DASHED_ID,
    type: 'line',
    source: TRACK_SOURCE_ID,
    filter: ['==', ['get', 'dashed'], true],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 4,
      'line-opacity': 0.9,
      'line-dasharray': [0.3, 1.3],
    },
  });
}

// DOM-based labels (not a symbol layer, for the same glyphs-independence
// reason as waypoint labels) placed at each segment's midpoint vertex.
export function showSegmentLabels(map, features) {
  removeSegmentLabels();
  for (const feature of features) {
    const { name, color } = feature.properties;
    if (!name) continue;

    const el = document.createElement('div');
    el.className = 'gpx-segment-label';
    el.style.setProperty('--segment-color', color);
    el.textContent = name;

    const coordinates = feature.geometry.coordinates;
    const midpoint = coordinates[Math.floor((coordinates.length - 1) / 2)];
    const marker = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat(midpoint).addTo(map);
    segmentLabelMarkers.push(marker);
  }
}

function removeSegmentLabels() {
  for (const marker of segmentLabelMarkers) marker.remove();
  segmentLabelMarkers = [];
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
  for (const layerId of [TRACK_LAYER_SOLID_ID, TRACK_LAYER_DASHED_ID]) {
    if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
  for (const marker of segmentLabelMarkers) {
    marker.getElement().style.display = visible ? '' : 'none';
  }
}
