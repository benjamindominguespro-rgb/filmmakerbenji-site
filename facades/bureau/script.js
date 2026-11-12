/* Façade « bureau » : dossiers dans l'explorateur, lecteur vidéo, fenêtres déplaçables, animations légères. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };

  /* ---------- Barres de chargement « Windows XP » : des blocs verts qui s'ajoutent par à-coups ---------- */
  var BLOCK = 21; /* 18 px de vert + 3 px d'espace */

  function blocksFit(track) {
    return Math.max(1, Math.floor((track.clientWidth - 4 + 3) / BLOCK));
  }
  function setBlocks(fill, n) {
    fill._n = n;
    fill.style.clipPath = n <= 0 ? 'inset(0 100% 0 0)' : 'inset(0 calc(100% - ' + (n * BLOCK - 3) + 'px) 0 0)';
  }
  /* Avance (ou recule) bloc par bloc, avec des pauses irrégulières comme un vrai chargement XP */
  function animateBlocks(fill, to, totalMs, done) {
    clearTimeout(fill._t);
    var from = fill._n || 0;
    if (reduceMotion || from === to) { setBlocks(fill, to); if (done) done(); return; }
    var dir = to > from ? 1 : -1;
    var base = totalMs / Math.abs(to - from);
    (function tick() {
      if (fill._n === to) { if (done) done(); return; }
      setBlocks(fill, fill._n + dir);
      fill._t = setTimeout(tick, base * (0.3 + Math.random() * 1.4));
    })();
  }

  /* ---------- Explorateur : onglets, dossiers ouverts, retour ---------- */
  var explorer = $('#explorer');
  var tabs = $$('.b-tab');
  var panels = $$('.b-grid:not(.b-grid--videos), .b-count:not(#folderCount)');
  var pathBar = $('#folderPath');
  var loadbar = $('#loadbar');
  var loadFill = $('.b-loadbar__fill', loadbar);
  var loadTrack = $('.b-loadbar__track', loadbar);
  var folderView = $('#folderView');
  var folderGrid = $('#folderGrid');
  var folderCount = $('#folderCount');
  var folderAddr = $('#folderAddr');
  var backBtn = $('#folderBack');
  var loadTimer = null;
  var openedCard = null;
  var inFolder = false;

  function activeTab() {
    return tabs.filter(function (t) { return t.classList.contains('is-active'); })[0] || tabs[0];
  }

  function markTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
    });
    if (pathBar) pathBar.textContent = tab.getAttribute('data-folder');
  }
  function showPanel(tab) {
    panels.forEach(function (el) {
      var id = el.classList.contains('b-count') ? el.getAttribute('data-for') : el.id;
      el.hidden = id !== tab.getAttribute('aria-controls');
    });
  }

  /* Chargement du dossier : la barre se remplit par blocs, puis on affiche le contenu */
  function runLoader(then) {
    clearTimeout(loadTimer);
    panels.forEach(function (el) { el.hidden = true; });
    folderView.hidden = true;
    explorer.setAttribute('aria-busy', 'true');
    loadbar.hidden = false;
    setBlocks(loadFill, 0);
    animateBlocks(loadFill, blocksFit(loadTrack), 300, function () {
      loadTimer = setTimeout(function () {
        loadbar.hidden = true;
        explorer.removeAttribute('aria-busy');
        then();
      }, reduceMotion ? 0 : 60);
    });
  }

  function selectTab(tab, focus) {
    if (focus) tab.focus();
    if (inFolder) closeFolder(true);
    if (tab.classList.contains('is-active') && !explorer.hasAttribute('aria-busy')) return;
    markTab(tab);
    if (reduceMotion) { showPanel(tab); return; }
    runLoader(function () { showPanel(tab); });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function buildFolder(card) {
    var ids = card.getAttribute('data-videos').split(',').filter(Boolean);
    var orient = card.getAttribute('data-orientation');
    var title = card.getAttribute('data-title');
    var names = [];
    try { names = JSON.parse(card.getAttribute('data-names') || '[]'); } catch (err) { names = []; }
    folderGrid.innerHTML = '';
    folderGrid.classList.toggle('is-vertical', orient === 'vertical');
    ids.forEach(function (id, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'b-vid';
      b.style.setProperty('--n', String(i));
      b.setAttribute('role', 'listitem');
      b.setAttribute('data-videos', ids.join(','));
      b.setAttribute('data-orientation', orient);
      b.setAttribute('data-index', String(i));
      b.setAttribute('data-title', title);
      b.setAttribute('data-names', JSON.stringify(names));
      var label = names[i] || ('Vidéo ' + (i + 1));
      b.setAttribute('aria-label', 'Lire la vidéo : ' + label);
      b.title = label;
      /* le titre YouTube est du texte : on l'insère en textContent (jamais en HTML) */
      var bar = document.createElement('span');
      bar.className = 'b-card__file';
      bar.textContent = label;
      b.appendChild(bar);
      var media = document.createElement('span');
      media.className = 'b-vid__media';
      media.innerHTML =
        '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="" width="480" height="360" loading="lazy" decoding="async">' +
        '<span class="b-vid__play"><svg width="14" height="14" viewBox="0 0 14 14" fill="#10153A" aria-hidden="true"><path d="M3 1l10 6-10 6z"/></svg></span>';
      b.appendChild(media);
      folderGrid.appendChild(b);
    });
    var path = activeTab().getAttribute('data-folder') + '\\' + title;
    folderAddr.textContent = path;
    folderCount.textContent = ids.length + ' ' + folderCount.getAttribute('data-unit');
    if (pathBar) pathBar.textContent = path;
  }

  function openFolder(card) {
    openedCard = card;
    var show = function () {
      buildFolder(card);
      inFolder = true;
      explorer.classList.add('b-explorer-folder');
      folderView.hidden = false;
      folderView.classList.remove('b-view-back');
      folderView.classList.add('b-view-in');
      backBtn.focus({ preventScroll: true });
    };
    if (reduceMotion) { panels.forEach(function (el) { el.hidden = true; }); show(); return; }
    runLoader(show);
  }

  function closeFolder(silent) {
    if (!inFolder) return;
    inFolder = false;
    explorer.classList.remove('b-explorer-folder');
    folderView.hidden = true;
    var tab = activeTab();
    markTab(tab);
    showPanel(tab);
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    if (!silent && panel) {
      panel.classList.remove('b-view-in');
      panel.classList.add('b-view-back');
      setTimeout(function () { panel.classList.remove('b-view-back'); }, 300);
    }
    if (!silent && openedCard) openedCard.focus({ preventScroll: true });
  }

  $$('.b-card[data-open-folder]').forEach(function (card) {
    card.addEventListener('click', function () { openFolder(card); });
  });
  backBtn.addEventListener('click', function () { closeFolder(); });

  /* ---------- Lecteur vidéo ---------- */
  var box = $('#lightbox');
  var win = $('.b-lb__win', box);
  var stage = $('#lbStage');
  var title = $('#lbTitle');
  var count = $('#lbCount');
  var nav = $('#lbNav');
  var prevBtn = $('#lbPrev');
  var nextBtn = $('#lbNext');
  var closeBtn = $('#lbClose');
  var reelVideo = $('#reelVideo');

  var videos = [];
  var videoNames = [];
  var packTitle = '';
  var index = 0;
  var opener = null;
  var isFull = false;

  function show() {
    stage.innerHTML = '';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + videos[index] + '?autoplay=1&rel=0&playsinline=1';
    iframe.title = 'Lecteur vidéo YouTube';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    stage.appendChild(iframe);
    count.textContent = videos.length > 1 ? (index + 1) + ' / ' + videos.length : '';
    nav.hidden = videos.length < 2;
    /* la barre du lecteur affiche le vrai titre de la vidéo en cours */
    title.textContent = videoNames[index] || packTitle;
  }

  function open(trigger) {
    videos = trigger.getAttribute('data-videos').split(',').map(function (v) { return v.trim(); }).filter(Boolean);
    index = Math.min(Number(trigger.getAttribute('data-index') || 0), videos.length - 1);
    opener = trigger;
    isFull = trigger.getAttribute('data-fullscreen') === '1';
    box.classList.toggle('b-lb--full', isFull);
    win.setAttribute('data-orientation', trigger.getAttribute('data-orientation') || 'horizontal');
    packTitle = trigger.getAttribute('data-title') || '';
    try { videoNames = JSON.parse(trigger.getAttribute('data-names') || '[]'); } catch (err) { videoNames = []; }
    show();
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (reelVideo) reelVideo.pause();
    closeBtn.focus();
  }

  function close() {
    if (!box.classList.contains('is-open')) return;
    box.classList.remove('is-open', 'b-lb--full');
    box.setAttribute('aria-hidden', 'true');
    stage.innerHTML = '';
    document.body.style.overflow = '';
    resumeReel();
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
  }

  function step(delta) {
    if (videos.length < 2) return;
    index = (index + delta + videos.length) % videos.length;
    show();
  }

  $$('.js-reel').forEach(function (el) {
    el.addEventListener('click', function () { open(el); });
  });
  /* Les vidéos d'un dossier ouvert sont créées à la volée : on écoute le conteneur */
  folderGrid.addEventListener('click', function (e) {
    var b = e.target.closest('.b-vid');
    if (b) open(b);
  });
  closeBtn.addEventListener('click', close);
  $('[data-close]', box).addEventListener('click', close);
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (box.classList.contains('is-open')) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      return;
    }
    /* Dans un dossier : Retour arrière, Échap ou Alt + ← pour remonter, sans toucher à la souris */
    if (inFolder) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ''));
      if (!typing && (e.key === 'Backspace' || e.key === 'Escape' || (e.altKey && e.key === 'ArrowLeft'))) {
        e.preventDefault();
        closeFolder();
      }
    }
  });
  /* ---------- Fenêtre du showreel : vidéo en boucle, barre de progression vivante ---------- */
  var reelFill = $('#reelFill');
  var reelTime = $('#reelTime');
  var reelVisible = true;

  function fmt(t) {
    t = Math.max(0, Math.floor(t || 0));
    return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
  }
  function resumeReel() {
    if (!reelVideo || reduceMotion || !reelVisible || document.hidden) return;
    var p = reelVideo.play();
    if (p && p.catch) p.catch(function () {});
  }
  if (reelVideo) {
    reelVideo.muted = true;
    reelVideo.defaultMuted = true;
    reelVideo.addEventListener('timeupdate', function () {
      if (!reelVideo.duration) return;
      reelFill.style.transform = 'scaleX(' + (reelVideo.currentTime / reelVideo.duration).toFixed(3) + ')';
      reelTime.textContent = fmt(reelVideo.currentTime) + ' / ' + fmt(reelVideo.duration);
    });
    if (reduceMotion) reelVideo.pause();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) reelVideo.pause(); else resumeReel();
    });
  }

  /* ---------- Boutons de barre de titre ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.b-tb[data-act]');
    if (!b) return;
    var w = b.closest('.b-win');
    var act = b.getAttribute('data-act');
    if (act === 'min') {
      w.classList.toggle('is-min');
    } else if (act === 'max') {
      var reel = w.hasAttribute('data-reel') && $('.js-reel', w);
      if (reel) { reel.click(); return; }
      w.classList.remove('is-pulse');
      void w.offsetWidth;
      w.classList.add('is-pulse');
      setTimeout(function () { w.classList.remove('is-pulse'); }, 450);
    } else if (act === 'close') {
      w.classList.remove('is-closing');
      void w.offsetWidth;
      w.classList.add('is-closing');
      setTimeout(function () { w.classList.remove('is-closing'); }, 950);
    }
  });

  /* ---------- Déplacer les fenêtres : on les saisit et on les glisse ---------- */
  var DRAGGABLE = '.b-win:not(.b-lb__win), .b-form';
  var CONTROLS = 'button, a, input, textarea, select, label, summary, iframe, [role="tab"]';
  var MAX_PULL = 44; /* distance maximale (px) dont une fenêtre peut s'écarter de sa place */
  var drag = null;

  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    var w = e.target.closest(DRAGGABLE);
    if (!w || e.target.closest(CONTROLS)) return;
    /* Au doigt, seule la barre de titre déplace (le reste doit pouvoir faire défiler la page) */
    if (e.pointerType !== 'mouse' && !e.target.closest('.b-win__bar')) return;
    /* Si la fenêtre rebondit encore, on repart de sa position visible */
    var cur = (getComputedStyle(w).translate || '').split(' ');
    clearTimeout(w._releaseTimer);
    w.classList.remove('is-releasing');
    drag = {
      w: w, id: e.pointerId, x: e.clientX, y: e.clientY, on: false,
      ox: parseFloat(cur[0]) || 0,
      oy: parseFloat(cur[1]) || 0
    };
  });
  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.on) {
      if (Math.abs(dx) + Math.abs(dy) < 6) return;
      drag.on = true;
      drag.w.classList.add('is-dragging');
      document.body.classList.add('b-grabbing');
      try { drag.w.setPointerCapture(e.pointerId); } catch (err) { /* ignoré */ }
      if (window.getSelection) window.getSelection().removeAllRanges();
    }
    /* Effet élastique : plus on tire, plus ça résiste, et ça ne s'éloigne jamais de plus de ~MAX_PULL px */
    var rx = drag.ox + dx, ry = drag.oy + dy;
    var mag = Math.sqrt(rx * rx + ry * ry) || 1;
    var eff = MAX_PULL * Math.tanh(mag / MAX_PULL);
    drag.w.style.setProperty('--dx', (rx / mag * eff).toFixed(1) + 'px');
    drag.w.style.setProperty('--dy', (ry / mag * eff).toFixed(1) + 'px');
  });
  function endDrag(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.on) {
      var w = drag.w;
      w.classList.remove('is-dragging');
      document.body.classList.remove('b-grabbing');
      /* Relâchée : elle rebondit jusqu'à sa place d'origine */
      w.classList.add('is-releasing');
      w.style.setProperty('--dx', '0px');
      w.style.setProperty('--dy', '0px');
      clearTimeout(w._releaseTimer);
      w._releaseTimer = setTimeout(function () { w.classList.remove('is-releasing'); }, 1000);
    }
    drag = null;
  }
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  /* ---------- Chiffres : apparition depuis la barre des tâches, puis saisie avec curseur clignotant ---------- */
  function typeStat(win) {
    var text = $('.b-stat__text', win);
    if (!text || text._done) return;
    text._done = true;
    var full = text.getAttribute('data-full') || text.textContent;
    var caret = $('.b-caret', win);
    if (reduceMotion) { text.textContent = full; if (caret) caret.classList.add('is-gone'); return; }
    var i = 0;
    (function next() {
      i += 1;
      text.textContent = full.slice(0, i);
      if (i < full.length) { setTimeout(next, 130); return; }
      /* le texte est écrit : le curseur clignote encore un instant puis disparaît */
      if (caret) setTimeout(function () { caret.classList.add('is-gone'); }, 700);
    })();
  }

  /* ---------- Légèreté : apparitions au scroll, pause des animations hors écran ---------- */
  /* Toutes les fenêtres apparaissent comme si elles sortaient de la barre des tâches (bas de l'écran).
     Elles partent décalées vers le bas : un IntersectionObserver ne les verrait jamais. On compare donc
     leur position de mise en page (offsetTop ignore les décalages d'animation) au bas de l'écran. */
  /* le chiffre est vidé tant que la fenêtre n'est pas apparue : il se saisira en direct (le texte reste dans la page pour les lecteurs d'écran) */
  $$('.b-stat__text').forEach(function (t) {
    t.setAttribute('data-full', t.textContent);
    if (!reduceMotion) t.textContent = '';
  });
  var pendingReveal = $$('.b-reveal');
  function pageTop(el) {
    var y = 0;
    while (el) { y += el.offsetTop; el = el.offsetParent; }
    return y;
  }
  var revealRaf = 0;
  function checkReveal() {
    revealRaf = 0;
    var limit = window.pageYOffset + window.innerHeight * 0.94;
    var k = 0;
    pendingReveal = pendingReveal.filter(function (el) {
      if (pageTop(el) > limit) return true;
      el.style.setProperty('--i', String(k));
      el.classList.add('is-in');
      if (el.classList.contains('b-win--stat')) {
        setTimeout(function () { typeStat(el); }, reduceMotion ? 0 : 420 + k * 130);
      }
      k += 1;
      return false;
    });
    if (!pendingReveal.length) {
      window.removeEventListener('scroll', queueReveal);
      window.removeEventListener('resize', queueReveal);
    }
  }
  function queueReveal() { if (!revealRaf) revealRaf = requestAnimationFrame(checkReveal); }
  window.addEventListener('scroll', queueReveal, { passive: true });
  window.addEventListener('resize', queueReveal);
  queueReveal();

  if ('IntersectionObserver' in window) {
    var pauseObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        en.target.classList.toggle('is-offscreen', !en.isIntersecting);
        if (en.target.id === 'top') {
          reelVisible = en.isIntersecting;
          if (reelVideo) { if (reelVisible) resumeReel(); else reelVideo.pause(); }
        }
      });
    }, { rootMargin: '120px 0px' });
    $$('.b-hero, .b-ticker, .b-stats, .b-process, .b-contact, .b-h2').forEach(function (el) { pauseObs.observe(el); });
  }

  /* ---------- Assistant : cliquer une étape fait avancer la barre (par blocs) ---------- */
  var steps = $$('.b-step__btn');
  var setupFill = $('#setupFill');
  var setupBar = setupFill && setupFill.parentNode;
  var setupNext = $('#setupNext');
  var currentStep = 1;

  function targetBlocks(n) {
    var pct = Number(steps[n - 1].getAttribute('data-percent'));
    return Math.round(pct / 100 * blocksFit(setupBar));
  }
  function selectStep(n) {
    currentStep = n;
    steps.forEach(function (btn) {
      var i = Number(btn.getAttribute('data-step'));
      var li = btn.parentNode;
      li.classList.toggle('is-done', i < n);
      li.classList.toggle('is-current', i === n);
      if (i === n) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
    });
    animateBlocks(setupFill, targetBlocks(n), 520);
    setupBar.setAttribute('aria-valuenow', steps[n - 1].getAttribute('data-percent'));
  }

  if (steps.length && setupFill) {
    var cur = steps.filter(function (b) { return b.hasAttribute('aria-current'); })[0];
    currentStep = cur ? Number(cur.getAttribute('data-step')) : 1;
    setBlocks(setupFill, targetBlocks(currentStep));
    var resizeRaf = 0;
    window.addEventListener('resize', function () {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(function () { setBlocks(setupFill, targetBlocks(currentStep)); });
    });
    steps.forEach(function (btn) {
      btn.addEventListener('click', function () { selectStep(Number(btn.getAttribute('data-step'))); });
    });
    /* "Suivant" avance d'une étape ; à la dernière, il mène à la section suivante */
    if (setupNext) {
      setupNext.addEventListener('click', function (e) {
        if (currentStep < steps.length) { e.preventDefault(); selectStep(currentStep + 1); }
      });
    }
  }

  /* ---------- Messagerie : choisir un contact met sa conversation en avant ---------- */
  var chatBtns = $$('.b-chat__who');
  var msgs = $$('.b-msg');
  var activeChat = -1;
  var typingTimer = null;

  function selectChat(i) {
    clearTimeout(typingTimer);
    msgs.forEach(function (m) { m.classList.remove('is-typing'); });
    if (activeChat === i) {
      activeChat = -1;
      chatBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      msgs.forEach(function (m) { m.classList.remove('is-dim', 'is-active'); });
      return;
    }
    activeChat = i;
    chatBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    msgs.forEach(function (m, j) {
      m.classList.toggle('is-dim', j !== i);
      m.classList.remove('is-active');
    });
    var m = msgs[i];
    var reveal = function () {
      m.classList.remove('is-typing');
      m.classList.add('is-active');
    };
    if (reduceMotion) reveal();
    else { m.classList.add('is-typing'); typingTimer = setTimeout(reveal, 720); }
    var r = m.getBoundingClientRect();
    if (r.top < 90 || r.bottom > window.innerHeight - 20) {
      m.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  chatBtns.forEach(function (b, i) { b.addEventListener('click', function () { selectChat(i); }); });

  /* ---------- Bouton « Copier » l'adresse email ---------- */
  var copyBtn = $('#copyMail');
  if (copyBtn) {
    var copyTimer = 0;
    var copyDone = function () {
      copyBtn.textContent = copyBtn.getAttribute('data-done');
      copyBtn.classList.add('is-done');
      clearTimeout(copyTimer);
      copyTimer = setTimeout(function () {
        copyBtn.textContent = copyBtn.getAttribute('data-label');
        copyBtn.classList.remove('is-done');
      }, 2000);
    };
    var copyFallback = function (text) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    };
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(copyDone, function () { if (copyFallback(text)) copyDone(); });
      } else if (copyFallback(text)) {
        copyDone();
      }
    });
  }
})();
