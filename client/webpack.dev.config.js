const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'electron-renderer',
  devtool: 'source-map',
  entry: {
    app: {
      import: './app/App.js',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist-dev', 'static'),
    publicPath: './static/',
    filename: '[name].js',
  },
  watchOptions: {
    aggregateTimeout: 100,
    ignored: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({}),
    }),
  ],
};
