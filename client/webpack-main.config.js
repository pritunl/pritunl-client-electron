const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'electron-main',
  devtool: 'source-map',
  externals: {
    "bufferutil": "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
  entry: {
    main: {
      import: './main/Main.js',
    },
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'static'),
    publicPath: './static/',
    filename: '[name].js',
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
