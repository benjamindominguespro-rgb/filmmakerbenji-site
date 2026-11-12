/*
 * Façade « bureau » : fenêtres de bureau des années 2000 (maquette refonte/maquette-piste-A-bureau.html).
 * Génère index.html à partir de content/data.js.
 * ctx.base = préfixe des fichiers propres à la façade (style.css, script.js, img/...).
 *
 * Règle : les vignettes des projets sont les miniatures YouTube des vidéos elles-mêmes
 * (jamais les images de assets/thumbs).
 */
const fs = require('fs');
const path = require('path');

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const SOCIAL_LABELS = { instagram: 'Instagram', youtube: 'YouTube', linkedin: 'LinkedIn', whatsapp: 'WhatsApp' };
const SETUP_START = 3; /* étape en cours au chargement (comme la maquette) */

/* Boutons de barre de titre : réduire, plein écran, fermer (data-act géré dans script.js) */
const BTN_MIN = '<button type="button" class="b-tb b-tb--min" data-act="min" aria-label="Réduire la fenêtre"><span></span></button>';
const BTN_MAX = '<button type="button" class="b-tb b-tb--max" data-act="max" aria-label="Agrandir la fenêtre"><span></span></button>';
const BTN_CLOSE = '<button type="button" class="b-tb b-tb--close" data-act="close" aria-label="Fermer la fenêtre"><svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7"/></svg></button>';
const CONTROLS = BTN_MIN + BTN_MAX + BTN_CLOSE;
const PLAY_SMALL = '<svg width="14" height="14" viewBox="0 0 14 14" fill="#FFFFFF" aria-hidden="true"><path d="M2 1l11 6-11 6z"/></svg>';

function facadeFile(name) {
  return fs.existsSync(path.join(__dirname, 'img', name));
}

const thumb = (id) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

function personJsonLd(d) {
  const p = d.seo.person;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    alternateName: p.alternateName,
    jobTitle: p.jobTitle,
    description: p.description,
    url: d.site.url,
    image: p.image,
    email: `mailto:${d.contact.email}`,
    address: { '@type': 'PostalAddress', addressRegion: p.region, addressCountry: p.country },
    areaServed: { '@type': 'Place', name: p.areaServed },
    knowsAbout: p.knowsAbout,
    sameAs: [d.contact.instagram, d.contact.youtube, d.contact.linkedin]
  };
}

function renderHead(d, ctx) {
  const c = d.copy.bureau;
  const url = d.site.url;
  return `<!DOCTYPE html>
<html lang="${d.site.lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(d.seo.title)}</title>
<meta name="description" content="${esc(d.seo.description)}">
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="${d.site.favicon}">
<script>document.documentElement.className += ' js';</script>

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(d.seo.shareTitle)}">
<meta property="og:description" content="${esc(d.seo.description)}">
<meta property="og:image" content="${c.shareImage.url}">
<meta property="og:image:width" content="${c.shareImage.width}">
<meta property="og:image:height" content="${c.shareImage.height}">
<meta property="og:locale" content="${d.site.locale}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(d.seo.shareTitle)}">
<meta name="twitter:description" content="${esc(d.seo.description)}">
<meta name="twitter:image" content="${c.shareImage.url}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bowlby+One&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">

<link rel="stylesheet" href="${ctx.base}style.css">

<!-- Donnees structurees Schema.org -->
<script type="application/ld+json">
${JSON.stringify(personJsonLd(d), null, 2)}
</script>
</head>
<body>
`;
}

function renderNav(d) {
  const c = d.copy.bureau;
  const hrefs = ['#projets', '#process', '#avis'];
  const links = d.nav.links.map((l, i) => `<a class="b-nav__link" href="${hrefs[i]}">${esc(l)}</a>`).join('\n        ');
  return `
<!-- NAV : barre de fenêtre -->
<header class="b-nav">
  <nav class="b-nav__inner" aria-label="Navigation principale">
    <a class="b-nav__brand" href="#top">
      <span class="b-nav__name">${esc(c.brand)}</span>
    </a>
    <div class="b-nav__links">
        ${links}
        <a class="b-pill" href="${d.contact.calendly}" target="_blank" rel="noopener">
          <span class="b-pill__icon" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3.5" width="12" height="10.5" rx="1.5"/><path d="M2 7h12M5.5 2v3M10.5 2v3"/></svg></span>
          ${esc(d.nav.cta)}
        </a>
    </div>
  </nav>
</header>
`;
}

