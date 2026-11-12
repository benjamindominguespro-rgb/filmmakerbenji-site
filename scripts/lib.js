/*
 * Utilitaires communs au serveur local et à la construction du site en ligne.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FACADES_DIR = path.join(ROOT, 'facades');

/* Fichiers et dossiers communs à toutes les façades, publiés tels quels. */
const SHARED_ENTRIES = [
  'assets',
  'landing-page.html',
  'landing-instagram.html',
  'mentions-legales.html',
  'robots.txt',
  'sitemap.xml'
];

/* Fichiers d'une façade qui ne sont JAMAIS copiés tels quels (code de génération). */
const FACADE_PRIVATE_FILES = ['render.js'];

function readConfig() {
  const file = path.join(ROOT, 'site.config.json');
  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (typeof config.FACADE !== 'string' || !config.FACADE) {
    throw new Error('site.config.json : le réglage FACADE est manquant.');
  }
  return config;
}

function listFacades() {
  return fs.readdirSync(FACADES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(FACADES_DIR, e.name, 'render.js')))
    .map((e) => e.name);
}

function assertFacade(name) {
  if (!/^[a-z0-9-]+$/.test(name) || !listFacades().includes(name)) {
    throw new Error(`Façade inconnue : "${name}". Façades disponibles : ${listFacades().join(', ')}.`);
  }
  return name;
}

/* Recharge toujours les fichiers depuis le disque (utile pour le serveur local). */
function freshRequire(file) {
  delete require.cache[require.resolve(file)];
  return require(file);
}

function renderFacade(name, ctx) {
  assertFacade(name);
  const data = freshRequire(path.join(ROOT, 'content', 'data.js'));
  const { render } = freshRequire(path.join(FACADES_DIR, name, 'render.js'));
  return render(data, ctx);
}

module.exports = {
  ROOT,
  FACADES_DIR,
  SHARED_ENTRIES,
  FACADE_PRIVATE_FILES,
  readConfig,
  listFacades,
  assertFacade,
  renderFacade
};
