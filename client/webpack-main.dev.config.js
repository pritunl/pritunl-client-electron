const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development',
  target: 'electron-main',
  devtool: 'inline-source-map',
  entry: {
    main: {
      import: './main/Main.js',
    },
  },
  output: {
    path: path.resolve(__dirname, 'dist-dev', 'static'),
    publicPath: '',
    filename: '[name].js',
  },
  watchOptions: {
    aggregateTimeout: 100,
    ignored: [
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({}),
    }),
  ],
};
