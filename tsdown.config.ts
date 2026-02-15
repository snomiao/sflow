import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    // Main entry point
    index: 'src/index.ts',
    // Node stream utilities
    'lib/from-node-stream/index': 'src/lib/from-node-stream/index.ts',
    // D3 utilities
    'lib/d3/index': 'src/lib/d3/index.ts',
  },
  format: ['esm'],
  dts: {
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  platform: 'neutral',
  treeshake: true,
  splitting: false,
  minify: false,
  inlineOnly: false,
  // Mark all dependencies as external (not bundled)
  external: [
    '@types/d3',
    'bson',
    'd3',
    'from-node-stream',
    'phpdie',
    'polyfill-text-decoder-stream',
    'polyfill-text-encoder-stream',
    'rambda',
    'string-replace-async',
    'ts-essentials',
    'ts-toolbelt',
    'unwind-array',
    'web-streams-extensions',
  ],
})
