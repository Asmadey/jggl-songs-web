// Turns one hypothesis (src/experiments.cjs) + shared copy (src/content.cjs) into a static HTML page.
const C = require('./content.cjs');

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plain = s => String(s).replace(/<[^>]+>/g, '');
const jsonForScript = v => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, c => '\\u' + c.charCodeAt(0).toString(16));

// Every translatable string gets data-i="N"; the RU text for N lives in the page's JGGL.i18n.ru table.
function i18n(langs) {
  const ru = {};
  let n = 0;
  const reg = o => { const id = ++n; if (langs.includes('ru')) ru[id] = o.ru; return id; };
  return {
    ru,
    a: o => (langs.length > 1 ? ` data-i="${reg(o)}"` : ''),
    attr: (name, o) => (langs.length > 1 ? ` data-ia="${name}:${reg(o)}"` : '')
  };
}

const iconLinks = `<link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">`;

// Singing microphone for the hero sticker: voice waves pulse out and two notes float up (CSS keyframes in styles.css).
const singIcon = `<svg class="sing" viewBox="0 0 44 30" aria-hidden="true">
  <g class="mic"><rect x="5" y="4" width="9" height="15" rx="4.5"/><path class="hold" d="M2.500 14.500c0 4.200 3.100 7.500 7 7.500s7-3.300 7-7.500M9.500 22v4"/></g>
  <path class="wv w1" d="M19 10c2 2.500 2 7.500 0 10"/><path class="wv w2" d="M23 7.500c3.200 4 3.200 11 0 15"/><path class="wv w3" d="M27 5c4.400 5.500 4.400 14.500 0 20"/>
  <g class="note n1"><ellipse cx="33" cy="22" rx="2.600" ry="2"/><path d="M35.600 22V13l3.400 1.400"/></g>
  <g class="note n2"><ellipse cx="38" cy="26" rx="2.200" ry="1.700"/><path d="M40.200 26v-7.500l2.800 1.200"/></g>
</svg>`;
const spark = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/></svg>';

function wave(seed, bars = 28) {
  let h = '';
  for (let k = 0; k < bars; k++) {
    const v = 28 + 62 * Math.abs(Math.sin(seed * 1.7 + k * 0.62) * Math.cos(seed * 0.9 + k * 0.27));
    h += `<i style="height:${Math.round(v)}%"></i>`;
  }
  return `<span class="wave" aria-hidden="true">${h}</span>`;
}
const fmtCount = n => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n));
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.9l12-7.4a1 1 0 0 0 0-1.8l-12-7.4A1 1 0 0 0 7 4.6Z"/></svg>';
const heartIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.400 3 5 6.400 5c2 0 3.700 1.100 5.600 3.300C13.900 6.100 15.600 5 17.600 5 21 5 23.100 8.400 21.600 11.800 19.500 16.400 12 21 12 21Z"/></svg>';
const arrowIcon = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const seedOf = id => [...id].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 97;

// On a single-language page the {en, ru} pairs are reduced to {en} so no Russian text ships to the browser.
const keepLangs = (v, langs) => {
  if (Array.isArray(v)) return v.map(x => keepLangs(x, langs));
  if (v && typeof v === 'object') {
    if ('en' in v && 'ru' in v) return Object.fromEntries(langs.map(l => [l, v[l]]));
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, keepLangs(x, langs)]));
  }
  return v;
};

