const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const watch = process.argv.includes('--watch');
const outdir = path.join(__dirname, '..', 'dist');

const options = {
  entryPoints: [path.join(__dirname, '..', 'src', 'module.ts')],
  bundle: true,
  format: 'esm',
  target: ['es2017'],
  platform: 'browser',
  outfile: path.join(outdir, 'module.js'),
  sourcemap: true,
  external: ['react', 'react-dom', '@grafana/data', '@grafana/runtime', '@grafana/ui', '@grafana/*'],
  logLevel: 'info',
};

const assetItems = [
  { src: path.join(__dirname, '..', 'plugin.json'), dest: path.join(outdir, 'plugin.json') },
  { src: path.join(__dirname, '..', 'img'), dest: path.join(outdir, 'img'), isDir: true },
];

function syncAssets() {
  for (const item of assetItems) {
    if (item.isDir) {
      fs.cpSync(item.src, item.dest, { recursive: true });
    } else {
      fs.copyFileSync(item.src, item.dest);
    }
  }
}

if (watch) {
  esbuild
    .context(options)
    .then((ctx) => {
      syncAssets();
      return ctx.watch();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
} else {
  esbuild
    .build(options)
    .then(syncAssets)
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
