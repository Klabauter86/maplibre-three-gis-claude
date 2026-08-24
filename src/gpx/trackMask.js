import buffer from '@turf/buffer';
import mask from '@turf/mask';

// Builds a polygon covering the whole world *except* a corridor around the
// track, so drawing it as an opaque fill hides the basemap/terrain shading
// everywhere outside that corridor.
export function buildTrackMask(trackFeature, radiusMeters = 400) {
  const buffered = buffer(trackFeature, radiusMeters, { units: 'meters' });
  return mask(buffered);
}
