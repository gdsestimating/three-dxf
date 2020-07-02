const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'three-dxf-loader.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'ThreeDxfLoader',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    externals: {
        three: 'THREE'
    },
    devtool: 'eval-source-map'
};