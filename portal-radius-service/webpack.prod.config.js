const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
// const ZipPlugin = require('zip-webpack-plugin');
const _externals = require('externals-dependencies');
const WebpackBar = require('webpackbar');

let externals = _externals();
// externals['bufferutil'] = 'commonjs bufferutil';
// externals['utf-8-validate']= 'commonjs utf-8-validate';

module.exports = {
	mode: 'production',
	target: 'node',
	devtool: 'source-map',
	entry: './src/index.js',
	node: {
		__filename: false,
		__dirname: false,
	},
	resolve: {
		alias: {
			server: path.resolve(__dirname, 'src/server/'),
			service: path.resolve(__dirname, 'src/service/'),
			model: path.resolve(__dirname, 'src/model/'),
			infra: path.resolve(__dirname, 'src/infra/'),
			misc: path.resolve(__dirname, 'src/misc/'),
		},
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	optimization: {
		minimizer: [new TerserPlugin()],
	},
	plugins: [
		new WebpackBar(),
		new webpack.DefinePlugin({
			'process.env.DEBUG': 'app*',
		}),
		new CopyWebpackPlugin(
			{
				patterns: [
					{from: 'package.json'},
					{from: './config', to: 'config'}
				]
			}
		),
	],
	externals,
};
