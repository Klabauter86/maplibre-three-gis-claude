// MapLibre GL JS ships its Web Worker as a separate file
// (maplibre-gl-worker.mjs) and resolves its URL at runtime relative to
// wherever the main library module was loaded from. Vite bundles our
// import into one JS file, so that relative lookup 404s and the worker
// silently never initializes — terrain/hillshade (raster-dem, which
// depends on the worker for DEM decoding) then hangs forever with zero
// tiles, while plain raster sources (no worker needed) load fine.
//
// Fix: copy the worker file into public/ so Vite serves it as a static
// asset, then point maplibregl.setWorkerUrl() at it (see createMap.js).
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, '..', 'node_modules', 'maplibre-gl', 'dist');
const destDir = join(here, '..', 'public');

mkdirSync(destDir, { recursive: true });
// The worker imports maplibre-gl-shared.mjs via a relative './' path, so
// it must live alongside it at the same served path.
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(join(distDir, file), join(destDir, file));
}
