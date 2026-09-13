import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.mts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  minify: true,
  sourcemap: false,
  // `get` is the named export and the default is a namespace object holding it;
  // both are intentional, so silence the mixed-exports advice.
  outputOptions: { exports: 'named' },
});