/* Titre du hero : chaque lettre est son propre bloc pour pouvoir onduler (haut/bas) avec un décalage.
   Les mots restent insécables et le texte lu par les lecteurs d'écran est porté par l'aria-label du h1. */
function waveHeadline(lines) {
  let k = 0;
  return lines
    .map((line) =>
      line
        .split(' ')
        .map((word) => `<span class="b-w" aria-hidden="true">${[...word].map((ch) => `<span class="b-l" style="--k:${k++}">${esc(ch)}</span>`).join('')}</span>`)
        .join(' ')
    )
    .join('<br>');
}

function renderHero(d) {
  const c = d.copy.bureau;
  const photo = facadeFile('pdp-msn.jpg') ? '{BASE}img/pdp-msn.jpg' : '/assets/hero.jpg';
  const sr = d.showreel;
  const reelAttrs = `data-videos="${sr.youtubeId}" data-orientation="${sr.orientation}" data-title="${esc(c.playerTitle)}" data-fullscreen="1"`;
  return `
<!-- HERO : le bureau -->
<section class="b-hero" id="top">
  <div class="b-hero__inner">
    <div class="b-hero__text">
      <h1 class="b-title b-title--wave" aria-label="${esc(c.headline.join(' '))}">${waveHeadline(c.headline)}</h1>

      <div class="b-win b-win--dialog b-float b-reveal" style="--d: -2s" role="group" aria-label="${esc(c.messageTitle)}">
        <div class="b-win__bar"><span class="b-win__title">${esc(c.messageTitle)}</span>${BTN_MIN}${BTN_CLOSE}</div>
        <div class="b-dialog">
          <div class="b-dialog__row">
            <div class="b-avatar"><img src="${photo}" alt="Photo de Benjamin" width="92" height="92"></div>
            <div class="b-dialog__who">
              <span class="b-dialog__name"><span class="b-dot b-dot--sm" aria-hidden="true"></span>${esc(c.messageName)} <span class="b-dialog__status">${esc(c.messageStatus)}</span></span>
              <p>${esc(c.bio)}</p>
            </div>
          </div>
          <div class="b-actions">
            <button type="button" class="b-btn b-btn--blue js-reel" ${reelAttrs}>${PLAY_SMALL}${esc(c.showreelButton)}</button>
            <a class="b-btn b-btn--white" href="#projets">${esc(c.foldersButton)}</a>
          </div>
        </div>
      </div>
    </div>

    <div class="b-hero__visual">
      <div class="b-win b-win--player b-float b-reveal" style="--d: -4.5s" id="showreel" data-reel>
        <div class="b-win__bar"><span class="b-win__title">${esc(c.playerTitle)}</span>${CONTROLS}</div>
        <div class="b-player__screen">
          <video class="b-player__video" id="reelVideo" src="${sr.loop}" poster="${sr.poster}" autoplay muted loop playsinline preload="auto" disablepictureinpicture aria-hidden="true" tabindex="-1"></video>
          <button type="button" class="b-player__hit js-reel" aria-label="Lire le showreel en plein écran" ${reelAttrs}><span class="b-player__play"><svg width="28" height="28" viewBox="0 0 14 14" fill="#10153A" aria-hidden="true"><path d="M3 1l10 6-10 6z"/></svg></span></button>
        </div>
        <div class="b-player__bar">
          <div class="b-player__track"><div class="b-player__fill" id="reelFill"></div></div>
          <span class="b-player__time" id="reelTime">0:00 / 0:00</span>
        </div>
      </div>
    </div>
  </div>
</section>
`;
}

function renderTicker(d) {
  /* Défilement continu : le groupe est écrit deux fois, la 2e copie est cachée aux lecteurs d'écran */
  const group = (hidden) => `<div class="b-ticker__group"${hidden ? ' aria-hidden="true"' : ''}>${d.copy.bureau.ticker
    .map((t) => `<span class="b-ticker__item">${esc(t)}</span><span class="b-ticker__star" aria-hidden="true">✦</span>`)
    .join('')}</div>`;
  return `
<!-- BANDEAU barre des tâches (défile en continu) -->
<div class="b-ticker"><div class="b-ticker__track">${group(false)}${group(true)}</div></div>
`;
}

