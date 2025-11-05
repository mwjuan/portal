const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const _externals = require('externals-dependencies');
const WebpackBar = require('webpackbar');

let externals = _externals();

module.exports = {
	watch: true,
	mode: 'development',
	stats: 'errors-warnings',
	target: 'node',
	devtool: 'source-map',
	entry: './src/index.js',
	node: {
		__filename: false,
		__dirname: false,
	},
	output: {
		path: path.join(__dirname, 'dist'),
		filename: 'bundle.js',
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
	plugins: [
		new WebpackBar(),
		new CopyWebpackPlugin({
			patterns:[
				{ from: 'package.json' },
				{ from: './config', to: 'config' },
			]
		}),
		new NodemonPlugin({
			nodeArgs: ['--no-deprecation'],
		}),
	],
	externals,
};