function renderExperiment(exp, cfg) {
  const langs = exp.languages || cfg.languages;
  const multi = langs.length > 1;
  const { a, attr, ru } = i18n(langs);
  const h = exp.hero;
  const byId = Object.fromEntries(C.songs.map(s => [s.id, s]));
  const root = '../';
  const hue = s => `style="--h:${s.hue}"`;

  const songCard = s => `
    <article class="song-card" data-id="${s.id}" data-tags="${s.tags.join(' ')}">
      <button type="button" class="song-open" data-song="${s.id}" aria-labelledby="t-${s.id}">
        <span class="song-cover" ${hue(s)}>${wave(seedOf(s.id))}<span class="flag"${a(C.common.example)}>${C.common.example.en}</span><span class="card-play" aria-hidden="true">▶</span></span>
      </button>
      <div class="song-info">
        <span class="song-genre"${a(s.genreLabel)}>${s.genreLabel.en}</span>
        <h3 id="t-${s.id}"${a(s.title)}>${esc(s.title.en)}</h3>
        <button type="button" class="use-button" data-make="${s.id}">${spark}<span${a(C.common.makeLikeThis)}>${C.common.makeLikeThis.en}</span></button>
      </div>
    </article>`;

  const heroCard = id => {
    const s = byId[id];
    return `<button type="button" class="hero-reel" data-song="${s.id}" aria-label="${esc(C.common.play.en)}: ${esc(s.title.en)}">
        <span class="reel-art" ${hue(s)}>${wave(seedOf(s.id), 22)}</span>
        <span class="hero-reel-play" aria-hidden="true">▶</span>
        <span class="hero-reel-label"><small${a(s.genreLabel)}>${s.genreLabel.en}</small><span${a(s.title)}>${esc(s.title.en)}</span></span>
      </button>`;
  };

  const tracksMode = exp.catalog === 'tracks';
  const genres = C.tracksData.genres;
  const allTracks = {};
  genres.forEach(g => g.tracks.forEach(t => { allTracks[t.id] = { ...t, genre: g.id, genreLabel: g.label }; }));
  // Same attribute strings are reused for every card, so each label is registered once.
  const playsAttr = attr('aria-label', C.ui.plays), likesAttr = attr('aria-label', C.ui.likes);
  const genreAttr = Object.fromEntries(genres.map(g => [g.id, a(g.label)]));
  const makeAttr = a(C.common.makeLikeThis);

  const stats = t => `<span class="stats"><span class="pill"${playsAttr}>${playIcon}${fmtCount(t.listens)}</span><span class="pill"${likesAttr}>${heartIcon}${fmtCount(t.likes)}</span></span>`;
  const trackCard = t => `
    <article class="song-card track-card" data-id="${t.id}">
      <button type="button" class="song-open" data-track="${t.id}" aria-labelledby="t-${t.id}">
        <span class="song-cover">
          <img src="${t.cover}" width="459" height="459" loading="lazy" decoding="async" alt="">
          <span class="flag"${genreAttr[t.genre]}>${esc(t.genreLabel.en)}</span>
          <span class="card-play" aria-hidden="true">▶</span>
          <span class="eqmini" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
          ${stats(t)}
        </span>
      </button>
      <div class="song-info">
        <h3 id="t-${t.id}">${esc(t.title)}</h3>
        <button type="button" class="use-button" data-make-track="${t.id}">${spark}<span${makeAttr}>${C.common.makeLikeThis.en}</span></button>
      </div>
    </article>`;
  const trackHero = ref => {
    const [g, i] = ref.split(':');
    const t = allTracks[genres.find(x => x.id === g).tracks[Number(i)].id];
    return `<button type="button" class="hero-reel" data-track="${t.id}" aria-label="${esc(C.common.play.en)}: ${esc(t.title)}">
        <img src="${t.cover}" width="459" height="459" alt="" decoding="async">
        <span class="hero-reel-play" aria-hidden="true">▶</span>
        <span class="hero-reel-label"><small${genreAttr[t.genre]}>${esc(t.genreLabel.en)}</small><span>${esc(t.title)}</span></span>
      </button>`;
  };
  const sliderHtml = `
      <div class="filters" role="group" aria-label="Genres"${attr('aria-label', C.ui.genresLabel)}>${genres.map(g => `<button type="button" class="filter" data-genre="${g.id}" aria-pressed="${g.id === exp.catalogDefault}"${genreAttr[g.id]}>${esc(g.label.en)}</button>`).join('')}</div>
      <p class="catalog-note"${a(C.ui.tracksNote)}>${C.ui.tracksNote.en}</p>
      <div class="slider" id="slider">
        <button type="button" class="slider-btn prev" aria-label="Previous tracks"${attr('aria-label', C.ui.scrollPrev)} disabled>${arrowIcon('m15 5-7 7 7 7')}</button>
        ${genres.map(g => `<div class="track-row" data-genre="${g.id}"${g.id === exp.catalogDefault ? '' : ' hidden'}>${g.tracks.map(t => trackCard(allTracks[t.id])).join('')}</div>`).join('')}
        <button type="button" class="slider-btn next" aria-label="Next tracks"${attr('aria-label', C.ui.scrollNext)}>${arrowIcon('m9 5 7 7-7 7')}</button>
      </div>`;
  const featureHtml = C.features.map(f => `<article class="feature-card"><img src="${f.img}" width="720" height="720" loading="lazy" decoding="async" alt=""><h3${a(f.title)}>${esc(f.title.en)}</h3><p${a(f.text)}>${esc(f.text.en)}</p></article>`).join('');

  const caption = h.hideCaption ? '' : `<div class="free-caption"><span${a(C.common.caption)}>${C.common.caption.en}</span><small${a(C.common.captionSub)}>${C.common.captionSub.en}</small></div>`;

  let heroAction;
  if (h.mode === 'verse') {
    heroAction = `
      <form class="verse-form" id="verse-form" novalidate>
        <label for="verse"${a(h.verseLabel)}>${h.verseLabel.en}</label>
        <textarea id="verse" rows="3" maxlength="1200" placeholder="${esc(h.versePlaceholder.en)}"${attr('placeholder', h.versePlaceholder)}></textarea>
        <div class="hero-action"><button class="button fire" type="submit" data-cta="hero"><span${a(h.cta)}>${h.cta.en}</span>${spark}</button>${caption}</div>
        <p class="verse-note" id="verse-note" role="status" hidden></p>
      </form>`;
  } else if (h.mode === 'chips') {
    heroAction = `
      <fieldset class="chip-pick" id="hero-pick">
        <legend${a(h.chipsLabel)}>${h.chipsLabel.en}</legend>
        <div class="pick-row">${h.options.map(o => `<button type="button" class="pick" data-pick="${o.id}" aria-pressed="false"${a(o.label)}>${o.label.en}</button>`).join('')}</div>
      </fieldset>
      <div class="hero-action"><a class="button fire" href="${cfg.appUrl}" data-cta="hero"><span${a(h.cta)}>${h.cta.en}</span>${spark}</a>${caption}</div>`;
  } else {
    heroAction = `<div class="hero-action"><a class="button fire" href="${cfg.appUrl}" data-cta="hero"><span${a(h.cta)}>${h.cta.en}</span>${spark}</a>${caption}</div>`;
  }

  const bottom = h.footnote || C.common.genresLine;
  const painCards = exp.pains.map(id => {
    const p = C.pains[id];
    return `<div class="pain-card"><p class="pain"${a(p.pain)}>${esc(p.pain.en)}</p><div class="answer"><small${a(C.ui.painAnswer)}>${C.ui.painAnswer.en}</small><p${a(p.answer)}>${esc(p.answer.en)}</p></div></div>`;
  }).join('');
  const steps = exp.steps || C.steps;
  const stepHtml = steps.map((s, k) => `<div class="how-step"><span class="step-number">0${k + 1}</span><h3${a(s.title)}>${esc(s.title.en)}</h3><p${a(s.text)}>${esc(s.text.en)}</p></div>`).join('');
  const benefitHtml = C.benefits.map(b => `<li${a(b)}>${esc(b.en)}</li>`).join('');
  const trustHtml = C.trust.map(t => `<div class="trust-item"><h3${a(t.title)}>${esc(t.title.en)}</h3><p${a(t.text)}>${esc(t.text.en)}</p></div>`).join('');
  const faqHtml = C.faq.map((f, k) => `<details data-faq="${k + 1}"><summary${a(f.q)}>${esc(f.q.en)}</summary><p${a(f.a)}>${esc(f.a.en)}</p></details>`).join('');
  const chipHtml = C.chips.map(c => `<button type="button" class="filter" data-filter="${c.id}" aria-pressed="${c.id === exp.catalogDefault}"${a(c.label)}>${c.label.en}</button>`).join('');

  const langSwitch = multi ? `<div class="lang" role="group" aria-label="Language"${attr('aria-label', C.common.langLabel)}>${langs.map(l => `<button type="button" data-lang="${l}" aria-pressed="${l === cfg.defaultLang}">${l.toUpperCase()}</button>`).join('')}</div>` : '';

  const clientConfig = {
    slug: exp.slug, appUrl: cfg.appUrl, langs, defaultLang: langs.includes(cfg.defaultLang) ? cfg.defaultLang : langs[0], posthog: cfg.posthog,
    catalogDefault: exp.catalogDefault,
    catalog: exp.catalog || 'placeholders',
    rotate: h.rotate || null,
    tracks: tracksMode ? allTracks : {},
    ui_tracks: { plays: C.ui.plays, likes: C.ui.likes },
    songs: C.songs.map(s => ({ id: s.id, genre: s.genre, hue: s.hue, instrumental: !!s.instrumental, title: s.title, genreLabel: s.genreLabel, lyric: s.lyric })),
    ui: {
      verseCopied: C.ui.verseCopied,
      play: C.common.play, pause: C.common.pause, examplePlaceholder: C.common.examplePlaceholder, placeholderNote: C.common.placeholderNote, instrumental: C.common.instrumental
    },
    i18n: null
  };

  const page = `<!doctype html>
<html lang="${cfg.defaultLang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#0c0c0b">
  <meta name="robots" content="noindex">
  <meta name="description" content="${esc(h.sub.en)}">
  <title>JGGL Songs · ${esc(plain(h.title.en))}</title>
  ${iconLinks}
  <link rel="preload" href="${root}assets/montserrat-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${root}styles.css">
  <script>window.JGGL=__CLIENT_CONFIG__;</script>
  <script src="${root}app.js" defer></script>
</head>
<body data-exp="${exp.slug}">
  <a class="skip" href="#songs"${a(C.common.skip)}>${C.common.skip.en}</a>
  <header class="topbar">
    <a class="brand" href="${cfg.brandUrl}" aria-label="JGGL"><img src="${root}assets/jggl-mark.svg" width="42" height="42" alt=""><span>JGGL</span><i></i><small>SONGS</small></a>
    <nav aria-label="Navigation">${C.nav.map(n => `<a href="${n.href}"${a(n.label)}>${n.label.en}</a>`).join('')}</nav>
    <div class="top-actions">${langSwitch}<a class="button outline header-cta" href="${cfg.appUrl}" data-cta="header"><span${a(C.common.ctaDefault)}>${C.common.ctaDefault.en}</span></a></div>
  </header>
  <main>
    <section class="hero wrap${tracksMode ? ' stage-mid' : ''}" aria-labelledby="hero-title">
      <div class="hero-copy">
        <div class="eyebrow"><span class="orange-line"></span><span${a(h.eyebrow)}>${h.eyebrow.en}</span></div>
        <h1 id="hero-title"${h.rotate ? ' class="rotating"' : ''}${a(h.title)}>${h.title.en}</h1>
        <p class="hero-sub"${a(h.sub)}>${esc(h.sub.en)}</p>
        ${heroAction}
        ${h.hideBottom ? '' : `<div class="hero-bottom"><span class="mini-play">▶</span><span${a(bottom)}>${bottom.en}</span></div>`}
      </div>
      <div class="hero-stage${tracksMode ? ' square' : ''}" aria-label="Example songs">
        ${tracksMode ? h.cards.map(trackHero).join('') : h.cards.map(heroCard).join('')}
        <div class="hero-sticker${h.stickerIcon === 'sing' ? ' sticker-sing' : ''}">${h.stickerIcon === 'sing' ? singIcon : '<b>●</b>'}<span${a(h.sticker)}>${esc(h.sticker.en)}</span></div>
      </div>
    </section>

    <section class="catalog wrap" id="songs" aria-labelledby="songs-title">
      <div class="eyebrow"><span${a(tracksMode ? C.ui.tracksEyebrow : C.ui.songsEyebrow)}>${(tracksMode ? C.ui.tracksEyebrow : C.ui.songsEyebrow).en}</span></div>
      <h2 id="songs-title"${a(C.ui.songsTitle)}>${C.ui.songsTitle.en}</h2>
      ${tracksMode ? sliderHtml : `<div class="filters" role="group" aria-label="Occasions">${chipHtml}</div>
      <p class="catalog-note"${a(C.ui.songsNote)}>${C.ui.songsNote.en}</p>
      <div class="song-grid" id="song-grid">${C.songs.map(songCard).join('')}</div>`}
    </section>

    ${exp.features ? `<section class="features wrap" id="why" aria-labelledby="feat-title">
      <div class="eyebrow"><span${a(C.ui.featuresEyebrow)}>${C.ui.featuresEyebrow.en}</span></div>
      <h2 id="feat-title"${a(C.ui.featuresTitle)}>${C.ui.featuresTitle.en}</h2>
      <div class="feature-grid">${featureHtml}</div>
    </section>` : `<section class="pains wrap" id="why" aria-labelledby="pain-title">
      <div class="eyebrow"><span${a(C.ui.painEyebrow)}>${C.ui.painEyebrow.en}</span></div>
      <h2 id="pain-title"${a(C.ui.painTitle)}>${C.ui.painTitle.en}</h2>
      <div class="pain-grid">${painCards}</div>
    </section>`}

    <section class="how wrap" id="how" aria-labelledby="how-title">
      <div><div class="eyebrow"><span${a(C.ui.howEyebrow)}>${C.ui.howEyebrow.en}</span></div><h2 id="how-title"${a(C.ui.howTitle)}>${C.ui.howTitle.en}</h2></div>
      ${stepHtml}
    </section>

    <section class="get wrap" aria-labelledby="get-title">
      <div class="eyebrow"><span${a(C.ui.getEyebrow)}>${C.ui.getEyebrow.en}</span></div>
      <h2 id="get-title"${a(C.ui.getTitle)}>${C.ui.getTitle.en}</h2>
      <ul class="benefits">${benefitHtml}</ul>
    </section>

    <section class="trust wrap" aria-labelledby="trust-title">
      <div class="eyebrow"><span${a(C.ui.trustEyebrow)}>${C.ui.trustEyebrow.en}</span></div>
      <h2 id="trust-title" class="sr-only"${a(C.ui.trustEyebrow)}>${C.ui.trustEyebrow.en}</h2>
      <div class="trust-grid">${trustHtml}</div>
    </section>

    <section class="faq wrap" aria-labelledby="faq-title">
      <div class="eyebrow"><span${a(C.ui.faqEyebrow)}>${C.ui.faqEyebrow.en}</span></div>
      <h2 id="faq-title"${a(C.ui.faqTitle)}>${C.ui.faqTitle.en}</h2>
      <div class="faq-list">${faqHtml}</div>
    </section>

    <section class="final wrap" aria-labelledby="final-title">
      <h2 id="final-title"${a(exp.finalTitle)}>${esc(exp.finalTitle.en)}</h2>
      <a class="button fire" href="${cfg.appUrl}" data-cta="final"><span${a(exp.finalCta)}>${exp.finalCta.en}</span>${spark}</a>
    </section>
  </main>
  <footer class="wrap footer"><a class="brand" href="${cfg.brandUrl}"><img src="${root}assets/jggl-mark.svg" width="32" height="32" alt=""><span>JGGL</span></a><span${a(C.common.footerLine)}>${C.common.footerLine.en}</span><small>© 2026 JGGL</small></footer>

  ${tracksMode ? `<dialog id="track-dialog" class="modal track-dialog" aria-labelledby="td-title">
    <button class="close" data-close type="button" aria-label="Close">×</button>
    <div class="td-cover"><img id="td-cover" width="459" height="459" alt="" decoding="async"></div>
    <div class="td-info">
      <span class="eyebrow" id="td-genre"></span>
      <h2 id="td-title"></h2>
      <canvas id="td-eq" class="td-eq" aria-hidden="true"></canvas>
      <div class="td-controls">
        <button type="button" class="sd-play" id="td-play" aria-label="Play"></button>
        <div class="td-seek">
          <input type="range" id="td-seek" min="0" max="1000" value="0" step="1" aria-label="Seek"${attr('aria-label', C.ui.seek)}>
          <div class="td-times"><span id="td-cur">0:00</span><span id="td-dur">0:00</span></div>
        </div>
      </div>
      <div id="td-stats"></div>
      <a class="button fire" id="td-make" href="${cfg.appUrl}" data-cta="song_make"><span${makeAttr}>${C.common.makeLikeThis.en}</span>${spark}</a>
    </div>
  </dialog>` : `<dialog id="song-dialog" class="modal song-dialog" aria-labelledby="sd-title">
    <button class="close" data-close type="button" aria-label="Close">×</button>
    <div class="sd-cover" id="sd-cover"></div>
    <div class="sd-info">
      <span class="eyebrow" id="sd-genre"></span>
      <h2 id="sd-title"></h2>
      <div class="sd-player"><button type="button" class="sd-play" id="sd-play" aria-label="Play"></button><span class="wave big" id="sd-wave" aria-hidden="true"></span></div>
      <p class="sd-flag" id="sd-flag"></p>
      <blockquote id="sd-lyric"></blockquote>
      <a class="button fire" id="sd-make" href="${cfg.appUrl}" data-cta="song_make"><span${a(C.common.makeLikeThis)}>${C.common.makeLikeThis.en}</span>${spark}</a>
    </div>
  </dialog>`}

</body>
</html>
`;
  // The i18n table is only complete once every data-i has been registered, so inject the config last.
  clientConfig.i18n = { ru };
  const shipped = multi ? clientConfig : keepLangs(clientConfig, langs);
  return page.replace('__CLIENT_CONFIG__', () => jsonForScript(shipped));
}

