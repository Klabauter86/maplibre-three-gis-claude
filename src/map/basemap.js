export function basemapSourceFromStyle(style) {
  const { id, label, ...source } = style;
  return { type: 'raster', ...source };
}

// Swaps the draped basemap texture at runtime by replacing its source+layer
// in place, re-inserting the layer right below the hillshade layer so
// terrain shading and any GPX track/mask layers stay on top.
export function applyBasemapStyle(map, style) {
  const beforeId = map.getLayer('hills') ? 'hills' : undefined;
  if (map.getLayer('basemap')) map.removeLayer('basemap');
  if (map.getSource('basemap')) map.removeSource('basemap');

  map.addSource('basemap', basemapSourceFromStyle(style));
  map.addLayer({ id: 'basemap', type: 'raster', source: 'basemap' }, beforeId);
}
