// Inline SVG illustrations for the animated "how it works" block. Styling and keyframes live in styles.css (.how-visual).

// Step 1: a lyrics page where lines write themselves in.
const write = `<svg class="art art-write" viewBox="0 0 240 160" aria-hidden="true">
  <rect class="paper" x="34" y="16" width="172" height="128" rx="14"/>
  <rect class="hd" x="52" y="34" width="72" height="9" rx="4.500"/>
  <rect class="ln l1" x="52" y="56" width="136" height="7" rx="3.500"/>
  <rect class="ln l2" x="52" y="74" width="116" height="7" rx="3.500"/>
  <rect class="ln l3" x="52" y="92" width="130" height="7" rx="3.500"/>
  <rect class="ln l4" x="52" y="110" width="84" height="7" rx="3.500"/>
  <rect class="caret" x="141" y="108" width="3" height="11" rx="1.500"/>
  <g class="pen"><path d="M190 122l4-9 17-17 8 8-17 17z"/><path class="tip" d="M190 122l4-9 5 5z"/></g>
  <g class="notes"><path class="nt n1" d="M214 34V22l8-2v10"/><circle class="nh n1" cx="211.500" cy="34" r="3"/><circle class="nh n1" cx="219.500" cy="30" r="3"/></g>
</svg>`;

// Step 2: record button with a progress ring, pulses and a live waveform.
const bars = (xs, hs) => xs.map((x, i) => `<rect class="b" style="--d:${(i * 0.13).toFixed(2)}s" x="${x}" y="${76 - hs[i] / 2}" width="6" height="${hs[i]}" rx="3"/>`).join('');
const record = `<svg class="art art-record" viewBox="0 0 240 160" aria-hidden="true">
  <g class="wavebars">${bars([18, 30, 42, 54, 66], [18, 34, 26, 44, 30])}${bars([168, 180, 192, 204, 216], [30, 44, 26, 34, 18])}</g>
  <circle class="pulse p1" cx="120" cy="76" r="28"/>
  <circle class="pulse p2" cx="120" cy="76" r="28"/>
  <circle class="ringbg" cx="120" cy="76" r="40"/>
  <circle class="ring" cx="120" cy="76" r="40" transform="rotate(-90 120 76)"/>
  <defs><linearGradient id="recg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8a42"/><stop offset="1" stop-color="#da3e14"/></linearGradient></defs>
  <circle class="rec" cx="120" cy="76" r="28" fill="url(#recg)"/>
  <rect class="mic" x="115" y="62" width="10" height="18" rx="5"/>
  <path class="mic-h" d="M109.500 76a10.500 10.500 0 0 0 21 0M120 87v6"/>
  <g class="recl" transform="translate(-10 0)"><circle class="dot" cx="98" cy="141" r="4"/><text x="108" y="145.500">REC 0:30</text></g>
</svg>`;

// Step 3: a finished track with a live equalizer, then it is sent to family.
const eq = [0, 8, 16, 24, 32].map((x, i) => `<rect class="eb" style="--d:${(i * 0.17).toFixed(2)}s" x="${x}" y="-26" width="5" height="26" rx="2.500"/>`).join('');
const share = `<svg class="art art-share" viewBox="0 0 240 160" aria-hidden="true">
  <defs><linearGradient id="covg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb06a"/><stop offset=".55" stop-color="#f4601f"/><stop offset="1" stop-color="#8e2a12"/></linearGradient></defs>
  <rect class="card" x="30" y="20" width="180" height="86" rx="14"/>
  <rect x="42" y="32" width="62" height="62" rx="10" fill="url(#covg)"/>
  <path class="cov-w" d="M52 66c4-12 7 12 11 0s7 12 11 0 7 12 11 0"/>
  <rect class="ln" x="114" y="36" width="78" height="7" rx="3.500"/>
  <g transform="translate(114 82)">${eq}</g>
  <circle class="play" cx="192" cy="78" r="10"/>
  <path class="play-t" d="M189.500 73.500l8 4.500-8 4.500z"/>
  <g class="chips">
    <circle class="chip" cx="84" cy="132" r="12"/><path class="ic" d="M84 137s-6-3.500-6-7.200a3.200 3.200 0 0 1 6-1.400 3.200 3.200 0 0 1 6 1.400c0 3.700-6 7.200-6 7.200z"/>
    <circle class="chip" cx="120" cy="132" r="12"/><path class="ic" d="M115 134l4-4m2-2l4-4m-9 4a3 3 0 0 1 0-4l1-1a3 3 0 0 1 4 0m1 6a3 3 0 0 1 0 4l-1 1a3 3 0 0 1-4 0"/>
    <circle class="chip hot" cx="156" cy="132" r="12"/><path class="ic plane" d="M150.500 133l11-5-3.500 11-2.500-4.500z"/>
  </g>
  <g class="fly"><path d="M150.500 133l11-5-3.500 11-2.500-4.500z"/></g>
  <g class="sent"><circle cx="176" cy="116" r="9"/><path d="M171.500 116l3.200 3.200 5.300-6"/></g>
</svg>`;

// Between the cards: only a glowing dot that travels from one card to the next (no line, no arrowhead).
const arrow = `<svg viewBox="0 0 48 20" aria-hidden="true"><circle class="travel" cx="4" cy="10" r="4.500"/></svg>`;

// Store button glyphs (Apple mark: Simple Icons, CC0; Play: a plain triangle).
const apple = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/></svg>`;
const play = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.800 2.600c-.5.300-.8.800-.8 1.500v15.800c0 .7.300 1.200.8 1.500l9.600-9.400z"/><path d="M16.300 14.200l-2.600-2.600 2.600-2.600 3.500 2c.9.500.9 1.700 0 2.200z" opacity=".85"/><path d="M14.400 11.600L4.800 21.400c.5.300 1.200.3 1.900-.1l9.600-5.500z" opacity=".7"/><path d="M14.400 11.600l1.900-3.300L6.700 2.700c-.7-.4-1.400-.4-1.900-.1z" opacity=".95"/></svg>`;

module.exports = { write, record, share, arrow, apple, play };
