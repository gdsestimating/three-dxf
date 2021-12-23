/*
 * Copyright (c) 2020-22 Prolincur Technologies LLP.
 * All Rights Reserved.
 */

const webpack = require('webpack');
const MinifyPlugin = require("babel-minify-webpack-plugin");
const path = require('path');

module.exports = {
    entry: {
        'three-dxf-loader': './src/Loader.js',
        'three-dxf-viewer': './src/Viewer.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        library: 'ThreeDxfLoader',
        libraryTarget: 'umd',
        globalObject: 'typeof self !== \'undefined\' ? self : this'
    },
    externals: {
        three: {
            root: 'THREE',
            commonjs: 'three',
            commonjs2: 'three',
            amd: 'THREE'
        }
    },
    plugins: [
        new MinifyPlugin(),
		new webpack.BannerPlugin(
		'Copyright (c) 2021 Prolincur Technologies LLP.\nCopyright (c) 2015 GDS Storefront Estimating\nAll Rights Reserved.\n\n' +
		'Please check the provided LICENSE file for licensing details.\n' +
		'\n' +
		'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,\n' +
		'INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR\n' +
		'PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE\n' +
		'LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT\n' +
		'OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR\n' +
		'OTHER DEALINGS IN THE SOFTWARE.\n'
		)
  ]
};