const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs');

module.exports = {
  entry: './src/components/index.tsx',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',  
          'css-loader',
          'postcss-loader'
        ]
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
	host: '0.0.0.0',
    compress: true,
    port: 9000,
    hot: true,
    open: true,
    historyApiFallback: true,
	https: {
		key: fs.readFileSync(path.join(__dirname, 'certs/key.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'certs/cert.pem')),
	}
  },
};