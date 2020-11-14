const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'three-dxf.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'ThreeDxf',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    externals: {
        three: 'THREE'
    },
};