function renderStats(d) {
  const c = d.copy.bureau;
  const items = d.stats.map((s, i) => `
    <div class="b-win b-win--stat b-float b-reveal" style="--d: ${-1.2 - i * 1.7}s; --i: ${i}">
      <div class="b-win__bar b-win__bar--small"><span class="b-win__title">${esc(c.statFiles[i] || '')}</span>${CONTROLS}</div>
      <div class="b-stat">
        <div class="b-stat__value"><span class="b-sr">${esc(s.value)}${esc(s.suffix)}</span><span class="b-stat__text" aria-hidden="true">${esc(s.value)}${esc(s.suffix)}</span><span class="b-caret" aria-hidden="true"></span></div>
        <div class="b-stat__label">${esc(s.label.toLowerCase())}</div>
      </div>
    </div>`).join('');
  return `
<!-- CHIFFRES -->
<section class="b-stats" aria-label="Chiffres clés">${items}
</section>
`;
}

/* Vignette d'un dossier : les vraies miniatures YouTube. Vertical = 3 plans côte à côte, horizontal = 1 plan. */
function renderMedia(pack, orientation) {
  if (orientation === 'vertical') {
    const frames = pack.videos.slice(0, 3)
      .map((id) => `<img src="${thumb(id)}" alt="" width="480" height="360" loading="lazy" decoding="async">`)
      .join('');
    return `<span class="b-card__media b-card__media--strip">${frames}</span>`;
  }
  return `<span class="b-card__media"><img src="${thumb(pack.videos[0])}" alt="" width="480" height="360" loading="lazy" decoding="async"></span>`;
}

function renderCard(pack, orientation, titles) {
  const n = pack.videos.length;
  const tag = pack.card.tag;
  const sub = n > 1 ? `${n} vidéos · ${tag}` : tag;
  /* vrais titres YouTube de chaque vidéo (vide si inconnu : le JS affiche alors « Vidéo N ») */
  const names = pack.videos.map((id) => (titles && titles[id]) || '');
  return `
        <button type="button" class="b-card" data-open-folder data-videos="${pack.videos.join(',')}" data-names="${esc(JSON.stringify(names))}" data-orientation="${orientation}" data-title="${esc(pack.title)}" aria-label="Ouvrir le dossier ${esc(pack.title)}">
          <span class="b-card__file">${esc(pack.card.file)}</span>
          ${renderMedia(pack, orientation)}
          <span class="b-card__body"><span class="b-card__title">${esc(pack.title)}</span><span class="b-card__tag">${esc(sub)}</span></span>
        </button>`;
}

function renderProjects(d, titles) {
  const c = d.copy.bureau;
  const first = d.sections[0];
  const tabs = d.sections.map((s, i) => `
        <button type="button" role="tab" id="tab-${s.id}" aria-selected="${i === 0}" aria-controls="panel-${s.id}" tabindex="${i === 0 ? 0 : -1}" class="b-tab${i === 0 ? ' is-active' : ''}" data-folder="${esc(c.foldersPath + c.folderLabels[s.id])}">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="#FFC93C" stroke="#9A6A00" stroke-width="1.2" aria-hidden="true"><path d="M1 3a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1z"/></svg>
          ${esc(c.folderLabels[s.id])}
        </button>`).join('');
  const panels = d.sections.map((s, i) => `
      <div class="b-grid" role="tabpanel" id="panel-${s.id}" aria-labelledby="tab-${s.id}"${i === 0 ? '' : ' hidden'}>${s.packs.map((p) => renderCard(p, s.orientation, titles)).join('')}
      </div>
      <div class="b-count" data-for="panel-${s.id}"${i === 0 ? '' : ' hidden'}>${s.packs.length} ${esc(c.countLabel)}</div>`).join('');
  return `
<!-- PROJETS : explorateur de dossiers -->
<section class="b-section" id="projets">
  <h2 class="b-h2" aria-label="${esc(c.foldersTitle)}">${waveHeadline([c.foldersTitle])}</h2>
  <p class="b-lead">${esc(c.foldersIntro)}</p>

  <div class="b-win b-win--big b-reveal" id="explorer">
    <div class="b-win__bar b-win__bar--big"><span class="b-win__title" id="folderPath">${esc(c.foldersPath + c.folderLabels[first.id])}</span>${CONTROLS}</div>
    <div class="b-tabs" role="tablist" aria-label="Catégories de projets">${tabs}
    </div>
    <div class="b-loadbar" id="loadbar" hidden>
      <span class="b-loadbar__label" id="loadLabel">${esc(c.loadingLabel)}</span>
      <div class="b-loadbar__track"><span class="b-loadbar__fill"></span></div>
    </div>${panels}
    <div class="b-folder" id="folderView" hidden>
      <div class="b-toolbar">
        <button type="button" class="b-back" id="folderBack"><span class="b-back__icon" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 2.5L4 7l4.5 4.5M4.5 7H12"/></svg></span>${esc(c.backLabel)}</button>
        <div class="b-address"><span class="b-address__label">${esc(c.addressLabel)}</span><span class="b-address__path" id="folderAddr"></span></div>
      </div>
      <div class="b-grid b-grid--videos" id="folderGrid" role="list" aria-label="Vidéos du dossier"></div>
      <div class="b-count" id="folderCount" data-unit="${esc(c.countLabel)}"></div>
    </div>
  </div>
</section>
`;
}

