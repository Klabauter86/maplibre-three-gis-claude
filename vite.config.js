import { defineConfig } from 'vite';

// GitHub Pages serves this project under /maplibre-three-gis-claude/,
// so the build needs that base path baked into asset URLs.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/maplibre-three-gis-claude/' : '/',
});
