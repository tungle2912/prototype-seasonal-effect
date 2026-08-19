import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],

  // Relative asset paths. GitHub Pages serves a project site from a subpath
  // (https://<user>.github.io/<repo>/), and './' makes the build work at any
  // subpath without hardcoding the repo name. Combined with HashRouter this
  // also means no server-side rewrite is needed for deep links.
  base: './',

  build: {
    outDir: 'dist',
    sourcemap: true,
    // Polaris is large; a 600 kB warning on a prototype tool is just noise.
    chunkSizeWarningLimit: 1500,
  },

  server: {
    port: 4321,
    strictPort: true,
  },

  preview: {
    port: 4322,
    strictPort: true,
  },
});
