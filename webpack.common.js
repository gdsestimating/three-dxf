import { fileURLToPath } from 'url'
import * as path from 'path';
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
    entry: './src/index.ts',
    mode: 'development',
    output: {
        filename: 'three-dxf.js',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        three: 'THREE'
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensionAlias: {
            '.js': ['.js', '.ts'],
        },
    },
};