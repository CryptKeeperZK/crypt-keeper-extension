/* eslint-disable import/no-extraneous-dependencies */
import typescript from 'rollup-plugin-typescript2'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import replace from '@rollup/plugin-replace'
import { visualizer } from 'rollup-plugin-visualizer'
import cleaner from 'rollup-plugin-cleaner'
import * as fs from 'fs'


const input = 'src/index.ts'
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const banner = `/**
 * @module ${pkg.name}
 * @version ${pkg.version}
 * @file ${pkg.description}
 * @copyright Ethereum Foundation 2022
 * @license ${pkg.license}
 * @see [Github]{@link ${pkg.homepage}}
*/`


const typescriptPlugin = typescript({
  tsconfig: 'tsconfig.json',
  useTsconfigDeclarationDir: true,
})

const visualizerPlugin = visualizer({
  emitFile: true,
  filename: 'stats.html',
  template: 'sunburst',
})

const browserPlugins = [
  typescriptPlugin,
  replace({
    // Replace `process.browser` with `true` to avoid `process is not defined` error
    // This is because ffjavascript and snarkjs use `process.browser` to check if it's running in the browser,
    // but process is undefined in the browser and referencing `process.browser` causes an error.
    // Ref: https://github.com/iden3/ffjavascript/blob/e670bfeb17e80b961eab77e15a6b9eca8e31a0be/src/threadman.js#L43
    'process.browser': JSON.stringify(true),
    // To avoid unexpected behavior that the warning suggests.
    'preventAssignment': true,
  }),
  // Resolve the import from node_modules.
  // `browser: true` is required for `window` not to be undefined
  // Ref: https://github.com/iden3/snarkjs/blob/782894ab72b09cfad4dd8b517599d5e7b2340468/src/taskmanager.js#L20-L24
  nodeResolve({ browser: true }),
  commonjs(),
  json(),
  // Replace node built-in modules with polyfills
  nodePolyfills(),
]


export default {
    input,
    output: { file: pkg.module, format: 'es', banner },
    plugins: [
      ...browserPlugins,
      visualizerPlugin,
    ],
}
