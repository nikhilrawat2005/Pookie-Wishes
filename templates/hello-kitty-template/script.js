/*
 * ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
 *   Copyright (c) 2026 Cipher - Team Pookie Wishes
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 *   Proprietary and confidential.
 * ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
 */
/*
  © 2026 Pookie Wishes. All rights reserved.
  Unauthorized copying, reproduction, or deployment is strictly prohibited.
*/
/* ══════════════════════════════════════════════════════
   BIRTHDAY WEBSITE — SCRIPT.JS
   Sections:
     1. Globals
     2. Init
     3. Content loader (content.json)
     4. Page navigation
     5. Background floaters
     6. Envelope
     7. Cake canvas (responsive)
     8. Wish slideshow
     9. Letter music
    10. Memory card game  ★ Polished ★
    11. Flip cards + reveal panels
    12. Wishes progress
    13. Modals (generic open/close)
    14. Final letter + seal
    15. Restart
    16. Confetti
══════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────
   § 1  GLOBALS
────────────────────────────────────────────────────── */
let userData      = null;
let currentPage   = 1;
let cakeCtx = null, cakeDrawing = false, cakeCut = false, cakeStartX = 0, cakeStartY = 0;
let wishSlideTimer = null;
let bgMusic = null;
let flippedCards = new Set();

// --- Init ---
async function init() {
    try {
        if (window.getPookieData) {
            userData = await window.getPookieData('hello-kitty');
        }
        
        // Fallback for local dev
        if (!userData) {
            const res = await fetch('user.json');
            if (res.ok) userData = await res.json();
        }

        if (userData) applyContent(userData);

        // 🌿 Global Placeholder Fix (v3)
        if (window.bindPookiePlaceholders) {
            window.bindPookiePlaceholders(userData);
        }

        spawnBgElements();
        initCakeCanvas();
        updateWishesProgress();
        initMemoryGame();
        bgMusic = document.getElementById('bgMusic');

        // Optional: Hide loading splash if present
        const loader = document.getElementById('loading');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.remove(), 800);
        }
    } catch (e) {
        console.error("Initialization failed:", e);
    }
}

document.addEventListener('DOMContentLoaded', init);

function applyContent(c) {
  const name = c.name || 'Beautiful';

  // Page 1 — hero title
  const el = document.getElementById('mainTitle');
  if (el) el.innerHTML =
    `Happy Birthday,<br/>` +
    `<span class="name-highlight">${name}!</span>` +
    `<span class="title-cake">🎂</span>`;

  // Page 3 — used as the FINAL letter now (High Quality Envelope sequence leads here)
  setEl('letterGreeting', c.finalLetterGreeting || c.letterGreeting || 'My dearest birthday girl,');
  setEl('letterBody',     c.finalLetterBody     || c.letterBody     || 'Today marks another year of your incredible existence...');
  setEl('letterSign',     c.finalLetterPink     || c.letterSign     || 'Forever yours 💝');

  // Page 10 — sealed subtitle
  setEl('sealedSub', `Happy Birthday, ${name}! 🎂✨`);

  // Inject User Gallery into Wish Slideshow if available
  const slideshow = document.getElementById('wishSlideshow');
  if (slideshow && c.wishes && c.wishes.length > 0) {
      const userImgs = c.wishes.map(w => w.memory).filter(Boolean);
      if (userImgs.length > 0) {
          slideshow.innerHTML = userImgs.map((src, i) => 
              `<img class="wish-img ${i===0?'active':''}" src="${src}" alt="Memory" onerror="this.src='assets/hello_kitty_intro.png'"/>`
          ).join('');
      }
  }
}

