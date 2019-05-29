const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const {
	prodPath,
	srcPath
} = require('./path');
const selectedPreprocessor = require('./styles-loader');

module.exports = {
	entry: {
		main: path.resolve(srcPath, 'index.js')
	},
	output: {
		path: path.resolve(__dirname, prodPath),
		filename: '[name].[chunkhash].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: selectedPreprocessor.fileRegexp,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					{
						loader: 'css-loader',
						options: {
							minimize: true
						}
					},
					{
						loader: 'postcss-loader',
					},
					{
						loader: selectedPreprocessor.loaderName
					}
				]
			},
			{
				test: /\.(png|jpe?g|gif)$/,
				use: [
					{
						loader: 'file-loader',
						options: {},
					},
				],
			},
		]
	},
	plugins: [
		new CleanWebpackPlugin(path.resolve(__dirname, prodPath), {
			root: process.cwd()
		}),
		new MiniCssExtractPlugin({
			filename: 'style.[contenthash].css'
		}),
		new HtmlWebpackPlugin({
			inject: false,
			hash: true,
			template: path.resolve(srcPath, 'index.html'),
			filename: 'index.html'
		}),
		new WebpackMd5Hash()
	],
	externals: require('./externals')
};
