import babel from 'rollup-plugin-babel';
import postReplace from 'rollup-plugin-post-replace';

export default {
    entry: 'src/index.js',
    moduleName: 'transition',
    exports: 'named',
    format: 'umd',
    plugins: [
        babel(),
        postReplace({
            // rename exports
            default: 'run',
            createTransition: 'create'
        })
    ],
    dest: 'dist/transition.js'
};
