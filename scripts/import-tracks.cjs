// Turns the track export (sections like "// POP" followed by a JSON array) into data/tracks.json.
// Usage: node scripts/import-tracks.cjs "/path/to/Untitled-1.json"
// Only public track fields are kept. Author names, avatars and ids are dropped on purpose.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const GENRES = [
  { key: 'POP', id: 'pop', label: { en: 'Pop', ru: 'Поп' } },
  { key: 'RAP', id: 'rap', label: { en: 'Rap', ru: 'Рэп' } },
  { key: 'jazz', id: 'jazz', label: { en: 'Jazz', ru: 'Джаз' } },
  { key: 'latino', id: 'latino', label: { en: 'Latino', ru: 'Латино' } },
  { key: 'rnb', id: 'rnb', label: { en: 'Rnb', ru: 'Ритм-н-блюз' } },
  { key: 'rock_and_roll', id: 'rock', label: { en: 'Rock and roll', ru: 'Рок-н-ролл' } }
];

const src = process.argv[2];
if (!src) { console.error('usage: node scripts/import-tracks.cjs <export.json>'); process.exit(1); }
const text = fs.readFileSync(src, 'utf8');
const parts = text.split(/^\/\/\s*(.*)$/m);
const sections = {};
for (let i = 1; i < parts.length; i += 2) sections[parts[i].trim()] = JSON.parse(parts[i + 1]);

// Covers are 1024x1024 PNGs of ~1.3 MB each. Landing pages use 459x459 WebP copies stored in public/covers/.
const COVER = 459;
const coverDir = path.join(__dirname, '..', 'public', 'covers');
fs.mkdirSync(coverDir, { recursive: true });
const localCover = (id, url) => {
  const file = path.join(coverDir, id + '.webp');
  if (!fs.existsSync(file)) {
    const tmp = path.join(coverDir, id + '.src');
    execFileSync('curl', ['-sfL', '-m', '60', '-o', tmp, url]);
    execFileSync('magick', [tmp, '-resize', `${COVER}x${COVER}^`, '-gravity', 'center', '-extent', `${COVER}x${COVER}`, '-strip', '-quality', '82', file]);
    fs.rmSync(tmp);
  }
  return '/covers/' + id + '.webp';
};

const genres = GENRES.map(g => {
  const list = sections[g.key];
  if (!Array.isArray(list)) throw new Error('Missing section ' + g.key);
  const tracks = list.filter(t => t.is_available && t.audio_url && t.cover_image_url).map(t => ({
    id: t.id,
    title: t.title,
    durationMs: t.duration_ms,
    likes: t.likes_count,
    listens: t.listens_count,
    cover: localCover(t.id, t.cover_image_url),
    audio: t.audio_url
  }));
  return { id: g.id, label: g.label, tracks };
});
const out = path.join(__dirname, '..', 'data', 'tracks.json');
fs.writeFileSync(out, JSON.stringify({ source: path.basename(src), genres }, null, 2) + '\n');
console.log('Wrote', out, genres.map(g => `${g.id}:${g.tracks.length}`).join(' '));
