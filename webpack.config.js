
// webpack.config.js
const path = require('path');
module.exports = {
  entry: {
    index: './src/index.js',
  },
  output: {
    publicPath: '/',
    filename: '[name].js',
    path: path.resolve(__dirname, 'libs'),
    // library: 'xone',
    libraryTarget: 'umd',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
      },
    ],
  },
  node: { // fixed: https://github.com/webpack-contrib/css-loader/issues/447
    fs: 'empty',
  },
};
