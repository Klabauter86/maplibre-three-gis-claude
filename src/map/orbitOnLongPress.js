const HOLD_MS = 500;
const MOVE_THRESHOLD_PX = 8;
const DEGREES_PER_SECOND = 30;

// Long-press a point on the map to orbit the view clockwise around it.
// Rotating the *view* clockwise means the map's bearing must decrease:
// MapLibre's compass indicator rotates by -bearing (see NavigationControl),
// so increasing bearing sweeps the map content counter-clockwise on screen
// and decreasing it sweeps clockwise.
export function enableOrbitOnLongPress(map) {
  const canvas = map.getCanvasContainer();

  let pressTimer = null;
  let startClientPos = null;
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
    const nextBearing = map.getBearing() - DEGREES_PER_SECOND * dt;
    map.easeTo({ bearing: nextBearing, around: anchorLngLat, duration: 0 });
    rafId = requestAnimationFrame(tick);
  }

  function startRotation(lngLat) {
    rotating = true;
    anchorLngLat = lngLat;
    lastFrameTime = null;
    map.dragPan.disable();
    map.dragRotate.disable();
    map.touchZoomRotate.disable();
    map.getCanvas().style.cursor = 'grabbing';
    rafId = requestAnimationFrame(tick);
  }

  function onPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;
    if (rotating || pressTimer) return;

    startClientPos = { x: event.clientX, y: event.clientY };
    const rect = canvas.getBoundingClientRect();
    const lngLat = map.unproject([event.clientX - rect.left, event.clientY - rect.top]);

    pressTimer = setTimeout(() => {
      pressTimer = null;
      startRotation(lngLat);
    }, HOLD_MS);
  }

  function onPointerMove(event) {
    if (!pressTimer || !startClientPos) return;
    const dx = event.clientX - startClientPos.x;
    const dy = event.clientY - startClientPos.y;
    if (Math.hypot(dx, dy) > MOVE_THRESHOLD_PX) {
      clearPressTimer();
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
