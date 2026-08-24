const HOLD_MS = 500;
const CANCEL_THRESHOLD_PX = 8; // movement before activation cancels the long-press
const DEADZONE_PX = 6; // vertical offset after activation that still counts as "no speed"
const MAX_DEGREES_PER_SECOND = 180;
const MAX_OFFSET_PX = 200; // vertical offset (from the press point) for max speed

// Long-press a point on the map to arm orbiting around it, then drag
// vertically to steer: up spins the view clockwise, down spins it
// counter-clockwise, and speed scales with how far up/down you've moved.
//
// Rotating the *view* clockwise means the map's bearing must decrease:
// MapLibre's compass indicator rotates by -bearing (see NavigationControl),
// so increasing bearing sweeps the map content counter-clockwise on screen
// and decreasing it sweeps clockwise. Screen Y grows downward, so moving up
// produces a negative offset — that's why clockwise (bearing decreasing)
// pairs with a negative offset below.
//
// Each frame re-centers via map.easeTo({ around, duration: 0 }) rather than
// rotating the center manually in flat Mercator coordinates: easeTo's
// "around" handling goes through the transform's terrain-aware
// setLocationAtPoint, so the pressed point stays pinned to the correct
// screen position even as its terrain elevation changes along the orbit.
// duration: 0 makes easeTo apply instantly and synchronously (see
// Camera#_ease) instead of starting its own animation loop, so it's safe
// to call every requestAnimationFrame tick.
export function enableOrbitOnLongPress(map) {
  const canvas = map.getCanvasContainer();

  let pressTimer = null;
  let startClientPos = null;
  let currentClientY = null;
  let anchorLngLat = null;
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
      const nextBearing = map.getBearing() + degreesPerSecond * dt;
      map.easeTo({ bearing: nextBearing, around: anchorLngLat, duration: 0 });
    }
    rafId = requestAnimationFrame(tick);
  }

  function startRotation(lngLat) {
    rotating = true;
    anchorLngLat = lngLat;
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