function renderProcess(d) {
  const c = d.copy.bureau;
  const total = d.process.steps.length;
  const percent = (n) => Math.round((n / total) * 100);
  const steps = d.process.steps.map((st, i) => {
    const n = i + 1;
    const state = n < SETUP_START ? 'done' : n === SETUP_START ? 'current' : 'todo';
    return `
          <li class="b-step is-${state}">
            <button type="button" class="b-step__btn" data-step="${n}" data-percent="${percent(n)}"${n === SETUP_START ? ' aria-current="step"' : ''}>
              <span class="b-step__n">${String(n).padStart(2, '0')}</span>
              <span class="b-step__text"><span class="b-step__title">${esc(st.title)}</span><span class="b-step__desc">${esc(st.desc)}</span></span>
            </button>
          </li>`;
  }).join('');
  return `
<!-- PROCESS : assistant d'installation -->
<section class="b-process" id="process">
  <div class="b-process__inner">
    <div class="b-process__intro">
      <h2 class="b-h2 b-h2--light" aria-label="${esc(c.setupTitle)}">${waveHeadline([c.setupTitle])}</h2>
      <p>${esc(c.setupIntro)}</p>
    </div>
    <div class="b-win b-win--setup b-float b-reveal" style="--d: -3s">
      <div class="b-win__bar b-win__bar--big b-win__bar--ruled"><span class="b-win__title">${esc(c.setupWindow)}</span>${CONTROLS}</div>
      <ol class="b-steps">${steps}
      </ol>
      <div class="b-setup__foot">
        <div class="b-loading" role="progressbar" aria-label="Avancement du projet" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent(SETUP_START)}"><span class="b-loading__fill" id="setupFill" style="clip-path: inset(0 ${100 - percent(SETUP_START)}% 0 0)"></span></div>
        <div class="b-setup__next"><a class="b-btn b-btn--yellow" id="setupNext" href="#avis">${esc(c.setupNext)}</a></div>
      </div>
    </div>
  </div>
</section>
`;
}

function renderReviews(d) {
  const c = d.copy.bureau;
  const items = d.testimonials.items;
  const names = items.map((r, i) => `
          <li><button type="button" class="b-chat__who" data-chat="${i}" aria-pressed="false"><span class="b-dot b-dot--sm" aria-hidden="true"></span>${esc(r.client)}</button></li>`).join('');
  const msgs = items.map((r, i) => `
          <div class="b-msg" data-chat="${i}">
            <span class="b-msg__from">${esc(r.client)} ${esc(c.reviewSays)}</span>
            <span class="b-msg__typing" aria-hidden="true"><i></i><i></i><i></i></span>
            <p class="b-msg__bubble">${esc(r.quote)}</p>
            <span class="b-msg__service">${esc(r.service)}</span>
          </div>`).join('');
  return `
<!-- AVIS : messagerie -->
<section class="b-section b-section--avis" id="avis">
  <h2 class="b-h2" aria-label="${esc(c.reviewsTitle)}">${waveHeadline([c.reviewsTitle])}</h2>
  <div class="b-win b-win--big b-reveal">
    <div class="b-win__bar b-win__bar--big"><span class="b-win__title">${esc(c.reviewsWindow.replace('{n}', items.length))}</span>${CONTROLS}</div>
    <div class="b-chat">
      <ul class="b-chat__list">${names}
      </ul>
      <div class="b-chat__msgs">${msgs}
      </div>
    </div>
  </div>
</section>
`;
}

