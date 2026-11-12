/*
 * Façade « classique » : le design d'origine du site.
 * Génère index.html à partir de content/data.js.
 * ctx.base = préfixe des fichiers propres à la façade (style.css, script.js).
 */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const ICON_CALENDAR = '<svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>';
const ICON_PLAY_BTN = '<svg class="btn__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PLAY_THUMB = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
const ICON_PIN = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
const ICON_INSTAGRAM = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none"/>
      </svg>`;

const SOCIAL_LABELS = { instagram: 'Instagram', youtube: 'YouTube', linkedin: 'LinkedIn', whatsapp: 'WhatsApp' };
const NAV_HREFS = ['#vertical', '#process', '#temoignages'];
const ALT_SECTIONS = ['filmmaking'];

function renderHead(d, ctx) {
  const p = d.seo.person;
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

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(d.seo.shareTitle)}">
<meta property="og:description" content="${esc(d.seo.description)}">
<meta property="og:image" content="${d.seo.image.url}">
<meta property="og:image:width" content="${d.seo.image.width}">
<meta property="og:image:height" content="${d.seo.image.height}">
<meta property="og:locale" content="${d.site.locale}">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(d.seo.shareTitle)}">
<meta name="twitter:description" content="${esc(d.seo.description)}">
<meta name="twitter:image" content="${d.seo.image.url}">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">

<link rel="stylesheet" href="${ctx.base}style.css">

<!-- Donnees structurees Schema.org -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "${p.name}",
  "alternateName": "${p.alternateName}",
  "jobTitle": "${p.jobTitle}",
  "description": "${p.description}",
  "url": "${url}",
  "image": "${p.image}",
  "email": "mailto:${d.contact.email}",
  "address": {
    "@type": "PostalAddress",
    "addressRegion": "${p.region}",
    "addressCountry": "${p.country}"
  },
  "areaServed": {
    "@type": "Place",
    "name": "${p.areaServed}"
  },
  "knowsAbout": ${JSON.stringify(p.knowsAbout)},
  "sameAs": [
    "${d.contact.instagram}",
    "${d.contact.youtube}",
    "${d.contact.linkedin}"
  ]
}
</script>
</head>
<body>
`;
}

function renderNav(d) {
  const links = d.nav.links
    .map((label, i) => `      <a href="${NAV_HREFS[i]}" class="nav__link">${esc(label)}</a>`)
    .join('\n');
  return `
<!-- ================= NAVIGATION ================= -->
<header class="nav" id="nav">
  <div class="nav__inner container">
    <a href="#" class="nav__logo">${esc(d.site.name)}<span>.</span></a>

    <nav class="nav__links" id="navLinks">
${links}
      <a href="${d.contact.calendly}" class="nav__link nav__link--cta" target="_blank" rel="noopener">
        ${ICON_CALENDAR}
        ${esc(d.nav.cta)}
      </a>
    </nav>

    <a href="${d.contact.instagram}" class="nav__social" target="_blank" rel="noopener" aria-label="Instagram">
      ${ICON_INSTAGRAM}
    </a>

    <button class="nav__burger" id="navBurger" aria-label="Ouvrir le menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
`;
}

function renderHero(d) {
  const h = d.hero;
  const tags = h.tags
    .map((t) => (t.location
      ? `    <li class="hero__tag hero__tag--location">
      ${ICON_PIN}
      ${esc(t.label)}
    </li>`
      : `    <li class="hero__tag">${esc(t.label)}</li>`))
    .join('\n');
  return `
<!-- ================= HERO ================= -->
<section class="hero" id="hero">
  <div class="hero__bg">
    <video class="hero__video" src="${h.video.src}" poster="${h.video.poster}" autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture aria-hidden="true" tabindex="-1"></video>
    <div class="hero__overlay"></div>
  </div>

  <div class="hero__content container">
    <div class="hero__portrait fade-in">
      <img src="${h.portrait.src}" alt="${esc(h.portrait.alt)}" class="hero__portrait-img" width="${h.portrait.width}" height="${h.portrait.height}" fetchpriority="high">
    </div>
    <h1 class="hero__title fade-in">${esc(h.title[0])}<span class="accent">${esc(h.title[1])}</span></h1>
    <div class="hero__cta fade-in">
      <a href="${d.contact.calendly}" class="btn btn--primary" target="_blank" rel="noopener">
        ${ICON_CALENDAR}
        ${esc(h.primaryButton)}
      </a>
      <button type="button" class="btn btn--ghost reel-trigger" data-videos="${d.showreel.youtubeId}" data-orientation="${d.showreel.orientation}" data-index="0">
        ${ICON_PLAY_BTN}
        ${esc(h.showreelButton)}
      </button>
    </div>
  </div>

  <ul class="hero__tags fade-in" aria-label="${esc(h.tagsLabel)}">
${tags}
  </ul>

  <div class="hero__scroll-indicator" aria-hidden="true">
    <span></span>
  </div>
</section>
`;
}

