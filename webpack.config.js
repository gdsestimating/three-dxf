/*
 * Copyright (c) 2020 Prolincur Technologies LLP.
 * All Rights Reserved.
 */

const webpack = require('webpack');
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
        three: 'three'
    },
    devtool: 'eval-source-map',
    plugins: [
		new webpack.BannerPlugin(
		'Copyright (c) 2020 Prolincur Technologies LLP.\nAll Rights Reserved.\n\n' +
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