// Inline SVG bits: the dot that travels between the "how it works" cards, and the store button glyphs.

// Between the cards: only a glowing dot that travels from one card to the next (no line, no arrowhead).
const arrow = `<svg viewBox="0 0 48 20" aria-hidden="true"><circle class="travel" cx="4" cy="10" r="4.500"/></svg>`;

// Store button glyphs (Apple mark: Simple Icons, CC0; Play: a plain triangle).
const apple = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/></svg>`;
const play = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.800 2.600c-.5.300-.8.800-.8 1.500v15.800c0 .7.300 1.200.8 1.500l9.600-9.400z"/><path d="M16.300 14.200l-2.600-2.600 2.600-2.600 3.500 2c.9.500.9 1.700 0 2.200z" opacity=".85"/><path d="M14.400 11.600L4.800 21.400c.5.300 1.200.3 1.900-.1l9.600-5.500z" opacity=".7"/><path d="M14.400 11.600l1.900-3.300L6.700 2.700c-.7-.4-1.400-.4-1.900-.1z" opacity=".95"/></svg>`;

module.exports = { arrow, apple, play };
