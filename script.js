(() => {
  'use strict';

  /* =========================================================
     NAV: scroll shadow + mobile burger menu
  ========================================================= */
  const nav = document.getElementById('nav');
  const navBurger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  navBurger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navBurger.classList.toggle('is-active', isOpen);
    navBurger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navBurger.classList.remove('is-active');
      navBurger.setAttribute('aria-expanded', 'false');
    });
  });

  /* =========================================================
     SMOOTH SCROLL for anchor / data-scroll links
  ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =========================================================
     FADE-IN ON SCROLL (IntersectionObserver)
  ========================================================= */
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: '0px 0px -10px 0px' }
  );
  fadeEls.forEach((el) => fadeObserver.observe(el));

  /* =========================================================
     STAT COUNTERS
  ========================================================= */
  const statNumbers = document.querySelectorAll('.stats__number');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  statNumbers.forEach((el) => statsObserver.observe(el));

  /* =========================================================
     LAZY-LOAD CARD THUMBNAILS
  ========================================================= */
  const thumbs = document.querySelectorAll('.card__thumb[data-src]');
  const thumbObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          if (img.complete) img.classList.add('is-loaded');
          thumbObserver.unobserve(img);
        }
      });
    },
    { rootMargin: '200px' }
  );
  thumbs.forEach((img) => thumbObserver.observe(img));

  /* =========================================================
     REEL LIGHTBOX: packs de vidéos swipeables (Vertical / Horizontal / Filmmaking)
  ========================================================= */
  const reelLightbox = document.getElementById('reelLightbox');
  const reelBackdrop = document.getElementById('reelBackdrop');
  const reelClose = document.getElementById('reelClose');
  const reelTrack = document.getElementById('reelTrack');
  const reelCounter = document.getElementById('reelCounter');
  const reelUp = document.getElementById('reelUp');
  const reelDown = document.getElementById('reelDown');
  const reelHint = document.getElementById('reelHint');

  let reelSlideObserver = null;
  let reelHintTimer = null;
  let reelVideoCount = 0;

  const buildReelSlide = (videoId, index) => {
    const slide = document.createElement('div');
    slide.className = 'reel-slide';
    slide.dataset.index = String(index);
    slide.dataset.video = videoId;
    const player = document.createElement('div');
    player.className = 'reel-slide__player';
    slide.appendChild(player);
    return slide;
  };

  const loadReelSlide = (slide) => {
    const player = slide.querySelector('.reel-slide__player');
    if (player.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${slide.dataset.video}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = 'Lecteur vidéo YouTube';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    player.appendChild(iframe);
  };

  const unloadReelSlide = (slide) => {
    slide.querySelector('.reel-slide__player').innerHTML = '';
  };

  const updateReelNav = (index) => {
    reelCounter.textContent = `${index + 1} / ${reelVideoCount}`;
    reelUp.disabled = index === 0;
    reelDown.disabled = index === reelVideoCount - 1;
  };

  const openReel = (videoIds, orientation) => {
    reelVideoCount = videoIds.length;
    reelTrack.innerHTML = '';
    reelTrack.classList.toggle('reel-lightbox__track--vertical', orientation === 'vertical');
    reelTrack.classList.toggle('reel-lightbox__track--horizontal', orientation === 'horizontal');
    videoIds.forEach((id, i) => reelTrack.appendChild(buildReelSlide(id, i)));

    reelLightbox.classList.add('is-open');
    reelLightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    reelTrack.scrollTop = 0;
    updateReelNav(0);

    reelHint.classList.toggle('is-hidden', reelVideoCount <= 1);
    clearTimeout(reelHintTimer);
    reelHintTimer = setTimeout(() => reelHint.classList.add('is-hidden'), 2600);

    const slides = reelTrack.querySelectorAll('.reel-slide');
    reelSlideObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slide = entry.target;
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            loadReelSlide(slide);
            updateReelNav(Number(slide.dataset.index));
          } else {
            unloadReelSlide(slide);
          }
        });
      },
      { root: reelTrack, threshold: [0, 0.6] }
    );
    slides.forEach((slide) => reelSlideObserver.observe(slide));
  };

  const closeReel = () => {
    reelLightbox.classList.remove('is-open');
    reelLightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (reelSlideObserver) {
      reelSlideObserver.disconnect();
      reelSlideObserver = null;
    }
    reelTrack.innerHTML = '';
  };

  const scrollReel = (direction) => {
    reelTrack.scrollBy({ left: direction * reelTrack.clientWidth, behavior: 'smooth' });
  };

  document.querySelectorAll('[data-videos]').forEach((card) => {
    const videoIds = card.dataset.videos.split(',').map((id) => id.trim()).filter(Boolean);
    const orientation = card.classList.contains('card--horizontal') ? 'horizontal' : 'vertical';

    const badge = document.createElement('span');
    badge.className = 'card__badge';
    badge.textContent = videoIds.length > 1 ? `${videoIds.length} vidéos` : '1 vidéo';
    card.querySelector('.card__media').appendChild(badge);

    const open = () => openReel(videoIds, orientation);
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  reelClose.addEventListener('click', closeReel);
  reelBackdrop.addEventListener('click', closeReel);
  reelUp.addEventListener('click', () => scrollReel(-1));
  reelDown.addEventListener('click', () => scrollReel(1));
  document.addEventListener('keydown', (e) => {
    if (!reelLightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeReel();
    if (e.key === 'ArrowRight') scrollReel(1);
    if (e.key === 'ArrowLeft') scrollReel(-1);
  });

  /* =========================================================
     FOOTER YEAR
  ========================================================= */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
