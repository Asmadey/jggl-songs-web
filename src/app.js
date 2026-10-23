(() => {
  'use strict';
  const J = window.JGGL;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const songs = Object.fromEntries(J.songs.map(s => [s.id, s]));

  // ---------- language ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage may be blocked */ } }
  };
  const initialLang = () => {
    const q = new URLSearchParams(location.search).get('lang');
    const pick = [q, store.get('jggl_lang'), J.defaultLang].find(l => l && J.langs.includes(l));
    return pick || J.defaultLang;
  };
  let lang = initialLang();
  const tr = o => (lang === 'en' ? o.en : (o[lang] ?? o.en));

  // Cache the English markup once so switching back to EN is lossless.
  const textEls = $$('[data-i]').map(el => ({ el, en: el.innerHTML, id: el.dataset.i }));
  const attrEls = $$('[data-ia]').map(el => {
    const [name, id] = el.dataset.ia.split(':');
    return { el, name, id, en: el.getAttribute(name) };
  });
  let onLang = () => {};
  const applyLang = () => {
    document.documentElement.lang = lang;
    const ru = J.i18n.ru;
    textEls.forEach(({ el, en, id }) => { el.innerHTML = lang === 'en' || ru[id] === undefined ? en : ru[id]; });
    attrEls.forEach(({ el, name, id, en }) => el.setAttribute(name, lang === 'en' || ru[id] === undefined ? en : ru[id]));
    $$('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    if (songDialog && songDialog.open && current) fillSong(current);
    syncPlayUi();
    onLang();
  };

  // ---------- analytics ----------
  // One entry point for every event. PostHog loads only when POSTHOG_KEY was set at build time.
  if (J.posthog.key) {
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister identify reset get_distinct_id opt_out_capturing opt_in_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    window.posthog.init(J.posthog.key, { api_host: J.posthog.host, person_profiles: 'identified_only' });
  }
  const utm = () => {
    const out = {};
    new URLSearchParams(location.search).forEach((v, k) => { if (k.startsWith('utm_')) out[k] = v; });
    return out;
  };
  const events = [];
  const track = (name, props = {}, instant = false) => {
    const payload = { experiment: J.slug, lang, ...utm(), ...props };
    events.push({ name, ...payload });
    if (J.posthog.key) window.posthog.capture(name, payload, instant ? { send_instantly: true } : undefined);
    else console.debug('[track]', name, payload);
    window.dispatchEvent(new CustomEvent('jggl:songs-event', { detail: { name, ...payload } }));
  };
  window.JGGL_EVENTS = events;

  // ---------- link to the app ----------
  let heroPick = null;
  const appHref = (cta, term) => {
    const u = new URL(J.appUrl);
    const incoming = utm();
    Object.entries(incoming).forEach(([k, v]) => u.searchParams.set(k, v));
    const fill = (k, v) => { if (v && !incoming[k]) u.searchParams.set(k, v); };
    fill('utm_source', 'songs-lp');
    fill('utm_medium', 'landing');
    fill('utm_campaign', J.slug);
    fill('utm_content', cta);
    fill('utm_term', term);
    return u.toString();
  };
  const termFor = cta => (cta === 'hero' ? heroPick : null);
  const cleanUtm = () => $$('[data-cta]').forEach(a => { if (a.tagName === 'A') a.href = appHref(a.dataset.cta, termFor(a.dataset.cta)); });

  const ctaEvent = el => {
    const id = el.dataset.cta;
    if (id === 'song_make') return ['make_like_this_click', { song: current && current.id }];
    return [id + '_cta_click', id === 'hero' ? { pick: heroPick } : {}];
  };
  document.addEventListener('click', e => {
    const el = e.target.closest('a[data-cta]');
    if (!el) return;
    const [name, props] = ctaEvent(el);
    el.href = appHref(el.dataset.cta, el.dataset.cta === 'song_make' ? (current && current.genre) : termFor(el.dataset.cta));
    track(name, props, true);
  });

  // ---------- audio (placeholder synth until real recordings exist) ----------
  const prof = {
    country:  { wave: 'triangle', bpm: 104, prog: ['0M', '5M', '7M', '0M'] },
    gospel:   { wave: 'sine', bpm: 76, prog: ['0M', '5M', '0M', '7M'] },
    ballad:   { wave: 'sine', bpm: 66, prog: ['0M', '9m', '5M', '7M'] },
    folk:     { wave: 'triangle', bpm: 90, prog: ['0M', '7M', '5M', '0M'] },
    rock:     { wave: 'sawtooth', bpm: 132, prog: ['0M', '5M', '7M', '5M'], vol: 0.5 },
    acoustic: { wave: 'triangle', bpm: 82, prog: ['0M', '7M', '9m', '5M'] },
    piano:    { wave: 'sine', bpm: 60, prog: ['0M', '5M', '9m', '7M'] },
    strings:  { wave: 'sawtooth', bpm: 56, prog: ['9m', '5M', '0M', '7M'], vol: 0.5 }
  };
  let ctx = null, master = null, nodes = [], playing = null, raf = 0, t0 = 0, total = 0;
  const midi = n => 440 * Math.pow(2, (n - 69) / 12);
  const chordNotes = sym => {
    const root = 57 + parseInt(sym, 10);
    return sym.endsWith('m') ? [root, root + 3, root + 7] : [root, root + 4, root + 7];
  };
  const stopAudio = () => {
    cancelAnimationFrame(raf);
    nodes.forEach(n => { try { n.stop(); } catch { /* already stopped */ } });
    nodes = [];
    if (master) { try { master.disconnect(); } catch { /* ignore */ } master = null; }
    playing = null;
    paint(0, null);
    syncPlayUi();
  };
  const startAudio = id => {
    stopAudio();
    const p = prof[songs[id].genre] || prof.folk;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = ctx || new AC();
    if (ctx.state === 'suspended') ctx.resume();
    master = ctx.createGain();
    master.gain.value = 0.22 * (p.vol || 1);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900;
    master.connect(lp); lp.connect(ctx.destination);
    const beat = 60 / p.bpm;
    const start = ctx.currentTime + 0.05;
    const tone = (freq, at, dur, vol) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = p.wave; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(vol, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(master);
      o.start(at); o.stop(at + dur + 0.05);
      nodes.push(o);
    };
    p.prog.forEach((sym, k) => {
      const notes = chordNotes(sym);
      const at = start + k * 4 * beat;
      notes.forEach(n => tone(midi(n - 12), at, 4 * beat, 0.35));
      [0, 1, 2, 1, 0, 1, 2, 1].forEach((ix, j) => tone(midi(notes[ix] + 12), at + j * beat * 0.5, beat * 0.9, 0.5));
    });
    t0 = start; total = 16 * beat;
    playing = id;
    const tick = () => {
      const f = Math.min(1, (ctx.currentTime - t0) / total);
      paint(f, id);
      if (f >= 1) { stopAudio(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    syncPlayUi();
  };
  const paint = (frac, id) => {
    $$('.wave').forEach(w => {
      const owner = w.closest('[data-song],.song-card');
      const wid = w.id === 'sd-wave' ? (current && current.id) : owner && (owner.dataset.song || owner.dataset.id);
      const n = w.children.length;
      const on = id && wid === id ? Math.round(frac * n) : 0;
      [...w.children].forEach((b, k) => b.classList.toggle('on', k < on));
    });
  };

  // ---------- song dialog ----------
  const songDialog = $('#song-dialog');
  let current = null;
  const waveHtml = (seed, bars) => {
    let h = '';
    for (let k = 0; k < bars; k++) h += `<i style="height:${Math.round(28 + 62 * Math.abs(Math.sin(seed * 1.7 + k * 0.62) * Math.cos(seed * 0.9 + k * 0.27)))}%"></i>`;
    return h;
  };
  const seedOf = id => [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % 97;
  const fillSong = s => {
    $('#sd-cover').style.setProperty('--h', s.hue);
    $('#sd-genre').textContent = tr(s.genreLabel);
    $('#sd-title').textContent = tr(s.title);
    $('#sd-lyric').textContent = tr(s.lyric);
    $('#sd-lyric').classList.toggle('instr', s.instrumental);
    $('#sd-flag').textContent = tr(J.ui.examplePlaceholder) + '. ' + tr(J.ui.placeholderNote);
    $('#sd-wave').innerHTML = waveHtml(seedOf(s.id), 40);
    syncPlayUi();
  };
  const openSong = (id, source) => {
    current = songs[id];
    fillSong(current);
    songDialog.showModal();
    track('song_open', { song: id, genre: current.genre, source });
    play(id, 'modal');
  };
  const play = (id, source) => {
    track('sample_play', { song: id, genre: songs[id].genre, source });
    startAudio(id);
  };
  const syncPlayUi = () => {
    const btn = $('#sd-play');
    if (!btn) return;
    const isPlaying = current && playing === current.id;
    btn.textContent = isPlaying ? '❚❚' : '▶';
    btn.setAttribute('aria-label', tr(isPlaying ? J.ui.pause : J.ui.play));
    $$('.song-card').forEach(c => c.classList.toggle('playing', c.dataset.id === playing));
  };
  if (songDialog) {
    $('#sd-play').addEventListener('click', () => { if (playing === current.id) stopAudio(); else play(current.id, 'modal'); });
    songDialog.addEventListener('close', () => { stopAudio(); });
  }

  document.addEventListener('click', e => {
    const open = e.target.closest('[data-song]');
    if (open) { openSong(open.dataset.song, open.classList.contains('hero-reel') ? 'hero' : 'card'); return; }
    const make = e.target.closest('[data-make]');
    if (make) {
      const s = songs[make.dataset.make];
      track('make_like_this_click', { song: s.id, genre: s.genre, source: 'card' }, true);
      location.assign(appHref('card_' + s.id, s.genre));
    }
  });

  // ---------- generic dialogs ----------
  $$('dialog').forEach(d => {
    $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
    d.addEventListener('click', e => {
      if (e.target !== d) return;
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
  });

  // ---------- catalog filter ----------
  if (J.catalog !== 'tracks') {
  let filter = J.catalogDefault;
  const applyFilter = () => {
    $$('.filter').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    $$('.song-card').forEach(c => { c.hidden = filter !== 'all' && !c.dataset.tags.split(' ').includes(filter); });
  };
  $$('.filter').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; applyFilter(); track('filter_select', { filter }); }));
  applyFilter();
  }

  // ---------- hero ----------
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    heroPick = heroPick === b.dataset.pick ? null : b.dataset.pick;
    $$('[data-pick]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.pick === heroPick)));
    if (heroPick) track('style_select', { option: heroPick });
    cleanUtm();
  }));

  const form = $('#verse-form');
  if (form) {
    const box = $('#verse'), note = $('#verse-note');
    let pasted = false;
    box.addEventListener('paste', () => {
      if (pasted) return;
      pasted = true;
      setTimeout(() => track('lyrics_paste', { chars: box.value.trim().length }), 0);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = box.value.trim();
      // The verse stays on the device: it goes to the clipboard, never into the URL or analytics.
      track('hero_cta_click', { has_verse: text.length > 0, chars: text.length }, true);
      if (!text) { location.assign(appHref('hero', null)); return; }
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
      note.textContent = tr(J.ui.verseCopied);
      note.hidden = false;
      setTimeout(() => location.assign(appHref('hero', null)), 1100);
    });
  }

  // ---------- misc events ----------
  document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('details[data-faq]') && e.target.open) track('faq_open', { q: e.target.dataset.faq }); }, true);
  const seen = new Set();
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? scrollY / max * 100 : 0;
    [50, 90].forEach(t => { if (pct >= t && !seen.has(t)) { seen.add(t); track('scroll_' + t); } });
  };
  addEventListener('scroll', onScroll, { passive: true });
  $$('.lang button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    store.set('jggl_lang', lang);
    applyLang();
    track('lang_switch', { to: lang });
  }));

  // ---------- real tracks: player, equalizer, genre slider ----------
  if (J.catalog === 'tracks') {
    const T = J.tracks;
    const dlg = $('#track-dialog');
    const ui = { cover: $('#td-cover'), genre: $('#td-genre'), title: $('#td-title'), eq: $('#td-eq'), play: $('#td-play'), seek: $('#td-seek'), cur: $('#td-cur'), dur: $('#td-dur'), stats: $('#td-stats') };

    // Streamed through a media element only: no controls, no download entry, no context menu.
    // The file URL is still public on the CDN, so this keeps casual saving out of the UI rather than making it impossible.
    const audio = new Audio();
    audio.preload = 'none';
    audio.crossOrigin = 'anonymous'; // the CDN answers with access-control-allow-origin: *, required for the analyser
    audio.disableRemotePlayback = true;
    try { audio.controlsList.add('nodownload'); } catch { /* not supported */ }
    window.JGGL_AUDIO = audio; // for debugging in the console
    dlg.addEventListener('contextmenu', e => e.preventDefault());

    const fmtTime = s => { s = Math.max(0, Math.floor(s) || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
    const fmtCount = n => (n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n));
    let cur = null, ctx2 = null, analyser = null, freq = null, raf2 = 0, scrubbing = false;
    const duration = () => (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : (cur ? cur.durationMs / 1000 : 0));

    // ----- equalizer: live frequency bars from the track itself, doubling as the progress bar -----
    const BARS = 56;
    const level = new Float32Array(BARS);
    const seedBars = id => Array.from({ length: BARS }, (_, k) => 0.22 + 0.5 * Math.abs(Math.sin(seedOf(id) * 1.3 + k * 0.5) * Math.cos(seedOf(id) * 0.7 + k * 0.21)));
    const drawEq = idle => {
      const c = ui.eq, g = c.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, w, h);
      if (!idle && analyser) analyser.getByteFrequencyData(freq);
      const base = idle || !analyser ? seedBars(cur.id) : null;
      const gap = 3, bw = (w - gap * (BARS - 1)) / BARS;
      const frac = duration() ? audio.currentTime / duration() : 0;
      const t = performance.now() / 1000;
      for (let i = 0; i < BARS; i++) {
        let v;
        if (analyser && !idle) {
          const idx = 2 + Math.floor(Math.pow(i / BARS, 1.7) * 150);
          // Music energy sits in the bass, so tilt the spectrum up to keep the whole bar row alive.
          v = Math.min(1, Math.pow(freq[idx] / 255, 0.85) * (0.85 + 1.7 * i / BARS));
        } else if (!idle) {
          v = 0.25 + 0.4 * Math.abs(Math.sin(t * 3 + i * 0.7)); // analyser unavailable: keep it alive
        } else v = base[i];
        level[i] = idle ? v : level[i] * 0.55 + v * 0.45;
        const bh = Math.max(4, level[i] * h);
        const x = i * (bw + gap), y = (h - bh) / 2;
        const played = i / BARS <= frac;
        const grad = g.createLinearGradient(0, y, 0, y + bh);
        grad.addColorStop(0, played ? '#ff9a5c' : '#6b5246');
        grad.addColorStop(1, played ? '#da3e14' : '#3d3029');
        g.fillStyle = grad;
        g.beginPath();
        g.roundRect ? g.roundRect(x, y, bw, bh, Math.min(bw / 2, 3)) : g.rect(x, y, bw, bh);
        g.fill();
      }
    };
    const loop = () => { drawEq(false); raf2 = requestAnimationFrame(loop); };
    const startLoop = () => { cancelAnimationFrame(raf2); raf2 = requestAnimationFrame(loop); };
    const stopLoop = () => { cancelAnimationFrame(raf2); if (cur) drawEq(true); };

    const ensureGraph = () => {
      if (analyser || ctx2 === false) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx2 = new AC();
        const src = ctx2.createMediaElementSource(audio);
        analyser = ctx2.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.78;
        freq = new Uint8Array(analyser.frequencyBinCount);
        src.connect(analyser);
        analyser.connect(ctx2.destination);
      } catch { ctx2 = false; analyser = null; }
    };

    // ----- UI state -----
    const syncUi = () => {
      const on = !audio.paused && !audio.ended;
      ui.play.textContent = on ? '❚❚' : '▶';
      ui.play.setAttribute('aria-label', tr(on ? J.ui.pause : J.ui.play));
      $$('.track-card').forEach(c => c.classList.toggle('playing', on && cur && c.dataset.id === cur.id));
    };
    const syncTime = () => {
      ui.cur.textContent = fmtTime(audio.currentTime);
      ui.dur.textContent = fmtTime(duration());
      if (!scrubbing) ui.seek.value = duration() ? Math.round(audio.currentTime / duration() * 1000) : 0;
    };
    const statsHtml = t => `<span class="stats"><span class="pill">${playSvg}${fmtCount(t.listens)}</span><span class="pill">${heartSvg}${fmtCount(t.likes)}</span></span>`;
    const playSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.6v14.8a1 1 0 0 0 1.5.9l12-7.4a1 1 0 0 0 0-1.8l-12-7.4A1 1 0 0 0 7 4.6Z"/></svg>';
    const heartSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.4 5c2 0 3.7 1.1 5.6 3.3C13.9 6.1 15.6 5 17.6 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21Z"/></svg>';
    const fillTrack = () => {
      ui.cover.src = cur.cover;
      ui.genre.textContent = tr(cur.genreLabel);
      ui.title.textContent = cur.title;
      ui.stats.innerHTML = statsHtml(cur);
      syncTime();
      syncUi();
    };
    onLang = (prev => () => { prev(); if (cur && dlg.open) { ui.genre.textContent = tr(cur.genreLabel); syncUi(); } })(onLang);

    const playCurrent = source => {
      ensureGraph();
      if (ctx2 && ctx2.state === 'suspended') ctx2.resume();
      track('sample_play', { song: cur.id, genre: cur.genre, source });
      audio.play().catch(() => syncUi());
    };
    const openTrack = (id, source) => {
      cur = T[id];
      current = { id: cur.id, genre: cur.genre };
      audio.pause();
      audio.src = cur.audio;
      audio.currentTime = 0;
      level.fill(0);
      fillTrack();
      dlg.showModal();
      drawEq(true);
      track('song_open', { song: id, genre: cur.genre, source });
      playCurrent('modal');
    };

    audio.addEventListener('play', () => { syncUi(); startLoop(); });
    audio.addEventListener('pause', () => { syncUi(); stopLoop(); });
    audio.addEventListener('ended', () => { audio.currentTime = 0; syncUi(); syncTime(); stopLoop(); });
    audio.addEventListener('timeupdate', syncTime);
    audio.addEventListener('loadedmetadata', syncTime);
    audio.addEventListener('error', () => { syncUi(); });
    ui.play.addEventListener('click', () => { if (audio.paused) playCurrent('modal'); else audio.pause(); });
    ui.seek.addEventListener('input', () => { scrubbing = true; audio.currentTime = ui.seek.value / 1000 * duration(); syncTime(); if (audio.paused) drawEq(true); });
    ui.seek.addEventListener('change', () => { scrubbing = false; });
    dlg.addEventListener('close', () => { audio.pause(); syncUi(); });
    addEventListener('resize', () => { if (dlg.open && audio.paused) drawEq(true); });

    document.addEventListener('click', e => {
      const open = e.target.closest('[data-track]');
      if (open) { openTrack(open.dataset.track, open.classList.contains('hero-reel') ? 'hero' : 'card'); return; }
      const make = e.target.closest('[data-make-track]');
      if (make) {
        const t = T[make.dataset.makeTrack];
        track('make_like_this_click', { song: t.id, genre: t.genre, source: 'card' }, true);
        location.assign(appHref('card_' + t.id, t.genre));
      }
    });

    // ----- genre tabs and the one-row slider -----
    const slider = $('#slider'), prevBtn = $('.slider-btn.prev'), nextBtn = $('.slider-btn.next');
    const rows = $$('.track-row', slider);
    const activeRow = () => rows.find(r => !r.hidden);
    const updateArrows = () => {
      const r = activeRow();
      if (!r) return;
      const max = r.scrollWidth - r.clientWidth;
      prevBtn.disabled = r.scrollLeft <= 6;
      nextBtn.disabled = r.scrollLeft >= max - 2;
      slider.classList.toggle('can-left', !prevBtn.disabled);
      slider.classList.toggle('can-right', !nextBtn.disabled);
    };
    rows.forEach(r => r.addEventListener('scroll', () => requestAnimationFrame(updateArrows), { passive: true }));
    const nudge = dir => {
      const r = activeRow();
      r.scrollBy({ left: dir * Math.max(240, r.clientWidth * 0.8), behavior: 'smooth' });
      track('slider_scroll', { dir: dir > 0 ? 'next' : 'prev', genre: r.dataset.genre });
    };
    prevBtn.addEventListener('click', () => nudge(-1));
    nextBtn.addEventListener('click', () => nudge(1));
    addEventListener('resize', updateArrows);

    // Mouse drag to scroll (touch and trackpads already scroll natively). A real drag must not count as a card click.
    let drag = null, moved = false;
    rows.forEach(r => r.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { r, x: e.clientX, left: r.scrollLeft };
      moved = false;
    }));
    addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 6) { moved = true; drag.r.classList.add('dragging'); }
      if (moved) drag.r.scrollLeft = drag.left - dx;
    });
    addEventListener('pointerup', () => { if (drag) { drag.r.classList.remove('dragging'); drag = null; } });
    document.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);

    $$('.filter[data-genre]').forEach(b => b.addEventListener('click', () => {
      $$('.filter[data-genre]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      rows.forEach(r => { r.hidden = r.dataset.genre !== b.dataset.genre; });
      const r = activeRow();
      r.scrollLeft = 0;
      updateArrows();
      track('filter_select', { genre: b.dataset.genre });
    }));
    updateArrows();
  }

  // ---------- typed headline (deletes and retypes the highlighted words, like suno.com) ----------
  if (J.rotate) {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let token = 0;
    const run = async () => {
      const my = ++token;
      const h1 = $('#hero-title');
      const span = h1 && h1.querySelector('span');
      if (!span) return;
      const phrases = J.rotate.map(tr);
      h1.setAttribute('aria-label', h1.textContent);
      span.setAttribute('aria-hidden', 'true');
      if (reduced) return;
      const caret = document.createElement('i');
      caret.className = 'caret';
      caret.setAttribute('aria-hidden', 'true');
      h1.append(caret);
      let i = 0;
      span.textContent = phrases[0];
      while (my === token) {
        await sleep(3300);
        if (my !== token) return;
        const next = phrases[(i = (i + 1) % phrases.length)];
        let keep = 0;
        while (keep < next.length && keep < span.textContent.length && next[keep] === span.textContent[keep]) keep++;
        caret.classList.add('typing');
        while (span.textContent.length > keep && my === token) { span.textContent = span.textContent.slice(0, -1); await sleep(36); }
        await sleep(260);
        for (let k = keep; k < next.length && my === token; k++) { span.textContent = next.slice(0, k + 1); await sleep(58); }
        caret.classList.remove('typing');
      }
    };
    onLang = (prev => () => { prev(); run(); })(onLang);
  }

  applyLang();
  cleanUtm();
  if (J.posthog.key) window.posthog.register({ experiment: J.slug });
  track('landing_view');
})();
