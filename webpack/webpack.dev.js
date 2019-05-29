const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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
	devtool: 'source-map',
	devServer: {
		open: true,
	},
	module: {
		rules: [{
			test: selectedPreprocessor.fileRegexp,
			use: [
				{
					loader: MiniCssExtractPlugin.loader
				},
				{
					loader: 'css-loader',
					options: {
						modules: false,
						sourceMap: true
					}
				},
				{
					loader: 'postcss-loader',
					options: {
						sourceMap: true
					}
				},
				{
					loader: selectedPreprocessor.loaderName,
					options: {
						sourceMap: true
					}
				},
			]
		}]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'style.css',
		}),
		new HtmlWebpackPlugin({
			inject: false,
			hash: false,
			template: path.resolve(srcPath, 'index.html'),
			filename: 'index.html'
		})
	],
	externals: require('./externals')
};
