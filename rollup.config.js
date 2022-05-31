import packageJson from './package.json'
import {terser} from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/main.js',
            format: 'cjs',
            name: 'react-table-util',
            globals: {
                react: 'React',
            },
            interop: false,
            sourcemap: process.env.ENVIRONMENT === 'DEV',
        },
        {
            file: 'dist/module.js',
            format: 'esm',
            name: 'react-table-util',
            globals: {
                react: 'React',
            },
            interop: false,
            sourcemap: process.env.ENVIRONMENT === 'DEV',
        },
    ],
    external: Object.keys(packageJson?.dependencies ?? []).concat(Object.keys(packageJson?.peerDependencies ?? [])),
    plugins: [
        typescript(),
        process.env.ENVIRONMENT !== 'DEV' &&
            terser({
                ecma: '2015',
                mangle: {
                    toplevel: true,
                    eval: true,
                    module: true,
                    toplevel: true,
                    safari10: true,
                },
                compress: {
                    arguments: true,
                    booleans_as_integers: true,
                    drop_console: true,
                    hoist_funs: true,
                    module: true,
                    pure_getters: true,
                    toplevel: true,
                },
                output: {
                    comments: false,
                    wrap_iife: true,
                },
            }),
    ],
}
