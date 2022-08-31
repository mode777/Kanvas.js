const path = require('path');

module.exports = {
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  },
  target: "es5",
  entry: {
    main: './src/main.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
      // {
      //   test: /\.(js)$/,
      //   exclude: /node_modules/,
      //   use: ['babel-loader']
      // }
    ]
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: './../../example_canvg.js',
    path: __dirname,
    chunkFormat: 'commonjs'
  }
};