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
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'%3E%3Crect x='3' y='14' width='10' height='2' fill='%23582900'/%3E%3Crect x='4' y='13' width='8' height='1' fill='%2378350f'/%3E%3Crect x='6' y='12' width='4' height='1' fill='%2392400e'/%3E%3Crect x='7' y='8' width='2' height='5' fill='%2315803d'/%3E%3Crect x='8' y='7' width='1' height='2' fill='%2316a34a'/%3E%3Crect x='4' y='6' width='3' height='2' fill='%2316a34a'/%3E%3Crect x='3' y='5' width='3' height='2' fill='%2322c55e'/%3E%3Crect x='2' y='4' width='3' height='2' fill='%234ade80'/%3E%3Crect x='3' y='3' width='2' height='1' fill='%2386efac'/%3E%3Crect x='9' y='6' width='3' height='2' fill='%2315803d'/%3E%3Crect x='10' y='5' width='3' height='2' fill='%2316a34a'/%3E%3Crect x='11' y='4' width='3' height='2' fill='%2322c55e'/%3E%3Crect x='11' y='3' width='2' height='1' fill='%234ade80'/%3E%3Crect x='7' y='4' width='2' height='3' fill='%23facc15'/%3E%3Crect x='7' y='3' width='2' height='1' fill='%23fef08a'/%3E%3C/svg%3E" />
    <link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' shape-rendering='crispEdges'%3E%3Crect x='3' y='14' width='10' height='2' fill='%23582900'/%3E%3Crect x='4' y='13' width='8' height='1' fill='%2378350f'/%3E%3Crect x='6' y='12' width='4' height='1' fill='%2392400e'/%3E%3Crect x='7' y='8' width='2' height='5' fill='%2315803d'/%3E%3Crect x='8' y='7' width='1' height='2' fill='%2316a34a'/%3E%3Crect x='4' y='6' width='3' height='2' fill='%2316a34a'/%3E%3Crect x='3' y='5' width='3' height='2' fill='%2322c55e'/%3E%3Crect x='2' y='4' width='3' height='2' fill='%234ade80'/%3E%3Crect x='3' y='3' width='2' height='1' fill='%2386efac'/%3E%3Crect x='9' y='6' width='3' height='2' fill='%2315803d'/%3E%3Crect x='10' y='5' width='3' height='2' fill='%2316a34a'/%3E%3Crect x='11' y='4' width='3' height='2' fill='%2322c55e'/%3E%3Crect x='11' y='3' width='2' height='1' fill='%234ade80'/%3E%3Crect x='7' y='4' width='2' height='3' fill='%23facc15'/%3E%3Crect x='7' y='3' width='2' height='1' fill='%23fef08a'/%3E%3C/svg%3E" />
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