function renderHub(experiments, cfg) {
  const langs = cfg.languages;
  const multi = langs.length > 1;
  const { a, ru } = i18n(langs);
  const lbl = {
    eyebrow: C.L('INTERNAL · NOT FOR PUBLIC TRAFFIC', 'ВНУТРЕННЯЯ СТРАНИЦА · НЕ ДЛЯ ПУБЛИЧНОГО ТРАФИКА'),
    hypothesis: C.L('Hypothesis.', 'Гипотеза.'),
    audience: C.L('Audience.', 'Аудитория.'),
    metric: C.L('Metric.', 'Метрика.'),
    open: C.L('Open', 'Открыть'),
    trends: C.L('JGGL Trends: video trend catalog (separate page)', 'JGGL Trends: каталог видеотрендов (отдельная страница)')
  };
  const rows = experiments.map(e => `
    <article class="hub-card">
      <h2><a href="${e.slug}/index.html" data-page>${esc(e.slug)}</a></h2>
      <p class="hub-h"${a(e.hero.title)}>${esc(plain(e.hero.title.en))}</p>
      <p><b${a(lbl.hypothesis)}>${lbl.hypothesis.en}</b> <span${a(e.hypothesis)}>${esc(e.hypothesis.en)}</span></p>
      <p><b${a(lbl.audience)}>${lbl.audience.en}</b> <span${a(e.audience)}>${esc(e.audience.en)}</span></p>
      <p><b${a(lbl.metric)}>${lbl.metric.en}</b> <span${a(e.metric)}>${esc(e.metric.en)}</span></p>
      <p><a class="button outline" href="${e.slug}/index.html" data-page><span${a(lbl.open)}>${lbl.open.en}</span></a></p>
    </article>`).join('');
  const langSwitch = multi ? `<div class="lang" role="group" aria-label="Language">${langs.map(l => `<button type="button" data-lang="${l}" aria-pressed="${l === cfg.defaultLang}">${l.toUpperCase()}</button>`).join('')}</div>` : '';
  const head = `<div class="hub-top"><div class="eyebrow"><span class="orange-line"></span><span${a(lbl.eyebrow)}>${lbl.eyebrow.en}</span></div>${langSwitch}</div><h1${a(C.ui.hubTitle)}>${C.ui.hubTitle.en}</h1>`;
  const foot = `<p class="hub-foot"><a href="trends/"${a(lbl.trends)}>${lbl.trends.en}</a></p>`;
  const script = multi ? `<script>(() => {
  const RU = ${jsonForScript(ru)}, LANGS = ${jsonForScript(langs)}, DEF = ${jsonForScript(cfg.defaultLang)};
  const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  let lang = [new URLSearchParams(location.search).get('lang'), get('jggl_lang'), DEF].find(l => l && LANGS.includes(l));
  const els = [...document.querySelectorAll('[data-i]')].map(el => ({ el, en: el.innerHTML, id: el.dataset.i }));
  const apply = () => {
    document.documentElement.lang = lang;
    els.forEach(({ el, en, id }) => { el.innerHTML = lang === 'en' || RU[id] === undefined ? en : RU[id]; });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    // Carry the language to the landing pages even when storage is blocked.
    document.querySelectorAll('a[data-page]').forEach(a => { a.href = a.getAttribute('href').split('?')[0] + (lang === DEF ? '' : '?lang=' + lang); });
  };
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; set('jggl_lang', lang); apply(); }));
  apply();
})();</script>` : '';
  return `<!doctype html>
<html lang="${cfg.defaultLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>JGGL Songs · hypotheses</title>${iconLinks}<link rel="stylesheet" href="styles.css"></head>
<body class="hub"><main class="wrap">${head}${rows}${foot}</main>${script}</body></html>
`;
}

module.exports = { renderExperiment, renderHub };
