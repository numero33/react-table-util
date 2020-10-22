import typescript from 'rollup-plugin-typescript2'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import path from 'path'

import pkg from './package.json'

const input = './src/index.ts'

const external = id => !id.startsWith('.') && !path.isAbsolute(id)

const plugins = [typescript(), resolve(), commonjs()]

const umdGlobals = {
    react: 'React',
}

export default [
    {
        input,
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                sourcemap: true,
                exports: 'named',
            },
            {
                file: pkg.module,
                format: 'esm',
                sourcemap: true,
                exports: 'named',
            },
        ],
        external,
        plugins,
    },

    // {
    //     input,
    //     output: {
    //         file: "dist/index-dev.umd.js",
    //         format: "umd",
    //         sourcemap: true,
    //         name: "ReactWindow",
    //         globals: umdGlobals,
    //         exports: "named",
    //     },
    //     external: Object.keys(umdGlobals),
    //     plugins: [
    //         babelConfigEsModules,
    //         nodeResolve(),
    //         commonjs(),
    //         replace({
    //             "process.env.NODE_ENV": JSON.stringify("development"),
    //         }),
    //         terser(),
    //     ],
    // },

    // {
    //     input,
    //     output: {
    //         file: "dist/index-prod.umd.js",
    //         format: "umd",
    //         sourcemap: true,
    //         name: "ReactWindow",
    //         globals: umdGlobals,
    //         exports: "named",
    //     },
    //     external: Object.keys(umdGlobals),
    //     plugins: [
    //         babelConfigEsModules,
    //         nodeResolve(),
    //         commonjs(),
    //         replace({
    //             "process.env.NODE_ENV": JSON.stringify("production"),
    //         }),
    //         terser(),
    //     ],
    // },
]
