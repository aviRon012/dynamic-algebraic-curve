const fs = require('fs');

// Clean dist folder
if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true, force: true });
}

const watch = process.argv.includes('--watch');

const buildOptions = {
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  naming: 'main.js',
  target: 'browser',
  minify: true,
  sourcemap: 'external',
  loader: {
    '.wgsl': 'text',
    '.css': 'text'
  }
};

const result = await Bun.build(buildOptions);

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
  let timeout;
  
  fs.watch('./src', { recursive: true }, async (eventType, filename) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(async () => {
      console.log(`Change detected in ${filename}, rebuilding...`);
      await Bun.build(buildOptions);
      console.log("Rebuilt.");
    }, 100);
  });
}
