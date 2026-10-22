// Static build: src/ + config.cjs -> dist/. No dependencies, no network.
const fs = require('node:fs');
const path = require('node:path');
const cfg = require('./config.cjs');
const experiments = require('./src/experiments.cjs');
const { renderExperiment, renderHub } = require('./src/render.cjs');

const dist = path.join(__dirname, 'dist');
fs.mkdirSync(dist, { recursive: true });

for (const name of ['styles.css', 'app.js']) fs.copyFileSync(path.join(__dirname, 'src', name), path.join(dist, name));
// public/ (fonts, logo, favicons, manifest) is copied as-is to the site root.
fs.cpSync(path.join(__dirname, 'public'), dist, { recursive: true });

// Drop stale experiment folders so a removed hypothesis disappears from dist. Folders that come from public/ (assets, trends) stay.
const fromPublic = new Set(fs.readdirSync(path.join(__dirname, 'public')));
for (const entry of fs.readdirSync(dist, { withFileTypes: true })) {
  if (entry.isDirectory() && !fromPublic.has(entry.name) && !experiments.some(e => e.slug === entry.name)) fs.rmSync(path.join(dist, entry.name), { recursive: true });
}

for (const exp of experiments) {
  fs.mkdirSync(path.join(dist, exp.slug), { recursive: true });
  fs.writeFileSync(path.join(dist, exp.slug, 'index.html'), renderExperiment(exp, cfg));
}
const hub = path.join(dist, 'index.html');
if (cfg.buildHub) fs.writeFileSync(hub, renderHub(experiments, cfg));
else fs.rmSync(hub, { force: true });

console.log('Built', experiments.length, 'pages:', experiments.map(e => e.slug).join(', '), '| languages:', cfg.languages.join('/'));
if (!cfg.posthog.key) console.warn('WARNING: POSTHOG_KEY is not set. Events are logged to the console only and are NOT sent to PostHog.');