function setEl(id, value) {
  if (!value) return;
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ──────────────────────────────────────────────────────
   § 4  PAGE NAVIGATION
────────────────────────────────────────────────────── */
function goToPage(num) {
  const cur  = document.getElementById('page' + currentPage);
  const next = document.getElementById('page' + num);
  if (cur)  cur.classList.remove('active');
  if (next) { next.classList.add('active'); currentPage = num; }

  // Page hooks
  if (num === 2) resetEnvelope();
  if (num === 5) startWishSlideshow(); else stopWishSlideshow();
  if (num === 10) {
    [300, 900, 1500, 2200].forEach(t => setTimeout(() => launchConfetti(55), t));
  }

  window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ──────────────────────────────────────────────────────
   § 5  BACKGROUND FLOATERS
────────────────────────────────────────────────────── */
function spawnBgElements() {
  const container = document.getElementById('bgElements');
  const emojis    = ['⭐','🌟','💕','💛','🌸','✨','🎀','💎','🦋','🌺','💫','🎊','🎈','🍭','💗','🩷'];

  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'bg-el';
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left              = Math.random() * 100 + 'vw';
    el.style.top               = Math.random() * 100 + 'vh';
    el.style.animationDuration = (5 + Math.random() * 9) + 's';
    el.style.animationDelay    = (Math.random() * 5) + 's';
    container.appendChild(el);
  }

  ['assets/bow.png', 'assets/hello-kitty-i-love-you.gif'].forEach((src, i) => {
    const img = document.createElement('img');
    img.className = 'bg-el-img';
    img.src = src;
    img.style.left              = (10 + Math.random() * 80) + 'vw';
    img.style.top               = (10 + Math.random() * 80) + 'vh';
    img.style.width             = (45 + Math.random() * 55) + 'px';
    img.style.animationDuration = (7 + Math.random() * 8) + 's';
    img.style.animationDelay    = (i * 2.5) + 's';
    container.appendChild(img);
  });
}

/* ──────────────────────────────────────────────────────
   § 6  ENVELOPE
────────────────────────────────────────────────────── */
function openEnvelope() {
  const env = document.getElementById('envelope');
  if (env.classList.contains('open')) return;
  env.classList.add('open');
  const hint = document.getElementById('envelopeHint');
  if (hint) { hint.textContent = 'Opening... 💌'; hint.style.opacity = '.5'; }
  launchConfetti(18);
  setTimeout(() => goToPage(3), 1300);
}

function resetEnvelope() {
  const env  = document.getElementById('envelope');
  const hint = document.getElementById('envelopeHint');
  if (env)  env.classList.remove('open');
  if (hint) { hint.textContent = 'Click to open 💌'; hint.style.opacity = '1'; }
}

/* ──────────────────────────────────────────────────────
   § 7  CAKE CANVAS  (responsive: scales with CSS)
────────────────────────────────────────────────────── */
function initCakeCanvas() {
  const canvas = document.getElementById('cakeCanvas');
  if (!canvas) return;
  cakeCtx = canvas.getContext('2d');

  canvas.addEventListener('mousedown',  e => { if (!cakeCut) startDraw(e); });
  canvas.addEventListener('mousemove',  e => { if (cakeDrawing && !cakeCut) moveDraw(e); });
  canvas.addEventListener('mouseup',    e => { if (cakeDrawing) endDraw(e); });
  canvas.addEventListener('mouseleave', e => { if (cakeDrawing) endDraw(e); });
  canvas.addEventListener('touchstart', e => { e.preventDefault(); if (!cakeCut) startDraw(e.touches[0]); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (cakeDrawing && !cakeCut) moveDraw(e.touches[0]); }, { passive: false });
  canvas.addEventListener('touchend',   e => { if (cakeDrawing) endDraw(e.changedTouches[0]); });
}

function canvasPos(e) {
  const r    = document.getElementById('cakeCanvas').getBoundingClientRect();
  const scaleX = 280 / r.width;   // canvas logical width / CSS displayed width
  const scaleY = 240 / r.height;
  return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
}

function startDraw(e) {
  const p = canvasPos(e);
  cakeDrawing = true; cakeStartX = p.x; cakeStartY = p.y;
  cakeCtx.clearRect(0, 0, 280, 240);
}

function moveDraw(e) {
  if (!cakeDrawing) return;
  const p = canvasPos(e);
  cakeCtx.clearRect(0, 0, 280, 240);
  cakeCtx.strokeStyle = '#e0457b';
  cakeCtx.lineWidth   = 4;
  cakeCtx.lineCap     = 'round';
  cakeCtx.setLineDash([8, 4]);
  cakeCtx.shadowColor = 'rgba(232,70,123,.5)';
  cakeCtx.shadowBlur  = 8;
  cakeCtx.beginPath();
  cakeCtx.moveTo(cakeStartX, cakeStartY);
  cakeCtx.lineTo(p.x, p.y);
  cakeCtx.stroke();
  cakeCtx.shadowBlur = 0;
}

function endDraw(e) {
  if (!cakeDrawing) return;
  cakeDrawing = false;
  const p  = canvasPos(e);
  const dx = p.x - cakeStartX, dy = p.y - cakeStartY;

  if (Math.sqrt(dx*dx + dy*dy) > 60) {
    // Good cut
    cakeCut = true;
    const msg     = document.getElementById('cakeCutMsg');
    const cakeImg = document.getElementById('cakeImg');
    if (msg)     msg.style.display = 'block';
    if (cakeImg) cakeImg.src = 'assets/candle_cake.png';
    launchConfetti(28);
    // Cake cutting now leads to Memory Game (Page 6)
    setTimeout(() => goToPage(6), 3000);
  } else {
    cakeCtx.clearRect(0, 0, 280, 240);
  }
}

/* ──────────────────────────────────────────────────────
   § 8  WISH SLIDESHOW
────────────────────────────────────────────────────── */
function startWishSlideshow() {
  stopWishSlideshow();
  let idx    = 0;
  const slides = document.querySelectorAll('#wishSlideshow .wish-img');
  if (!slides.length) return;
  wishSlideTimer = setInterval(() => {
    slides.forEach(s => s.classList.remove('active'));
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
    launchConfetti(4);
  }, 3000);
}
function stopWishSlideshow() {
  if (wishSlideTimer) { clearInterval(wishSlideTimer); wishSlideTimer = null; }
}

/* ──────────────────────────────────────────────────────
   § 9  LETTER MUSIC
────────────────────────────────────────────────────── */
function toggleLetterMusic() {
  const btn = document.getElementById('letterMusicBtn');
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
    if (btn) btn.style.background = '#ffe0ee';
  } else {
    bgMusic.pause();
    if (btn) btn.style.background = '#fff';
  }
}

