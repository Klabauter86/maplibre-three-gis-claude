import * as maplibregl from 'maplibre-gl';

const HOLD_MS = 500;
const CANCEL_THRESHOLD_PX = 8; // movement before activation cancels the long-press
const DEADZONE_PX = 6; // vertical offset after activation that still counts as "no speed"
const MAX_DEGREES_PER_SECOND = 180;
const MAX_OFFSET_PX = 200; // vertical offset (from the press point) for max speed

function rotateAround(point, anchor, angleRad) {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = point.x - anchor.x;
  const dy = point.y - anchor.y;
  return {
    x: anchor.x + dx * cos - dy * sin,
    y: anchor.y + dx * sin + dy * cos,
  };
}

// Long-press a point on the map to arm orbiting around it, then drag
// vertically to steer: up spins the view clockwise, down spins it
// counter-clockwise, and speed scales with how far up/down you've moved.
//
// The orbit math works in flat Mercator (world) coordinates and applies the
// result with a single jumpTo() per frame, rather than chaining
// easeTo({duration: 0, around}) or panBy() every frame — those route through
// MapLibre's full ease machinery and are too expensive/erratic to call at
// 60fps. jumpTo() still keeps terrain elevation live (MapLibre samples it
// once per call), so the 3D terrain stays fully active and rendered while
// orbiting.
export function enableOrbitOnLongPress(map) {
  const canvas = map.getCanvasContainer();

  let pressTimer = null;
  let startClientPos = null;
  let currentClientY = null;
  let anchorLngLat = null;
  let anchorMerc = null;
  let rafId = null;
  let lastFrameTime = null;
  let rotating = false;

  function clearPressTimer() {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  function stopRotation() {
    if (!rotating) return;
    rotating = false;
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    map.dragPan.enable();
    map.dragRotate.enable();
    map.touchZoomRotate.enable();
    map.getCanvas().style.cursor = '';
  }

  function tick(now) {
    if (!rotating) return;
    const dt = lastFrameTime == null ? 0 : (now - lastFrameTime) / 1000;
    lastFrameTime = now;

    const offset = currentClientY - startClientPos.y;
    const deadzoned = Math.abs(offset) <= DEADZONE_PX ? 0 : offset - Math.sign(offset) * DEADZONE_PX;
    const speedFraction = Math.max(-1, Math.min(1, deadzoned / (MAX_OFFSET_PX - DEADZONE_PX)));
    const degreesPerSecond = speedFraction * MAX_DEGREES_PER_SECOND;

    if (degreesPerSecond !== 0 && dt > 0) {
      const deltaBearingDeg = degreesPerSecond * dt;
      const nextBearing = map.getBearing() + deltaBearingDeg;

      const centerMerc = maplibregl.MercatorCoordinate.fromLngLat(map.getCenter());
      const angleRad = (deltaBearingDeg * Math.PI) / 180;
      const rotated = rotateAround(centerMerc, anchorMerc, angleRad);
      const newCenter = new maplibregl.MercatorCoordinate(rotated.x, rotated.y, centerMerc.z).toLngLat();

      map.jumpTo({ bearing: nextBearing, center: newCenter });
    }
    rafId = requestAnimationFrame(tick);
  }

  function startRotation(lngLat) {
    rotating = true;
    anchorLngLat = lngLat;
    anchorMerc = maplibregl.MercatorCoordinate.fromLngLat(lngLat);
    lastFrameTime = null;
    map.dragPan.disable();
    map.dragRotate.disable();
    map.touchZoomRotate.disable();
    map.getCanvas().style.cursor = 'ns-resize';
    rafId = requestAnimationFrame(tick);
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (rotating || pressTimer) return;

    startClientPos = { x: event.clientX, y: event.clientY };
    currentClientY = event.clientY;
    const rect = canvas.getBoundingClientRect();
    const lngLat = map.unproject([event.clientX - rect.left, event.clientY - rect.top]);

    pressTimer = setTimeout(() => {
      pressTimer = null;
      startRotation(lngLat);
    }, HOLD_MS);
  }

  function onPointerMove(event) {
    if (pressTimer && startClientPos) {
      const dx = event.clientX - startClientPos.x;
      const dy = event.clientY - startClientPos.y;
      if (Math.hypot(dx, dy) > CANCEL_THRESHOLD_PX) {
        clearPressTimer();
      }
      return;
    }
    if (rotating) {
      currentClientY = event.clientY;
    }
  }

  function onPointerUp() {
    clearPressTimer();
    stopRotation();
  }

  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerUp);
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
}
