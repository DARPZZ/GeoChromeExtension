const path = require('path');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');

const manifestVersion = process.env.MANIFEST_VERSION === '2' ? 'v2' : 'v3';
const outputDir = path.resolve(__dirname, 'src', 'dist', `dist-${manifestVersion}`);
const srcDir = path.resolve(__dirname, 'src');

const entryFiles = fs.readdirSync(srcDir).filter(file => file.endsWith('.ts'));
const entry = {};
entryFiles.forEach(file => {
  const name = path.parse(file).name;
  entry[name] = path.resolve(srcDir, file);
});

class CleanNonZipFilesPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('CleanNonZipFilesPlugin', (compilation) => {
      const files = fs.readdirSync(outputDir);
      files.forEach(file => {
        if (!file.endsWith('.zip')) {
          fs.unlinkSync(path.join(outputDir, file));
        }
      });
    });
  }
}

const plugins = [
  new CopyPlugin({
    patterns: [
      {
        from: path.resolve(__dirname, 'src', `manifest.${manifestVersion}.json`),
        to: path.resolve(outputDir, 'manifest.json'),
      },
      {
        from: path.resolve(__dirname, 'src', 'paw.png'),
        to: path.resolve(outputDir, 'paw.png'),
      },
      {
        from: path.resolve(__dirname, 'src', 'popup.html'),
        to: path.resolve(outputDir, 'popup.html'),
      },
      {
        from: path.resolve(__dirname, 'src', 'output.css'),
        to: path.resolve(outputDir, 'output.css'),
      },
    ],
  }),
];

if (manifestVersion === 'v2') {
  plugins.push(
    new ZipPlugin({
      filename: 'v2GeoExtension',
      path: outputDir,
      extension: 'zip',
      pathPrefix: '',
    }),
    new CleanNonZipFilesPlugin()
  );
}

module.exports = {
  mode: 'production',
  entry,
  output: {
    path: outputDir,
    filename: '[name].js',
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    usedExports: false,
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins,
};
