/*
 * Titres des vidéos YouTube : récupérés automatiquement (oEmbed) et gardés dans content/video-titles.json.
 * Seuls les identifiants qui manquent sont demandés à YouTube ; si YouTube ne répond pas, on garde ce qu'on a.
 *
 *   node scripts/titles.js          -> met à jour content/video-titles.json
 *   npm run titles                  -> pareil
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE_FILE = path.join(ROOT, 'content', 'video-titles.json');

function allVideoIds(data) {
  const ids = new Set();
  data.sections.forEach((s) => s.packs.forEach((p) => p.videos.forEach((id) => ids.add(id))));
  return Array.from(ids);
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

async function fetchTitle(id) {
  const url = 'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent('https://www.youtube.com/watch?v=' + id);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json && json.title) || null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* Renvoie { idVidéo: titre }. Complète le fichier de cache avec les titres manquants. */
async function ensureTitles(data, options = {}) {
  const cache = readCache();
  const missing = allVideoIds(data).filter((id) => !cache[id]);
  let added = 0;
  const queue = missing.slice();
  const worker = async () => {
    while (queue.length) {
      const id = queue.shift();
      const title = await fetchTitle(id);
      if (title) { cache[id] = title; added += 1; }
    }
  };
  if (missing.length) await Promise.all([worker(), worker(), worker(), worker()]);
  if (added && options.write !== false) {
    try {
      fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n', 'utf8');
    } catch (e) { /* dossier en lecture seule : pas grave, le cache n'est qu'un confort */ }
  }
  return { titles: cache, missing: missing.length, added };
}

module.exports = { ensureTitles, allVideoIds, loadTitles: readCache, CACHE_FILE };

if (require.main === module) {
  const data = require(path.join(ROOT, 'content', 'data.js'));
  ensureTitles(data).then(({ titles, missing, added }) => {
    const total = allVideoIds(data).length;
    console.log(`${total} vidéos au total, ${missing} sans titre au départ, ${added} récupérées.`);
    const still = allVideoIds(data).filter((id) => !titles[id]);
    if (still.length) console.log('Toujours sans titre : ' + still.join(', '));
  });
}
