const path = require('path');

module.exports = {
  entry: './src/dist/background.js',
  output: {
    filename: 'background.bundle.js',
    path: path.resolve(__dirname, 'src/dist'),
  },
  devtool: 'source-map',
  mode: 'development',
};
