var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './server/server.js',
  output: {
    path: __dirname,
    filename: 'bundle.js',
    publicPath: './public/dist'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react', 'stage-3', {"modules":false}]
        }
      }, 
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      }
    ]
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ],
    extensions: ['.js', '.json', '.jsx'],
  }
};