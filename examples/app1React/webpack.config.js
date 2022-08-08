const path = require('path');
const HtmlWebpackPlugin  = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        singleSpaEntry: './src/singleSpaEntry.js',//主应用加载入口文件
        store: './src/store.js',//主应用加载存储文件
        bundle:'./src/index' // 子应用开发需要入口文件
    },

    output: {
        //filename: '[name].[hash].js',
        filename: '[name].js',
        path: path.resolve(__dirname, 'build'),
        libraryTarget: 'umd',
       // library: 'reactApp',
       //chunkFilename: '[name].[chunkhash].js'
       chunkFilename: '[name].js'
    },
    externals : {  // 不打包
        'react':'React',
        'react-dom':'ReactDOM'
    },
    module: {
        rules: [
            {test:/\.css$/,loader:"style-loader!css-loader"},
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
                            publicPath: '',
                        }
                    }
                ]
            }
        ],
    },
    mode: 'development',
    devtool: false,
    devServer: {
        contentBase: path.resolve(__dirname, './'),
        hot: true,
        port: 9001,
      },
      plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }), 
        new webpack.HotModuleReplacementPlugin()
      ]
};
