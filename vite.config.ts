import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// Fully ESM / native-config-loader safe:
// - No `__dirname` (unsupported by Vite's planned `configLoader: 'native'`).
// - No `node:` built-in imports at all, so the config loads natively
//   without any transpilation step on Vercel.
export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        // Point '@' at the project root so imports like '@/src/...' and
        // '@/components/...' both resolve. `import.meta.dirname` is the
        // drop-in replacement for `__dirname` (Node >= 20.11).
        '@': import.meta.dirname,
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