function renderStats(d) {
  const items = d.stats
    .map((s) => `    <div class="stats__item fade-in">
      <span class="stats__value"><span class="stats__number" data-count="${s.value}">0</span><span class="stats__plus">${esc(s.suffix)}</span></span>
      <span class="stats__label">${esc(s.label)}</span>
    </div>`)
    .join('\n');
  return `
<!-- ================= PREUVE SOCIALE ================= -->
<section class="stats">
  <div class="container stats__grid">
${items}
  </div>
</section>
`;
}

function renderPack(pack, orientation) {
  const list = pack.videos.join(',');
  const thumbs = pack.videos
    .map((id, i) => `          <button type="button" class="video-thumb video-thumb--${orientation}" data-videos="${list}" data-index="${i}" aria-label="Voir la vidéo ${i + 1} du pack ${esc(pack.title)}">
            <img class="card__thumb" data-src="https://img.youtube.com/vi/${id}/hqdefault.jpg" width="480" height="360" alt="Miniature de la vidéo ${i + 1} du pack ${esc(pack.title)} : ${esc(pack.thumbAlt)}" loading="lazy">
            <span class="video-thumb__play">${ICON_PLAY_THUMB}</span>
          </button>`)
    .join('\n');
  return `      <div class="pack fade-in">
        <div class="pack__header">
          <h3 class="pack__title">${esc(pack.title)}</h3>
          <p class="pack__desc">${esc(pack.desc)}</p>
        </div>
        <div class="pack__videos">
${thumbs}
        </div>
      </div>`;
}

const SECTION_COMMENTS = {
  vertical: 'VERTICAL MONTAGE',
  filmmaking: 'FILMMAKING PUR',
  horizontal: 'HORIZONTAL MONTAGE'
};

function renderProjectSection(s) {
  const alt = ALT_SECTIONS.includes(s.id) ? ' section--alt' : '';
  return `
<!-- ================= ${SECTION_COMMENTS[s.id] || s.id.toUpperCase()} ================= -->
<section class="section${alt}" id="${s.id}">
  <div class="container">
    <div class="section__header fade-in">
      <span class="section__tag">${esc(s.number)} — ${esc(s.name)}</span>
      <h2 class="section__title">${esc(s.title)}</h2>
      <p class="section__subtitle">${esc(s.subtitle)}</p>
    </div>

    <div class="packs">
${s.packs.map((p) => renderPack(p, s.orientation)).join('\n\n')}
    </div>
  </div>
</section>
`;
}

function renderProcess(d) {
  const pr = d.process;
  const steps = pr.steps
    .map((st, i) => `      <details class="process__step fade-in" name="process-steps">
        <summary class="process__summary">
          <span class="process__number">(${String(i + 1).padStart(2, '0')})</span>
          <span class="process__title">${esc(st.title)}</span>
          <span class="process__icon" aria-hidden="true"></span>
        </summary>
        <div class="process__panel">
          <p class="process__desc">${esc(st.desc)}</p>
          <div class="process__tags">
${st.tags.map((t) => `            <span class="process__tag">${esc(t)}</span>`).join('\n')}
          </div>
        </div>
      </details>`)
    .join('\n\n');
  return `
<!-- ================= À PROPOS / PROCESS ================= -->
<section class="section section--alt" id="process">
  <div class="container">
    <div class="section__header fade-in">
      <span class="section__tag">${esc(pr.number)} — ${esc(pr.name)}</span>
      <h2 class="section__title">${esc(pr.title)}</h2>
      <p class="section__subtitle section__subtitle--accent">${esc(pr.subtitle)}</p>
    </div>

    <div class="process">
${steps}
    </div>
  </div>
</section>
`;
}

