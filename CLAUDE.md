# Site FilmMakerBenji

Le site a plusieurs façades (classique, bureau). Seul Benjamin choisit la façade publiée. Quand il dit “mets la façade X” ou “remets l’ancien thème”, change le réglage FACADE, vérifie que seule cette façade est publiée, puis redéploie.

## Comment c'est organisé

- `content/data.js` : TOUT le contenu (textes, projets, avis, chiffres, liens, vignettes, showreel). Une modification ici vaut pour toutes les façades.
- `facades/<nom>/` : un dossier par thème (`classique`, `bureau`). Chacun contient `render.js` (génère la page d'accueil depuis `content/data.js`), `style.css`, `script.js` et ses propres images.
- `site.config.json` : le réglage `FACADE` = la façade publiée en ligne. C'est le seul endroit où on la choisit.
- `assets/` : images et vidéos communes à toutes les façades.
- Pages communes à toutes les façades : `landing-page.html`, `landing-instagram.html`, `mentions-legales.html` (son style vient de `legal.css`, une copie du style classique), `robots.txt`, `sitemap.xml`.
- `refonte/` : maquettes de travail. Jamais publié.

## Commandes

- `npm run dev` (ou `node scripts/dev-server.js`) : serveur local. Comparer les façades avec `http://localhost:8080/?facade=classique` et `http://localhost:8080/?facade=bureau`. Ce choix par l'adresse n'existe qu'en local.
- `npm run build` : construit `dist/` avec UNE seule façade (celle du réglage `FACADE`). Vercel lance cette commande (voir `vercel.json`). Le script refuse de terminer si un fichier d'une autre façade ou du code source se retrouve dans `dist/`.
- Tester une autre façade en local : `node scripts/build.js --facade=bureau` (ne change pas le réglage publié).

## Changer la façade publiée

1. Modifier `FACADE` dans `site.config.json`.
2. Lancer `npm run build`, puis vérifier dans `dist/` que seule cette façade est là (pas de dossier `facades`, `refonte`, `content`, `scripts`, pas de fichiers de l'autre façade).
3. Redéployer : commit puis push sur `main` (Vercel reconstruit le site avec la nouvelle façade).

## Règles

- Les visiteurs ne doivent avoir aucun moyen de changer de façade : pas de sélecteur, pas de paramètre dans l'adresse, pas de dossier d'une autre façade en ligne.
- Un texte, un projet ou un avis se modifie dans `content/data.js`, jamais directement dans une façade.
- Ne pas modifier le rendu de la façade `classique` sans demande explicite.
- Tag Git `site-v1-original` : sauvegarde du site avant la mise en place des façades.
