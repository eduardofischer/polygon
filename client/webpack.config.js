const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

require('dotenv').config({
  path: path.join(__dirname, '../.env'),
});

module.exports = {
  mode: 'development',
  entry: ['./src/js/index.js'],
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
  devtool: 'inline-source-map',
  plugins: [
    new HtmlWebpackPlugin({ title: 'Development', template: './index.html' }),
    new webpack.EnvironmentPlugin(['APP_ENV', 'SERVER_URL']),
    new ESLintPlugin({
      fix: true,
      context:  path.resolve(__dirname, '..'),
      files: ['shared', 'client/src/js'],
      failOnError: false
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, '../dist'),
    compress: true,
    port: 9000
  }
};