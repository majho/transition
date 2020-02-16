import rimraf from 'rimraf';
import babel from 'rollup-plugin-babel';
import filesize from 'rollup-plugin-filesize';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;
const terserConfig = {
    sourcemap: false,
    ecma: 2018,
    compress: {
        drop_console: true,
    },
    output: {
        comments: false,
    },
};

// clean output folder
rimraf.sync('dist');

export default {
    input: 'src/index.js',
    output: {
        dir: 'dist',
        name: 'transition',
        entryFileNames: 'transition.js',
        exports: 'named',
        format: 'umd',
        sourcemap: !production,
    },
    plugins: [
        babel({ exclude: [/node_modules/] }),
        production && terser(terserConfig),
        production && filesize(),
    ],
};
