/*
 * CONTENU DU SITE : un seul fichier pour tous les textes, projets, avis, chiffres, liens et médias.
 * Toutes les façades (facades/classique, facades/bureau...) lisent ce fichier.
 * Modifier ici = modifier le site, quelle que soit la façade publiée.
 *
 * Les médias (images, vidéos) restent dans /assets et sont communs à toutes les façades.
 * Les blocs `copy.<facade>` contiennent seulement les petits textes de décor propres à une façade
 * (titres de fenêtres, noms de fichiers...).
 */
module.exports = {
  site: {
    name: 'FilmMakerBenji',
    url: 'https://filmmakerbenji.com/',
    lang: 'fr',
    locale: 'fr_FR',
    favicon: 'assets/favicon.svg'
  },

  contact: {
    calendly: 'https://calendly.com/benjamin-domingues-pro/30min',
    email: 'Benjamin.domingues.pro@gmail.com',
    instagram: 'https://www.instagram.com/filmmakerbenji/',
    youtube: 'https://www.youtube.com/@Lizard.King02',
    linkedin: 'https://www.linkedin.com/in/benjamin-domingues-87aa35220/',
    whatsapp: 'https://wa.me/33760474672'
  },

  seo: {
    title: 'Vidéaste Freelance — Monteur & Filmmaker',
    description: "Monteur vidéo freelance et motion designer basé en Île-de-France (Paris) — montage Shorts, Reels, vidéos YouTube et captation d'événements pour marques et créateurs.",
    shareTitle: 'FilmMakerBenji — Monteur vidéo freelance & Filmmaker',
    image: { url: 'https://filmmakerbenji.com/assets/og-image.jpg', width: 1200, height: 630 },
    person: {
      name: 'Benjamin Domingues',
      alternateName: 'FilmMakerBenji',
      jobTitle: 'Monteur vidéo freelance & Filmmaker',
      description: "Monteur vidéo freelance et motion designer basé en Île-de-France, spécialisé en montage Shorts, Reels, vidéos YouTube et captation d'événements.",
      image: 'https://filmmakerbenji.com/assets/hero.jpg',
      region: 'Île-de-France',
      country: 'FR',
      areaServed: 'Île-de-France, France',
      knowsAbout: ['Montage vidéo', 'Motion design', "Captation d'événements", 'Montage Shorts et Reels', 'Filmmaking']
    }
  },

  nav: {
    links: ['Projets', 'Process', 'Avis'],
    cta: 'Réserver un appel'
  },

  hero: {
    title: ['Je transforme tes idées en ', 'vidéos qui marquent'],
    portrait: {
      src: 'assets/hero.jpg',
      alt: 'Portrait de Benjamin, monteur vidéo et filmmaker freelance en Île-de-France',
      width: 400,
      height: 400
    },
    video: { src: '/assets/hero-loop.mp4', poster: '/assets/hero-poster.jpg' },
    primaryButton: 'Réserver un appel',
    showreelButton: 'Voir le showreel',
    tagsLabel: 'Spécialités',
    tags: [
      { label: 'Monteur vidéo' },
      { label: 'Motion designer' },
      { label: 'Cadreur' },
      { label: 'Paris', location: true }
    ]
  },

  showreel: {
    youtubeId: '1qzMd_nkMtM',
    orientation: 'horizontal'
  },

  stats: [
    { value: 200, suffix: '+', label: 'Vidéos livrées' },
    { value: 10, suffix: '+', label: 'Clients accompagnés' },
    { value: 2, suffix: 'M+', label: 'Vues générées' }
  ],

  /* Projets : l'ordre ici est l'ordre d'affichage. `videos` = identifiants YouTube du pack. */
  sections: [
    {
      "id": "vertical",
      "number": "01",
      "name": "Vertical",
      "title": "Montage Vertical",
      "subtitle": "Montage de Shorts, ADS et capsules à partir de rushs fournis",
      "orientation": "vertical",
      "packs": [
        {
          "title": "Contenu Full Motion Design",
          "desc": "Contenu organique ou payant, composition soignée, pensée pour capter l'attention dès les premières secondes.",
          "thumbAlt": "contenu vertical animé en motion design",
          "videos": [
            "-qeHvuo6TIE",
            "J2g7cJxiuhY",
            "GwaCBiVYvwk",
            "WANBSzi6tFY",
            "XQYCM-ct-oM"
          ],
          "card": {
            "file": "full_motion.mp4",
            "tag": "Motion design"
          }
        },
        {
          "title": "Shorts Maxim",
          "desc": "Contenu court format humoristique au rythme soutenu.",
          "thumbAlt": "contenu vertical humoristique au montage rythmé",
          "videos": [
            "e8efNAixBOU",
            "vU4AQWY_5vQ",
            "R8mprEDphx8",
            "MMhZk0c6iMg",
            "nZtg2hiuW6k",
            "gqYa62a39dE",
            "Gf1jNT6-KlA",
            "cmmQtqMlH8g",
            "MRIsm34iSeo"
          ],
          "card": {
            "file": "shorts_maxim.mp4",
            "tag": "humour, rythme"
          }
        },
        {
          "title": "Shorts VK",
          "desc": "Série de shorts dynamiques montés pour maximiser la rétention et l'engagement.",
          "thumbAlt": "montage vertical dynamique pour les réseaux sociaux",
          "videos": [
            "c25E4Pr6YAg",
            "S94_XH8efXk",
            "xu5Vj8Lk7F0",
            "iwOEv47wsLg",
            "Mjg4cV5hewY",
            "Wxdbd0qDoWw",
            "pjZNyvSEfXg",
            "JS_0odlV0CA"
          ],
          "card": {
            "file": "shorts_vk.mp4",
            "tag": "rétention"
          }
        },
        {
          "title": "ADS Viral Script",
          "desc": "Publicité courte au script percutant, pensée pour convertir dès les 3 premières secondes.",
          "thumbAlt": "publicité verticale courte au script percutant",
          "videos": [
            "0RDK-WHY3Es",
            "OxqndhCCAU0",
            "Tv_Yxw3HZXA"
          ],
          "card": {
            "file": "ads_viral.mp4",
            "tag": "publicité"
          }
        },
        {
          "title": "ADS Pôle Sportif",
          "desc": "Publicité verticale pour un club sportif, montage énergique orienté conversion.",
          "thumbAlt": "publicité verticale sportive et énergique",
          "videos": [
            "KhQKQmDliG4",
            "er0m_RUpfr4",
            "VqQf3grUOeo"
          ],
          "card": {
            "file": "ads_pole_sportif.mp4",
            "tag": "publicité"
          }
        }
      ]
    },
    {
      "id": "filmmaking",
      "number": "02",
      "name": "Filmmaking",
      "title": "Filmmaking Pur",
      "subtitle": "De la captation à la livraison finale, je filme et je monte",
      "orientation": "horizontal",
      "packs": [
        {
          "title": "Interviews VK",
          "desc": "Captation multicaméra et montage d'interviews, lumière et son soignés.",
          "thumbAlt": "captation d'interview multicamâra en format horizontal",
          "videos": [
            "1FOYUFylOfM",
            "bXw-dl4oVo0",
            "_WprU-ZTiVk"
          ],
          "card": {
            "file": "interviews_vk.mp4",
            "tag": "Multicaméra"
          }
        },
        {
          "title": "Drop Music",
          "desc": "Teasers dans l'évènementiel, image travaillée et étalonnage cinéma.",
          "thumbAlt": "teaser événementiel au montage horizontal façon cinéma",
          "videos": [
            "rqcfxQfCJMA",
            "BCj-Dx-I8us",
            "we5kJbFnb6s",
            "HXU32qSRI2w"
          ],
          "card": {
            "file": "drop_music.mp4",
            "tag": "Teasers événementiels"
          }
        },
        {
          "title": "Mode Storytelling",
          "desc": "Formats courts façon documentaire, narration incarnée et image plus brute.",
          "thumbAlt": "format documentaire court en montage horizontal",
          "videos": [
            "TQNSmwAAUUs",
            "sBjwnqnuZHo",
            "yj_yWx_2mwU"
          ],
          "card": {
            "file": "mode_storytelling.mp4",
            "tag": "Documentaire court"
          }
        },
        {
          "title": "Gala de Boxe Sartrouville",
          "desc": "Captation sportive live, montage recap avec rythme et intensité.",
          "thumbAlt": "captation événementielle sportive en format horizontal",
          "videos": [
            "qKFQtUVCL80",
            "W5X2XD7ilCo"
          ],
          "card": {
            "file": "gala_boxe.mp4",
            "tag": "Captation sportive live"
          }
        },
        {
          "title": "Car Edit",
          "desc": "Vidéo automobile, plans dynamiques, VFX et sound design pour une esthétique premium.",
          "thumbAlt": "film automobile dynamique en montage horizontal",
          "videos": [
            "zbaRKkQ1Noc",
            "d59rEjBKRaM",
            "2mEf71Y5bvg",
            "TSDNNMUtcKE"
          ],
          "card": {
            "file": "car_edit.mp4",
            "tag": "Auto · VFX · sound design"
          }
        }
      ]
    },
    {
      "id": "horizontal",
      "number": "03",
      "name": "Horizontal",
      "title": "Montage Horizontal",
      "subtitle": "Montage de vidéos YouTube, VSL et vlogs à partir de rushs fournis",
      "orientation": "horizontal",
      "packs": [
        {
          "title": "Projets YouTube",
          "desc": "Montage long format avec narration structurée, habillage graphique et sound design.",
          "thumbAlt": "montage YouTube long format avec habillage graphique",
          "videos": [
            "l05MuTr3bcM",
            "129adgWSHlo",
            "IFzpy7IZQSw"
          ],
          "card": {
            "file": "youtube.mp4",
            "tag": "Format long"
          }
        },
        {
          "title": "VSL",
          "desc": "Video Sales Letter pensée pour maintenir l'attention et guider vers la conversion.",
          "thumbAlt": "vidéo de vente (VSL) au montage horizontal orienté conversion",
          "videos": [
            "kzXdAPmZCFQ",
            "qy0skRYwP-Q",
            "2tls6rtIIEw",
            "cVP05OzIiHg"
          ],
          "card": {
            "file": "vsl.mp4",
            "tag": "Vidéos de vente"
          }
        },
        {
          "title": "Projets Personnels",
          "desc": "Explorations créatives libres, terrain d'expérimentation pour de nouveaux styles de montage.",
          "thumbAlt": "projet vidéo personnel et créatif au format horizontal",
          "videos": [
            "lKiB2RytwVI",
            "MLq6XAQ8GN8",
            "EPrpfofV-Mw",
            "s3mik3R8OKk"
          ],
          "card": {
            "file": "perso.mp4",
            "tag": "Carte blanche"
          }
        }
      ]
    }
  ],

  process: {
    number: '04',
    name: 'Process',
    title: 'Comment ça se passe',
    subtitle: "On avance sans flou ni allers-retours à rallonge : un brief clair dès le départ, un planning tenu, un montage pensé pour servir ton objectif.",
    steps: [
      { title: 'Brief', desc: "Un appel au cours duquel je suis à l'écoute de vos besoins et vous propose les meilleures solutions pour y répondre.", tags: ['Écoute', 'Objectifs', 'Références', 'Devis'] },
      { title: 'Tournage / Captation', desc: 'Je me déplace pour filmer et donner vie au projet.', tags: ['Repérage', 'Cadrage', 'Son', 'Lumière', 'Multicaméra'] },
      { title: 'Montage', desc: "J'assemble et je dynamise les images tournées.", tags: ['Rythme', 'Sound design', 'Étalonnage', 'Habillage graphique'] },
      { title: 'Révisions', desc: "J'ajuste la vidéo selon vos retours.", tags: ['Retours client', 'Ajustements', 'Validation'] },
      { title: 'Livraison', desc: 'Je vous livre la vidéo finalisée, prête à être diffusée.', tags: ['Formats optimisés', 'Fichiers sources', 'Diffusion'] }
    ]
  },

  testimonials: {
    number: '05',
    name: 'Avis',
    title: 'Témoignages',
    subtitle: "Ce qu'ils pensent du résultat",
    items: [
      { client: 'Drop Music', service: 'Filmmaking Pur', logo: { src: 'assets/logos/drop-music.png', width: 640, height: 237 }, quote: "De la captation à la livraison finale, Benjamin a assuré tous les process pour rendre les meilleures vidéos. Plus qu'un exécutant, c'est un vrai bras droit créatif !" },
      { client: 'VK Studio', service: 'Filmmaking Pur', logo: { src: 'assets/logos/vk-studio.png', width: 382, height: 400 }, quote: "On travaille avec Benjamin depuis un petit moment et ce qui est dingue, c'est qu'à partir de rien, il a pris l'initiative de créer toute une D.A en motion design pour notre chaîne YouTube, en plus d'assurer les captations des interviews comme un pro !" },
      { client: 'Corentin Boesch', service: 'Montage Horizontal', logo: { src: 'assets/logos/corentin-boesch.jpg', width: 400, height: 400 }, quote: "Pour la VSL de ma formation, j'ai sollicité Benjamin. J'ai rapidement été très impressionné par sa réactivité, son professionnalisme, sa compréhension de la vidéo et je ne peux que vous le recommander." },
      { client: 'Pôle Sportif', service: 'Montage Vertical', logo: { src: 'assets/logos/pole-sportif.png', width: 284, height: 187 }, quote: 'Des ads de qualité et efficaces !' }
    ]
  },

  cta: {
    title: ['Je transforme tes idées en ', 'vidéos qui marquent'],
    subtitle: 'Un projet en tête ? Discutons-en.',
    button: 'Réserver un appel',
    socials: ['instagram', 'youtube', 'linkedin', 'whatsapp']
  },

  footer: {
    rights: 'Tous droits réservés',
    legalLabel: 'Mentions légales',
    legalUrl: 'mentions-legales.html',
    tagline: 'Conçu & monté avec soin'
  },

  /* Petits textes de décor propres à chaque façade */
  copy: {
    classique: {},
    bureau: {
      brand: 'FILMMAKERBENJI',
      headline: ['Je monte.', "J'anime.", 'Je filme.'],
      messageTitle: 'Message de Benji',
      messageName: 'Benji',
      messageStatus: '(En ligne)',
      bio: "Monteur, motion designer et filmmaker en Île-de-France. Des Shorts qui retiennent, des ads qui convertissent, des films qui ont une patte.",
      showreelButton: 'Lancer le showreel',
      foldersButton: 'Ouvrir mes dossiers',
      playerTitle: 'showreel_2026.mp4',
      playerAlt: 'Extrait du showreel de Benjamin',
      ticker: ['MOTION DESIGN', 'SHORTS & REELS', 'ADS', 'CAPTATION', 'YOUTUBE', 'VSL'],
      statFiles: ['videos.txt', 'clients.txt', 'vues.txt'],
      foldersTitle: 'Mes dossiers',
      foldersIntro: "Clique sur un dossier pour l'ouvrir.",
      foldersPath: 'C:\\Benji\\Projets\\',
      folderLabels: { vertical: 'Montage vertical', filmmaking: 'Filmmaking', horizontal: 'Montage horizontal' },
      countLabel: 'élément(s)',
      loadingLabel: 'Ouverture du dossier…',
      backLabel: 'Retour',
      addressLabel: 'Adresse',
      videoFilePrefix: 'video_',
      setupTitle: 'Installation de ton projet…',
      setupIntro: 'Cinq étapes, zéro surprise. Tu sais toujours où on en est.',
      setupWindow: 'Assistant — ton_projet.setup',
      setupNext: 'Suivant →',
      reviewsTitle: "Ils m'ont écrit",
      reviewsWindow: 'Messagerie — Clients ({n} en ligne)',
      reviewSays: 'dit :',
      contactBrand: 'FILMMAKERBENJI',
      contactLabel: 'Ton email, je te réponds sous 24 h',
      contactPlaceholder: 'toi@exemple.fr',
      contactButton: 'Contacter',
      contactMailSubject: 'Projet vidéo — prise de contact',
      contactBookCall: 'Ou réserve directement un appel de 30 min →',
      startButton: 'Benji ▸'
    }
  }
};