/* ══════════════════════════════════════════════════════
   § 10  MEMORY CARD GAME  ★  POLISHED  ★
══════════════════════════════════════════════════════ */

/* 4 image pairs — all from existing assets */
const MEM_PAIRS = [
  { id: 'p1', src: 'assets/hello_kitty_spidy1.png' },
  { id: 'p2', src: 'assets/hello_kitty_spidy2.png' },
  { id: 'p3', src: 'assets/hello_kitty_spidy3.png' },
  { id: 'p4', src: 'assets/hello_kitty_spidy4.png' },
];
const MEM_BOMB = { id: 'bomb', src: 'assets/bomb_card.png', isBomb: true };

let memDeck       = [];   // array of card objects
let memFlipped    = [];   // up to 2 indices currently face-up
let memLocked     = false;
let memMatches    = 0;
let memFlipCount  = 0;
let memBombCount  = 0;

/* ── Build / reset the game ── */
function initMemoryGame() {
  memMatches = 0; memFlipCount = 0; memBombCount = 0;
  memFlipped = []; memLocked = false;

  // Hide win panel & bomb alert
  hide('memoryWin'); hide('memBombAlert');

  // Build deck: pair each image + one bomb = 9 cards
  const deck = [];
  MEM_PAIRS.forEach(p => { deck.push({ ...p }); deck.push({ ...p }); });
  deck.push({ ...MEM_BOMB });
  shuffle(deck);
  memDeck = deck;

  renderMemGrid();
  updateMemStats();
}