function renderTestimonials(d) {
  const t = d.testimonials;
  const items = t.items
    .map((it) => `      <div class="testimonial">
        <div class="testimonial__logo">
          <img src="${it.logo.src}" alt="Logo client — ${esc(it.client)}" width="${it.logo.width}" height="${it.logo.height}" loading="lazy">
        </div>
        <div class="testimonial__content">
          <div class="testimonial__header">
            <span class="testimonial__client">${esc(it.client)}</span>
            <span class="testimonial__service">${esc(it.service)}</span>
          </div>
          <p class="testimonial__quote">« ${esc(it.quote)} »</p>
        </div>
      </div>`)
    .join('\n\n');
  return `
<!-- ================= TÉMOIGNAGES ================= -->
<section class="section" id="temoignages">
  <div class="container">
    <div class="section__header fade-in">
      <span class="section__tag">${esc(t.number)} — ${esc(t.name)}</span>
      <h2 class="section__title">${esc(t.title)}</h2>
      <p class="section__subtitle">${esc(t.subtitle)}</p>
    </div>

    <div class="testimonials fade-in">
${items}

    </div>
  </div>
</section>
`;
}

function renderCta(d) {
  const c = d.cta;
  const socials = c.socials
    .map((k) => `      <a href="${d.contact[k]}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABELS[k]}">${SOCIAL_LABELS[k]}</a>`)
    .join('\n');
  return `
<!-- ================= CTA FINAL ================= -->
<section class="section cta-final" id="contact">
  <div class="container cta-final__inner fade-in">
    <h2 class="cta-final__title">${esc(c.title[0])}<span class="accent">${esc(c.title[1])}</span></h2>
    <p class="cta-final__subtitle">${esc(c.subtitle)}</p>

    <div class="cta-final__buttons">
      <a href="${d.contact.calendly}" class="btn btn--primary" target="_blank" rel="noopener">
        ${ICON_CALENDAR}
        ${esc(c.button)}
      </a>
    </div>

    <div class="cta-final__socials">
${socials}
    </div>
  </div>
</section>
`;
}

function renderFooter(d) {
  const f = d.footer;
  return `
<footer class="footer">
  <div class="container footer__inner">
    <span>&copy; <span id="year"></span> — ${esc(f.rights)}</span>
    <a href="${f.legalUrl}" class="footer__link">${esc(f.legalLabel)}</a>
    <span>${esc(f.tagline)}</span>
  </div>
</footer>

<!-- ================= REEL LIGHTBOX (Montage Vertical — packs swipeables) ================= -->
<div class="reel-lightbox" id="reelLightbox" aria-hidden="true">
  <div class="reel-lightbox__backdrop" id="reelBackdrop"></div>

  <div class="reel-lightbox__shell">
    <button class="reel-lightbox__close" id="reelClose" aria-label="Fermer le pack">&times;</button>
    <span class="reel-lightbox__counter" id="reelCounter">1 / 1</span>

    <div class="reel-lightbox__track" id="reelTrack"></div>

    <button class="reel-lightbox__nav-btn reel-lightbox__nav-btn--prev" id="reelUp" aria-label="Vidéo précédente">
      <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>
    </button>
    <button class="reel-lightbox__nav-btn reel-lightbox__nav-btn--next" id="reelDown" aria-label="Vidéo suivante">
      <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
    </button>

    <p class="reel-lightbox__hint" id="reelHint">Swipe pour voir la suite du pack →</p>
  </div>
</div>

<script src="script.js"></script>
</body>
</html>
`;
}

function render(d, ctx = { base: '' }) {
  const base = ctx.base || '';
  const c = { ...ctx, base };
  return [
    renderHead(d, c),
    renderNav(d),
    renderHero(d),
    renderStats(d),
    ...d.sections.map(renderProjectSection),
    renderProcess(d),
    renderTestimonials(d),
    renderCta(d),
    renderFooter(d).replace('<script src="script.js"></script>', `<script src="${base}script.js"></script>`)
  ].join('');
}

module.exports = { render };
