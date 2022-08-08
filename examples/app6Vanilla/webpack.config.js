const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
	entry: {
        base: 'resources/base/base.js',
        main: 'resources/articleAnalysis/main.js',
        singleSpaEntry: 'resources/singleSpaEntry.js',
	},
	output: {
		publicPath: '/',
		filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'system'
	},
	module: {
		rules: [
            { parser: { system: false } },
			{
				test: /\.js?$/,
				exclude: [path.resolve(__dirname, 'node_modules')],
				loader: 'babel-loader',
            },
            {
				test: /\.html?$/,
                loader: 'art-template-loader'
			}
		],
	},
	node: {
		fs: 'empty'
	},
	resolve: {
		modules: [
			__dirname,
			'node_modules',
		],
	},
	plugins: [
        CopyWebpackPlugin([
            {from: path.resolve(__dirname, 'protected/views/index.html')},
            {from: path.resolve(__dirname, 'resources/public/style.css')},
			{from: path.resolve(__dirname, 'resources/public/common.css')},
			{from: path.resolve(__dirname, 'resources/public/inner.css')},
            {from: path.resolve(__dirname, 'resources/public/baselibs.9a65ca.js')}        
        ]),
		new CleanWebpackPlugin(['build'])
	],
	devtool: 'source-map',
	externals: [
	],
    mode: 'development',
    devServer: {
		contentBase: './protected/views',
        historyApiFallback: true,
        disableHostCheck: true,
        watchOptions: { aggregateTimeout: 300, poll: 1000 },
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
        },
		// Proxy config for development purposes. In production, you would configure you webserver to do something similar.
        proxy: {
            "/api": {
                target: "http://localhost:3000/",
                pathRewrite: {"^/api" : "/posts"}
            }
        }
    }
};
