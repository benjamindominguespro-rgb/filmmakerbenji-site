/*
 * Construit le site publié dans dist/ : UNE SEULE façade, celle du réglage FACADE
 * (site.config.json). Les autres façades ne sont pas copiées : elles n'existent pas en ligne.
 *
 * Usage : node scripts/build.js            -> façade du réglage FACADE (c'est ce que fait Vercel)
 *         node scripts/build.js --facade=x -> test local d'une autre façade (jamais utilisé en ligne)
 */
const fs = require('fs');
const path = require('path');
const {
  ROOT, FACADES_DIR, SHARED_ENTRIES, FACADE_PRIVATE_FILES,
  readConfig, listFacades, assertFacade, renderFacade
} = require('./lib');
const { ensureTitles } = require('./titles');

const argFacade = (process.argv.find((a) => a.startsWith('--facade=')) || '').slice('--facade='.length);
const facade = assertFacade(argFacade || readConfig().FACADE);
const DIST = path.join(ROOT, 'dist');

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  /* Titres des vidéos YouTube (cache content/video-titles.json, complété si une vidéo a été ajoutée) */
  const { titles, missing, added } = await ensureTitles(require(path.join(ROOT, 'content', 'data.js')));
  if (missing && !added) console.warn('Avertissement : titres YouTube indisponibles pour ' + missing + ' vidéo(s), le cache existant est utilisé.');

  /* 1. La page d'accueil de la façade choisie, puis ses fichiers (css, js, images) à la racine. */
  fs.writeFileSync(path.join(DIST, 'index.html'), renderFacade(facade, { base: '', titles }));

  const facadeDir = path.join(FACADES_DIR, facade);
  for (const entry of fs.readdirSync(facadeDir)) {
    if (FACADE_PRIVATE_FILES.includes(entry)) continue;
    fs.cpSync(path.join(facadeDir, entry), path.join(DIST, entry), { recursive: true });
  }

  /* 2. Ce qui est commun à toutes les façades. */
  for (const entry of SHARED_ENTRIES) {
    fs.cpSync(path.join(ROOT, entry), path.join(DIST, entry), { recursive: true });
  }

  /* 3. Feuille de style de la page « mentions légales » (toujours l'apparence classique). */
  fs.copyFileSync(path.join(FACADES_DIR, 'classique', 'style.css'), path.join(DIST, 'legal.css'));

  /* 4. Contrôle : rien d'une autre façade ni du code source ne doit se retrouver dans dist/. */
  const forbiddenNames = new Set(['facades', 'content', 'scripts', 'refonte', 'node_modules', '.git', 'render.js', 'site.config.json']);
  for (const other of listFacades()) if (other !== facade) forbiddenNames.add(other);

  const problems = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (forbiddenNames.has(e.name)) problems.push(path.relative(DIST, path.join(dir, e.name)));
      if (e.isDirectory()) walk(path.join(dir, e.name));
    }
  })(DIST);

  if (problems.length) {
    console.error('ERREUR : fichiers qui ne doivent pas être publiés :\n  ' + problems.join('\n  '));
    process.exit(1);
  }

  console.log(`Site construit dans dist/ avec la façade "${facade}" uniquement.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