/* ── Render grid ── */
function renderMemGrid() {
  const grid = document.getElementById('memoryGrid');
  if (!grid) return;
  grid.innerHTML = '';

  memDeck.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'mem-card' + (card.isBomb ? ' is-bomb' : '');
    el.dataset.index = i;
    el.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-card-f">🎀</div>
        <div class="mem-card-b">
          <img src="${card.src}" alt="" loading="lazy"/>
        </div>
      </div>`;
    el.addEventListener('click', () => onCardClick(i));
    grid.appendChild(el);
    card.el = el;
  });
}

/* ── Card click handler ── */
function onCardClick(i) {
  if (memLocked) return;
  const card = memDeck[i];
  if (!card?.el) return;
  if (card.el.classList.contains('flipped') || card.el.classList.contains('matched')) return;

  // Flip it face-up
  card.el.classList.add('flipped');
  memFlipCount++;
  updateMemStats();

  if (card.isBomb) { triggerBomb(i); return; }

  memFlipped.push(i);
  if (memFlipped.length === 2) { memLocked = true; evalMatch(); }
}

/* ── Evaluate match ── */
function evalMatch() {
  const [a, b]  = memFlipped;
  const ca = memDeck[a], cb = memDeck[b];

  if (ca.id === cb.id) {
    // ✅ Match
    launchConfetti(22);
    setTimeout(() => {
      ca.el.classList.add('matched');
      cb.el.classList.add('matched');
      memMatches++;
      updateMemStats();
      memFlipped = []; memLocked = false;
      if (memMatches === MEM_PAIRS.length) setTimeout(showMemWin, 450);
    }, 380);
  } else {
    // ❌ No match
    setTimeout(() => {
      ca.el.classList.remove('flipped');
      cb.el.classList.remove('flipped');
      memFlipped = []; memLocked = false;
    }, 900);
  }
}

/* ── Bomb hit ── */
function triggerBomb(bombIdx) {
  memLocked = true;
  memBombCount++;
  updateMemStats();

  // Shake every card
  memDeck.forEach(c => {
    if (!c.el) return;
    c.el.classList.add('shake');
    setTimeout(() => c.el.classList.remove('shake'), 600);
  });

  // Flash bomb alert
  const alert = document.getElementById('memBombAlert');
  if (alert) {
    alert.style.display = 'block';
    setTimeout(() => { if (alert) alert.style.display = 'none'; }, 2200);
  }

  // Reset after delay: unflip bomb, unmark all matches, reshuffle
  setTimeout(() => {
    memDeck.forEach(c => {
      if (!c.el) return;
      c.el.classList.remove('flipped', 'matched');
    });
    memMatches = 0; memFlipped = []; memLocked = false;
    shuffle(memDeck);
    renderMemGrid();
    updateMemStats();
  }, 950);
}

/* ── Update stat display ── */
function updateMemStats() {
  setEl('matchCount', `${memMatches}/${MEM_PAIRS.length}`);
  setEl('flipCount',  `${memFlipCount}`);
  setEl('bombCount',  `${memBombCount}`);
}

/* ── Win ── */
function showMemWin() {
  const win = document.getElementById('memoryWin');
  if (win) {
    win.style.display = 'block';
    win.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  launchConfetti(55);
  setTimeout(() => launchConfetti(55), 700);
}

/* ── Quit game ── */
function confirmQuitGame() { showModal('quitModal'); }
function doQuitGame() {
  closeModal('quitModal');
  goToPage(7);
}

/* ── Shuffle (Fisher-Yates) ── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ──────────────────────────────────────────────────────
   § 11  FLIP CARDS + REVEAL PANELS  (Page 7)
────────────────────────────────────────────────────── */
function flipCard(idx) {
  const card  = document.getElementById('flipCard'  + idx);
  const panel = document.getElementById('reveal' + idx);
  if (!card || !panel) return;

  const isOpen = card.classList.contains('flipped');

  if (!isOpen) {
    // Open
    card.classList.add('flipped');
    injectReveal(idx, panel);
    // Double rAF ensures transition triggers after display change
    requestAnimationFrame(() => requestAnimationFrame(() => panel.classList.add('open')));

    if (!flippedCards.has(idx)) {
      flippedCards.add(idx);
      updateWishesProgress();
      launchConfetti(14);
    }
    if (flippedCards.size === 3) setTimeout(() => showModal('wishesModal'), 900);

  } else {
    // Close
    card.classList.remove('flipped');
    panel.classList.remove('open');
    panel.addEventListener('transitionend', () => {
      if (!panel.classList.contains('open')) panel.innerHTML = '';
    }, { once: true });
  }
}

function injectReveal(idx, panel) {
  const safeData = userData || {};
  const wish    = (safeData.wishes || [])[idx] || {};
  const msg     = wish.message || '💕 Happy Birthday! 💕';
  const sticker = wish.sticker || 'assets/hello-kitty-i-love-you.gif';
  const memSrc  = wish.memory  || `assets/memory${idx + 1}.jpg`;

  panel.innerHTML = `
    <div class="reveal-inner">
      <img class="reveal-mem-img" src="${memSrc}" alt="Memory"
           onerror="this.outerHTML='<div class=\\'reveal-mem-fallback\\'>🎀</div>'"
           loading="lazy"/>
      <p class="reveal-text">${msg}</p>
      <img class="reveal-sticker" src="${sticker}" alt=""/>
    </div>`;
}

/* ──────────────────────────────────────────────────────
   § 12  WISHES PROGRESS
────────────────────────────────────────────────────── */
function updateWishesProgress() {
  const n    = flippedCards.size;
  const fill = document.getElementById('wishesFill');
  const txt  = document.getElementById('wishesCount');
  const btn  = document.getElementById('continueWishesBtn');
  if (fill) fill.style.width  = (n / 3 * 100) + '%';
  if (txt)  txt.textContent   = `${n} of 3 wishes unlocked — keep going! 🎉`;
  if (btn)  btn.style.display = n === 3 ? 'block' : 'none';
}

/* ──────────────────────────────────────────────────────
   § 13  MODALS  (generic)
────────────────────────────────────────────────────── */
function showModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'flex';
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.style.display = 'none';
}

/* ──────────────────────────────────────────────────────
   § 14  FINAL LETTER + SEAL
────────────────────────────────────────────────────── */
function sealLetter() {
  const btn = document.getElementById('sealBtn');
  if (btn) { btn.textContent = 'Sealing... 💌'; btn.disabled = true; }
  launchConfetti(42);
  setTimeout(() => goToPage(10), 1000);
}

/* ──────────────────────────────────────────────────────
   § 15  RESTART EXPERIENCE
────────────────────────────────────────────────────── */
function restartExperience() {
  // States
  flippedCards.clear();
  cakeCut = false;

  // Cake
  if (cakeCtx) cakeCtx.clearRect(0, 0, 280, 240);
  const cakeMsg = document.getElementById('cakeCutMsg');
  const cakeImg = document.getElementById('cakeImg');
  if (cakeMsg) cakeMsg.style.display = 'none';
  if (cakeImg) cakeImg.src = 'assets/birthday_cake.png';

  // Flip cards + panels
  [0, 1, 2].forEach(i => {
    const c = document.getElementById('flipCard' + i);
    const p = document.getElementById('reveal' + i);
    if (c) c.classList.remove('flipped');
    if (p) { p.classList.remove('open'); p.innerHTML = ''; }
  });

  // Seal button
  const sealBtn = document.getElementById('sealBtn');
  if (sealBtn) { sealBtn.textContent = 'Seal The Letter 🔒'; sealBtn.disabled = false; }

  // Wishes
  updateWishesProgress();

  // Memory game
  initMemoryGame();

  // Reset Envelope (now at the end)
  resetEnvelope();
  
  goToPage(1);
}

/* ──────────────────────────────────────────────────────
   § 16  CONFETTI
────────────────────────────────────────────────────── */
function launchConfetti(count = 20) {
  const colors   = ['#e0457b','#f857a6','#ffd700','#56ab2f','#00bcd4','#ff9a56','#a78bfa','#34d399','#ffb3cf','#ff69b4'];
  const specials = ['🎀','⭐','💗','✨','🌸','🎊'];

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.top  = '-22px';

    if (Math.random() < .28) {
      el.textContent   = specials[Math.floor(Math.random() * specials.length)];
      el.style.fontSize   = '15px';
      el.style.background = 'transparent';
    } else {
      const sz = 6 + Math.random() * 12;
      el.style.width        = sz + 'px';
      el.style.height       = sz + 'px';
      el.style.background   = colors[Math.floor(Math.random() * colors.length)];
      el.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    }

    el.style.animationDuration = (1.6 + Math.random() * 2.6) + 's';
    el.style.animationDelay    = (Math.random() * .7) + 's';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4500);
  }
}

/* ── Utility ── */
function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
