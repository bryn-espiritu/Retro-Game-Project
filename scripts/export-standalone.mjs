/**
 * Bundles dist/ assets into a single self-contained standalone HTML file
 * that can be played offline by double-clicking on any machine.
 */
import fs from 'fs';
import path from 'path';

const distDir = path.resolve('dist');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(distDir) || !fs.existsSync(assetsDir)) {
  console.error('Dist directory not found. Please run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const jsFile = files.find(f => f.endsWith('.js'));
const cssFile = files.find(f => f.endsWith('.css'));

if (!jsFile || !cssFile) {
  console.error('Could not find JS or CSS bundle in dist/assets.');
  process.exit(1);
}

const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

const standaloneHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>Verdant Depths: Dungeon & Harvest</title>
    <meta name="description" content="A 16-bit retro pixel-art dungeon crawler and farming simulation." />
    <meta name="author" content="Bryn Espiritu" />
    <meta name="generator" content="Google AI Studio" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Press+Start+2P&family=Silkscreen:wght@400;700&display=swap" rel="stylesheet">
    <style>
${cssContent}
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
${jsContent.replace(/<\/script>/g, '<\\/script>')}
    </script>
  </body>
</html>
`;

// Save to dist/verdant-depths-standalone.html
const outPath = path.join(distDir, 'verdant-depths-standalone.html');
fs.writeFileSync(outPath, standaloneHtml, 'utf8');

// Also save to public/verdant-depths-standalone.html so the dev server can serve it directly for 1-click browser download!
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'verdant-depths-standalone.html'), standaloneHtml, 'utf8');

console.log('Successfully created standalone offline game file at:');
console.log(outPath);
console.log(path.join(publicDir, 'verdant-depths-standalone.html'));
