import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import path from 'path';
import { terser } from 'rollup-plugin-terser';

/**
 * Function to dynamically import vite-plugin-compression
 * to avoid direct dependency issues.
 */
const compression = (): PluginOption | PluginOption[] => {
  if (process.env.NODE_ENV === 'production') {
    return viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      deleteOriginFile: false,
      threshold: 10240, // Only compress files larger than 10KB
    });
  }
  return [];
};

/**
 * Configuration for Vite.js build tool.
 *
 * Defines plugins, aliases, build settings, and server options.
 */
export default defineConfig({
  /**
   * Array of Vite plugins to use.
   * Includes React plugin and, conditionally, compression plugin for production.
   */
  plugins: [
    react(),
    compression()
  ],
  /**
   * Resolver configuration.
   * Defines aliases to map import paths to directories.
   */
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  /**
   * Build options.
   * Configures the build process and output.
   */
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'; // all other vendor libs
          }
          return 'app';
        },
      },
    },
    /**
     * Adjust chunk size warning limit (in kilobytes).
     */
    chunkSizeWarningLimit: 700,
    /**
     * Minification options.
     * Uses Terser for minification with specific compression settings.
     */
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    /**
     * Assets directory.
     * Specifies the directory for output assets.
     */
    assetsDir: 'assets',
  },
  /**
   * Server options.
   * Configures the development server settings.
   */
  server: {
    /**
     * Enable network access to the development server.
     */
    host: true,
    /**
     * Port for the development server.
     * Attempts to use port 3000, and falls back to the next available port if unavailable.
     */
    port: 3000,
    hmr: {
      overlay: true
    }
  },
});