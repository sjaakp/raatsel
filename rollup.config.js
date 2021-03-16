
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import buble from '@rollup/plugin-buble';
import sass from 'rollup-plugin-sass';
import {terser} from 'rollup-plugin-terser';
import {version} from './package.json';
// import nodePolyfills from 'rollup-plugin-node-polyfills';

const appName = 'Raatsel';
const year = new Date().getFullYear();

const banner = `
/*!
 * ${appName} ${version}
 * (c) ${year} Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/raatsel
 * https://sjaakpriester.nl
 */
`;

const footer = `
function raatsel(id,options,data) {return new Raatsel.Main(id,options,data); }
`;

// const outro = `exports.version = '${version}';`;

export default {
    input: [ 'src/raatsel.js', 'src/raatwerk.js' ],
    output: {
        dir: 'dist',
        format: 'es',
        name: appName,
        sourcemap: true,
        banner: banner,
        // outro: outro,
    },
    plugins: [
        resolve({
            moduleDirectories: ['node_modules']
        }),
        commonjs({transformMixedEsModules:true}),
        json(),
        // nodePolyfills(),

        sass({
            output: 'dist/raatsel.css',
            // insert: true,
            options: {
                outputStyle: 'compressed',
            }
        }),

        buble({
             transforms: {
                 modules: false,
                 dangerousForOf: true,
                 dangerousTaggedTemplateString: true
             }
        }),

        // terser({
        //     output: {
        //          comments: /^!/
        //     }
        // })
    ]
};
