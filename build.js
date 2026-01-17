const watch = process.argv.includes('--watch');

const result = await Bun.build({
  entrypoints: ['./src/js/AlgebraicCurve.js'],
  outdir: './dist',
  naming: 'main.js',
  target: 'browser',
  minify: true,
  sourcemap: 'external',
  loader: {
    '.wgsl': 'text' // <--- This forces the file content to be inlined as a string
  }
});

if (!result.success) {
  console.error("Build failed");
  for (const message of result.logs) {
    console.error(message);
  }
} else {
  console.log("Build succeeded!");
}

if (watch) {
  console.log("Watching for changes...");
  const fs = require('fs');
  let timeout;
  
  fs.watch('./src', { recursive: true }, async (eventType, filename) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log(`Change detected in ${filename}, rebuilding...`);
      await Bun.build({
        entrypoints: ['./src/js/AlgebraicCurve.js'],
        outdir: './dist',
        naming: 'main.js',
        target: 'browser',
        minify: true,
        loader: {
          '.wgsl': 'text'
        }
      });
      console.log("Rebuilt.");
    }, 100);
  });
}