function renderContact(d) {
  const c = d.copy.bureau;
  const char = facadeFile('perso.webp')
    ? '<div class="b-contact__char"><img src="{BASE}img/perso.webp" alt="" width="720" height="803" loading="lazy" decoding="async"></div>'
    : '';
  return `
<!-- CTA FINAL : carte de fin du showreel -->
<section class="b-contact" id="contact">
  <div class="b-contact__inner">
    ${char}
    <div class="b-contact__main">
      <h2 class="b-title b-title--contact">${esc(c.contactBrand)}</h2>
      <div class="b-links b-reveal">
        <a class="b-links__call" href="${d.contact.calendly}" target="_blank" rel="noopener">${esc(c.contactBookCall)}</a>
        <div class="b-links__mail">
          <svg class="b-links__icon" width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><path d="M2 4.5l6 4.5 6-4.5"/></svg>
          <span class="b-links__text">${esc(c.contactWriteLabel)} <a href="mailto:${esc(c.contactEmail)}">${esc(c.contactEmail).replace('@', '<wbr>@')}</a></span>
          <button type="button" class="b-copy" id="copyMail" data-copy="${esc(c.contactEmail)}" data-label="${esc(c.copyLabel)}" data-done="${esc(c.copiedLabel)}">${esc(c.copyLabel)}</button>
        </div>
      </div>
    </div>
  </div>
</section>
`;
}

function renderFooter(d) {
  const c = d.copy.bureau;
  const socials = d.cta.socials
    .map((k) => `<a href="${d.contact[k]}" target="_blank" rel="noopener">${SOCIAL_LABELS[k]}</a>`)
    .join('\n        ');
  return `
<!-- FOOTER barre des tâches -->
<footer class="b-footer">
  <div class="b-footer__inner">
    <a class="b-start" href="#top">${esc(c.startButton)}</a>
    <div class="b-footer__links">
        ${socials}
        <a href="${d.footer.legalUrl}">${esc(d.footer.legalLabel)}</a>
    </div>
    <span class="b-footer__badge">${esc(d.footer.tagline)}</span>
  </div>
</footer>

<!-- LECTEUR : fenêtre vidéo (showreel en plein écran, dossiers en fenêtre) -->
<div class="b-lb" id="lightbox" aria-hidden="true">
  <div class="b-lb__backdrop" data-close></div>
  <div class="b-win b-lb__win" role="dialog" aria-modal="true" aria-labelledby="lbTitle">
    <div class="b-win__bar b-win__bar--big">
      <span class="b-win__title" id="lbTitle"></span>
      <span class="b-lb__count" id="lbCount"></span>
      <button type="button" class="b-tb b-tb--close b-lb__close" id="lbClose" aria-label="Fermer"><svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7"/></svg></button>
    </div>
    <div class="b-lb__stage" id="lbStage"></div>
    <div class="b-lb__nav" id="lbNav">
      <button type="button" class="b-btn b-btn--white b-btn--small" id="lbPrev" aria-label="Vidéo précédente">◀</button>
      <button type="button" class="b-btn b-btn--white b-btn--small" id="lbNext" aria-label="Vidéo suivante">▶</button>
    </div>
  </div>
</div>

<script src="{BASE}script.js"></script>
</body>
</html>
`;
}

function render(d, ctx = { base: '' }) {
  const base = ctx.base || '';
  /* La vidéo du showreel est celle de la page d'accueil classique, déjà dans /assets. */
  const data = { ...d, showreel: { ...d.showreel, loop: d.hero.video.src, poster: d.hero.video.poster } };
  const html = [
    renderHead(data, { base }),
    renderNav(data),
    renderHero(data),
    renderTicker(data),
    renderStats(data),
    renderProjects(data, ctx.titles),
    renderProcess(data),
    renderReviews(data),
    renderContact(data),
    renderFooter(data)
  ].join('');
  return html.split('{BASE}').join(base);
}

module.exports = { render };
