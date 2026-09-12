import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.mts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: false,
});
