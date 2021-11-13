const path = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
module.exports = {
  entry: './dist/index.js',
  output: {
    filename: 'three-dxf.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ThreeDxf',
    libraryTarget: 'umd',
    // globalObject: "typeof self !== 'undefined' ? self : this",
  },
  externals: {
    three: 'THREE',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'js', // Or 'ts' if you don't need tsx
          target: 'es2015',
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts', // Or 'ts' if you don't need tsx
          target: 'es2015',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015', // Syntax to compile to (see options below for possible values)
      }),
    ],
  },
};
