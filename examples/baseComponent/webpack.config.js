const path = require('path');

module.exports = {
  entry: {
    topBar: './topBar/navBar.app.js',
    slideNav: './slideNav/slideNav.app.js',
    store: './store/store.js',
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'release'),
    libraryTarget: 'umd',
    library: 'reactApp',
  },

  module: {
    rules: [
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {
        test: /\.js/,
        use: ['babel-loader?cacheDirectory'],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: '/baseComponent/',
            },
          },
        ],
      },
    ],
  },

  mode: 'development',

  devtool: 'eval-source-map',
  // devtool: 'none',

};
