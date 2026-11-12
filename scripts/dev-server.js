/*
 * Serveur LOCAL uniquement (jamais publié) : permet de comparer les façades.
 *   http://localhost:8080/?facade=classique
 *   http://localhost:8080/?facade=bureau
 * Sans paramètre, c'est la façade du réglage FACADE (site.config.json).
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const {
  ROOT, FACADES_DIR, SHARED_ENTRIES, FACADE_PRIVATE_FILES,
  readConfig, assertFacade, renderFacade
} = require('./lib');
const { ensureTitles, loadTitles } = require('./titles');

const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
  '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2'
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function sendFile(req, res, file) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return send(res, 404, 'Introuvable');
  const stat = fs.statSync(file);
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  /* Les fichiers sont revalidés (ETag) au lieu d'être retéléchargés : bien plus rapide en local. */
  const etag = `W/"${stat.size}-${Math.floor(stat.mtimeMs)}"`;
  const base = { 'Content-Type': type, 'Cache-Control': 'no-cache', ETag: etag, 'Accept-Ranges': 'bytes' };
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, base);
    return res.end();
  }
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? parseInt(range[1], 10) : 0;
    const end = range[2] ? Math.min(parseInt(range[2], 10), stat.size - 1) : stat.size - 1;
    res.writeHead(206, { ...base, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...base, 'Content-Length': stat.size });
  fs.createReadStream(file).pipe(res);
}

/* Empêche de sortir du dossier visé (../). */
function inside(dir, rel) {
  const full = path.join(dir, rel);
  return full.startsWith(dir + path.sep) || full === dir ? full : null;
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let pathname = decodeURIComponent(url.pathname);

    /* Page d'accueil : la façade demandée dans l'adresse (?facade=...) */
    if (pathname === '/' || pathname === '/index.html' || pathname === '/index') {
      let facade;
      try {
        facade = assertFacade(url.searchParams.get('facade') || readConfig().FACADE);
      } catch (err) {
        return send(res, 404, err.message);
      }
      let html = renderFacade(facade, { base: `/_f/${facade}/`, titles: loadTitles() });
      html = html.replace(/<title>/, `<title>[${facade}] `); /* pour reconnaître les onglets */
      return send(res, 200, html, TYPES['.html']);
    }

    /* Fichiers propres à une façade, uniquement en local : /_f/<facade>/<fichier> */
    const f = /^\/_f\/([a-z0-9-]+)\/(.+)$/.exec(pathname);
    if (f) {
      const facade = assertFacade(f[1]);
      if (FACADE_PRIVATE_FILES.includes(f[2])) return send(res, 404, 'Introuvable');
      const file = inside(path.join(FACADES_DIR, facade), f[2]);
      return file ? sendFile(req, res, file) : send(res, 403, 'Interdit');
    }

    /* Feuille de style de la page mentions légales */
    if (pathname === '/legal.css') return sendFile(req, res, path.join(FACADES_DIR, 'classique', 'style.css'));

    /* Fichiers communs, mêmes règles que la version publiée (liste blanche) */
    if (!path.extname(pathname) && pathname !== '/') pathname += '.html';
    const rel = pathname.replace(/^\/+/, '');
    const allowed = SHARED_ENTRIES.some((e) => rel === e || rel.startsWith(e + '/'));
    if (!allowed) return send(res, 404, 'Introuvable');
    const file = inside(ROOT, rel);
    return file ? sendFile(req, res, file) : send(res, 403, 'Interdit');
  } catch (err) {
    send(res, 500, `Erreur : ${err.message}\n\n${err.stack}`);
  }
});

server.listen(PORT, () => {
  console.log(`Serveur local prêt (comparaison des façades) :`);
  console.log(`  classique : http://localhost:${PORT}/?facade=classique`);
  console.log(`  bureau    : http://localhost:${PORT}/?facade=bureau`);
  /* Complète en arrière-plan les titres YouTube d'éventuelles nouvelles vidéos (rechargeable ensuite) */
  ensureTitles(require('../content/data.js')).catch(() => {});
});
