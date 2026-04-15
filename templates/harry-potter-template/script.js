/*
 * ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
 *   Copyright (c) 2026 Cipher - Team Pookie Wishes
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 *   Proprietary and confidential.
 * ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
 */
/* ══════════════════════════════════════════════════════
   HARRY POTTER MAGICAL BIRTHDAY — app.js
   ══════════════════════════════════════════════════════ */

/* ═══════════════════════════════
   DEFAULT CONFIG (overridden by config.json)
═══════════════════════════════ */
let C = {
  name: "Friend",
  intro: { badge: "✦ A Magical Birthday Experience ✦" },
  wishCards: [
    { icon: "🧙‍♂️", from: "From Albus Dumbledore",   text: "Happiness can be found even in the darkest of times — but today is made entirely of light. Celebrate yourself. You have earned every joy this day brings." },
    { icon: "⚡",   from: "From Harry Potter",        text: "You've got that rare kind of magic that makes everyone feel seen. You don't just walk into a room — you light it up. Happy Birthday! 🪄" },
    { icon: "📚",   from: "From Hermione Granger",    text: "In every timeline, there's one person who makes the journey worth it. In this one? That person is you. Never stop being exactly who you are. ✨" },
    { icon: "🌙",   from: "From Luna Lovegood",       text: "The rarest person is one with both kindness and courage. You have both in abundance. May today fill your heart as much as you fill others'." },
    { icon: "🦁",   from: "From Minerva McGonagall",  text: "True character — your kind — is rare. You make everyone around you proud. Celebrate grandly today, you have more than earned it." },
    { icon: "💫",   from: "From the Wizarding World", text: "Across every enchanted realm — every version of today is celebrating you. Some things are certain across all magic: you are deeply, completely loved. ❤️" }
  ],
  storyPanels: [
    { bang: "ORIGIN!",    img: "images/harry_broom.png", caption: "And so it began — the day you arrived and the world quietly became a more magical place." },
    { bang: "BRILLIANT!", img: "images/hermione.png",    caption: "With curiosity like Hermione and courage like Harry — your brilliance grew with every year." },
    { bang: "POWERFUL!",  img: "images/hippogriff.png",  caption: "Powerful, graceful, untamed — like a Hippogriff soaring at dawn. That's you." },
    { bang: "LEGENDARY!", img: "images/fawkes.png",      caption: "The greatest superpower? The way you make every person feel seen and loved. That's rare." },
    { bang: "TODAY!",     img: "images/niffler.png",     caption: "The most magical chapter yet — the Birthday. The grand celebration of YOU! 🎉" },
    { bang: "FOREVER!",   img: "images/snitch.png",      caption: "The best adventures are still ahead. The story never ends, and the magic only grows. 🪄" }
  ],
  flipCards: [
    { frontSymbol: "🔮", caption: "The Day We Met ✨",      photo: "images/hedwig.png" },
    { frontSymbol: "⚡",  caption: "Our Best Adventure 🌟", photo: "images/snitch.png" },
    { frontSymbol: "🦉", caption: "Always & Forever 💛",   photo: "images/fawkes.png" }
  ],
  scratchWish: "May this year bring you\nadventures that thrill you,\nlove that holds you,\nlaughter that heals you,\nand every dream you've dared to dream.\n\nYou deserve every bit of it.\nHappy Birthday, you magical soul. ❤️✨",
  letter: {
    title:     "Happy Birthday!",
    body:      "Wishing you a magical birthday filled with wonder and joy! ✨",
    signature: "— With all the magic in the world 🪄"
  }
};

/* ═══════════════════════════════
   LOAD CONFIG — DYNAMIC OR LOCAL
═══════════════════════════════ */
async function init() {
  try {
    if (window.getPookieData) {
      userData = await window.getPookieData('harry-potter');
      if (userData) {
        applyDataToConfig(userData);
        boot();
        return;
      }
    }

    // Fallback: Local config
    const res = await fetch('./user_content/config.json');
    if (res.ok) {
      const d = await res.json();
      applyDataToConfig(d);
    }
  } catch (e) {
    console.warn("Config load failed, using defaults.");
  } finally {
    boot();
  }
}

function applyDataToConfig(d) {
  if (d.name) C.name = d.name;
  if (d.house) C.house = d.house;
  if (d.intro) C.intro = { ...C.intro, ...d.intro };
  if (d.wishCards) C.wishCards = d.wishCards;
  if (d.storyPanels) {
    d.storyPanels.forEach((p, i) => {
      if (C.storyPanels[i]) {
        C.storyPanels[i].caption = p.caption;
        C.storyPanels[i].bang = p.bang;
        if (p.img) C.storyPanels[i].img = p.img;
      }
    });
  }
  if (d.flipCards) C.flipCards = d.flipCards;
  if (d.scratchWish) C.scratchWish = d.scratchWish;
  if (d.letter) C.letter = { ...C.letter, ...d.letter };
}

document.addEventListener('DOMContentLoaded', init);

/* ═══════════════════════════════
   BOOT — apply name & build sections
═══════════════════════════════ */
function boot() {
  const N = C.name;
  document.title = `Happy Birthday ${N} ✨`;

  // Loading screen name
  document.getElementById('lname').textContent = `Happy Birthday, ${N}!`;

  // Intro
  document.getElementById('iName').textContent = N;
  const ey = document.getElementById('iEy');
  if (ey) ey.textContent = C.intro.badge || '✦ A Magical Birthday Experience ✦';

  // Apply House Theme
  if (C.house) {
    document.body.classList.add(`house-${C.house.toLowerCase()}`);
    const tag = document.querySelector('.sec#s1 .it3');
    if (tag) tag.textContent = `The Sorting Hat has spoken: You belong in ${C.house}! ⚡`;
  }

  // All name placeholders
  document.querySelectorAll('.n2,.n4,.n5,.n7,.n7a,.n8,.n8p').forEach(e => e.textContent = N);

  // Dynamic titles
  const s3t = document.getElementById('s3ttl');
  if (s3t) s3t.textContent = `${N}'s Magical Story 📖`;

  // Build all sections
  buildWishCards();
  buildStory();
  buildFlipCards();

  // 🌿 Global Placeholder Fix (v3)
  if (window.bindPookiePlaceholders) {
    window.bindPookiePlaceholders({ 
      name: N, 
      sender: C.letter.signature, 
      message: C.letter.body 
    });
  }

  // Scratch wish text
  const sw = document.getElementById('scWish');
  if (sw) {
    const lines = (C.scratchWish || '').replace(/NAME/g, N).split('\n');
    sw.innerHTML = `⚡ ${N} ⚡<br><br>` + lines.map(l => l || '<br>').join('<br>');
  }
}

/* ═══════════════════════════════
   BUILD: WISH CARDS
═══════════════════════════════ */
// Character images to put in card corners
const CARD_CHARS = [
  'images/hagrid.png',
  'images/harry_broom.png',
  'images/hermione.png',
  null,
  null,
  'images/ron.png'
];

function buildWishCards() {
  const grid = document.getElementById('wishGrid');
  if (!grid) return;
  grid.innerHTML = '';

  C.wishCards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'wcard';
    const charImg = CARD_CHARS[i]
      ? `<div class="wcard-char"><img src="${CARD_CHARS[i]}" alt=""/></div>`
      : '';
    el.innerHTML = `
      <span class="wico">${card.icon}</span>
      <div class="wfrom">${card.from}</div>
      <div class="wtxt">${card.text.replace(/NAME/g, C.name)}</div>
      ${charImg}`;
    grid.appendChild(el);
  });

  // Stagger animate on scroll into view
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        grid.querySelectorAll('.wcard').forEach((c, i) =>
          setTimeout(() => c.classList.add('vis'), i * 140));
        obs.disconnect();
      }
    });
  }, { threshold: .1 });
  obs.observe(grid);
}

/* ═══════════════════════════════
   BUILD: STORY PANELS
═══════════════════════════════ */
function buildStory() {
  const strip = document.getElementById('ststrip');
  if (!strip) return;
  strip.innerHTML = '';
  const nums = ['I', 'II', 'III', 'IV', 'V', '∞'];

  C.storyPanels.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'panel';
    const isLast = i === C.storyPanels.length - 1;
    if (isLast) {
      div.style.cssText = 'border-color:var(--gold);background:linear-gradient(160deg,#1a0a3a,#050a22);';
    }
    div.innerHTML = `
      <div class="pnum">${nums[i] || (i + 1)}</div>
      <div class="pbang">${p.bang}</div>
      <div class="pimg">
        <img src="${p.img || ''}" alt="${p.bang}" loading="lazy"/>
      </div>
      <div class="pcap" style="${isLast ? 'color:var(--gl);' : ''}">${p.caption.replace(/NAME/g, C.name)}</div>`;
    strip.appendChild(div);
  });
}

/* ═══════════════════════════════
   BUILD: FLIP CARDS
═══════════════════════════════ */
function buildFlipCards() {
  const grid = document.getElementById('fcgrid');
  if (!grid) return;
  grid.innerHTML = '';

  C.flipCards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'fcard';
    el.innerHTML = `
      <div class="fci">
        <div class="fcf">
          <div class="fpat"></div>
          <div class="fsym">${card.frontSymbol || '🔮'}</div>
          <div class="flbl">Tap to Reveal</div>
          <div class="ftap">✦ ${card.caption} ✦</div>
        </div>
        <div class="fcb">
          <div class="fphoto" id="fp${i}"><span>${card.frontSymbol || '✨'}</span></div>
          <div class="fcap2">${card.caption}</div>
        </div>
      </div>`;

    el.addEventListener('click', () => {
      el.classList.toggle('flipped');
      if (el.classList.contains('flipped')) {
        const rect = el.getBoundingClientRect();
        spark(rect.left + rect.width / 2, rect.top + rect.height / 2);
        if (card.photo) {
          const img = new Image();
          img.onload = () => {
            const ph = document.getElementById(`fp${i}`);
            ph.innerHTML = '';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:12px;';
            ph.appendChild(img);
          };
          img.src = card.photo;
        }
      }
    });
    grid.appendChild(el);
  });
}

/* ═══════════════════════════════
   CURSOR
═══════════════════════════════ */
const $cur = document.getElementById('cur');
const $cur2 = document.getElementById('cur2');
let mx = 0, my = 0, tx = 0, ty = 0, wdtick = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  $cur.style.transform = `translate(${mx - 11}px,${my - 11}px)`;
  spawnWandDot(mx, my);
});

(function cursorLoop() {
  tx += (mx - tx) * .14;
  ty += (my - ty) * .14;
  $cur2.style.transform = `translate(${tx - 3.5}px,${ty - 3.5}px)`;
  requestAnimationFrame(cursorLoop);
})();

function spawnWandDot(x, y) {
  wdtick++;
  if (wdtick % 4 !== 0) return;
  const d = document.createElement('div');
  d.className = 'wdot';
  const s = 3 + Math.random() * 4;
  const colors = ['#f4c842','#fff','#b8922a','#ffe57a','#7b3fa0'];
  const c = colors[Math.floor(Math.random() * colors.length)];
  d.style.cssText = `left:${x - s/2}px;top:${y - s/2}px;width:${s}px;height:${s}px;background:${c};animation-duration:${.55+Math.random()*.4}s;`;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 900);
}

/* ═══════════════════════════════
   ANIMATED STAR BACKGROUND
═══════════════════════════════ */
const bgCanvas = document.getElementById('bgC');
const bgCtx = bgCanvas.getContext('2d');
let stars = [];

function makeStars() {
  bgCanvas.width  = innerWidth;
  bgCanvas.height = innerHeight;
  stars = Array.from({ length: 240 }, () => ({
    x:  Math.random() * bgCanvas.width,
    y:  Math.random() * bgCanvas.height,
    r:  .3 + Math.random() * 1.7,
    a:  Math.random(),
    sp: .003 + Math.random() * .006,
    ph: Math.random() * Math.PI * 2
  }));
}
makeStars();
addEventListener('resize', makeStars);

(function drawStars(t = 0) {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  // Subtle nebula glow
  const ng = bgCtx.createRadialGradient(bgCanvas.width*.5, bgCanvas.height*.3, 0, bgCanvas.width*.5, bgCanvas.height*.3, bgCanvas.width*.55);
  ng.addColorStop(0, 'rgba(74,26,122,0.04)');
  ng.addColorStop(1, 'transparent');
  bgCtx.fillStyle = ng;
  bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  // Stars
  stars.forEach(s => {
    s.a = .12 + .88 * Math.abs(Math.sin(t * s.sp + s.ph));
    bgCtx.beginPath();
    bgCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    bgCtx.fillStyle = `rgba(220,230,255,${s.a})`;
    bgCtx.fill();
  });
  requestAnimationFrame(drawStars);
})();

/* ═══════════════════════════════
   FLOATING MAGIC PARTICLES
═══════════════════════════════ */
const ptContainer = document.getElementById('parts');
function makeParticle() {
  const p = document.createElement('div');
  p.className = 'pt';
  const s = 2 + Math.random() * 4;
  const colors = ['#f4c842','#ffe57a','#fff','#b8922a','#7b3fa0'];
  const c = colors[Math.floor(Math.random() * colors.length)];
  p.style.cssText = `left:${Math.random()*100}%;width:${s}px;height:${s}px;background:${c};animation-duration:${8+Math.random()*14}s;animation-delay:${Math.random()*4}s;`;
  ptContainer.appendChild(p);
  setTimeout(() => p.remove(), 22000);
}
setInterval(makeParticle, 700);
for (let i = 0; i < 20; i++) makeParticle();

/* ═══════════════════════════════
   LOADING SCREEN
═══════════════════════════════ */
addEventListener('load', () => {
  setTimeout(() => {
    const l = document.getElementById('load');
    l.style.opacity = '0';
    setTimeout(() => {
      l.style.display = 'none';
      document.getElementById('nav').classList.add('show');
    }, 1200);
  }, 3300);
});

/* ═══════════════════════════════
   SECTION NAVIGATION
═══════════════════════════════ */
let curSec = 1;

function go(n) {
  const prev = document.getElementById(`s${curSec}`);
  const next = document.getElementById(`s${n}`);
  if (!next || n === curSec) return;
  prev.classList.remove('on');
  next.classList.add('on', 'enter');
  next.addEventListener('animationend', () => next.classList.remove('enter'), { once: true });
  curSec = n;
  updateNav();
  scrollTo(0, 0);
  if (n === 7) initScratch();
}

function updateNav() {
  document.querySelectorAll('.nd').forEach(d =>
    d.classList.toggle('on', +d.dataset.s === curSec));
}

document.querySelectorAll('.nd').forEach(d =>
  d.addEventListener('click', () => go(+d.dataset.s)));

document.getElementById('startBtn').addEventListener('click', () => go(2));

/* ═══════════════════════════════
   WORD SEARCH GAME
═══════════════════════════════ */
const HP_WORDS = [
  'HARRY','HERMIONE','RON','DOBBY','SNAPE','DRACO','HAGRID','LUNA',
  'SIRIUS','NEVILLE','GINNY','VOLDEMORT','BELLATRIX','CEDRIC',
  'FAWKES','HEDWIG','TONKS','REMUS','FRED','GEORGE','DUMBLEDORE'
];
const GRID_SIZE = 10;
let wsGrid = [], wsWords = [], wsPath = [], wsDragging = false;
let wsFound = new Set(), wsWordsFound = new Set();

function shuffle(arr) { return [...arr].sort(() => Math.random() - .5); }

function initWS() {
  document.getElementById('wsStart').style.display = 'none';
  document.getElementById('wsGame').style.display  = 'block';
  wsWords = shuffle(HP_WORDS).slice(0, 6);
  wsGrid  = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  wsFound.clear(); wsWordsFound.clear(); wsPath = [];
  placeWords(); fillGrid(); renderGrid(); renderWordList();
  document.getElementById('wsWin').style.display = 'none';
}

const DIRS = [[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];

function placeWords() {
  wsWords.forEach(word => {
    let placed = false, tries = 0;
    while (!placed && tries < 250) {
      tries++;
      const dir = DIRS[Math.floor(Math.random() * 8)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (canPlace(word, row, col, dir)) {
        for (let i = 0; i < word.length; i++)
          wsGrid[row + dir[0]*i][col + dir[1]*i] = word[i];
        placed = true;
      }
    }
  });
}

function canPlace(word, r, c, d) {
  for (let i = 0; i < word.length; i++) {
    const nr = r + d[0]*i, nc = c + d[1]*i;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false;
    if (wsGrid[nr][nc] && wsGrid[nr][nc] !== word[i]) return false;
  }
  return true;
}

function fillGrid() {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (!wsGrid[r][c]) wsGrid[r][c] = ALPHA[Math.floor(Math.random() * 26)];
}

function renderGrid() {
  const g = document.getElementById('wsgrid');
  g.innerHTML = '';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'wc';
      if (wsFound.has(`${r},${c}`)) cell.classList.add('found');
      cell.textContent = wsGrid[r][c];
      cell.dataset.r = r; cell.dataset.c = c;

      cell.addEventListener('mousedown', () => { wsDragging = true; wsPath = [{r,c}]; highlightPath(); });
      cell.addEventListener('mousemove', () => { if (wsDragging) extendPath(r, c); highlightPath(); });
      cell.addEventListener('mouseup',   () => { wsDragging = false; checkWord(); });
      cell.addEventListener('touchstart', () => { wsDragging = true; wsPath = [{r,c}]; highlightPath(); }, { passive: true });
      cell.addEventListener('touchmove', e => {
        const t = e.touches[0];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && el.classList.contains('wc')) { extendPath(+el.dataset.r, +el.dataset.c); highlightPath(); }
      }, { passive: true });
      cell.addEventListener('touchend', () => { wsDragging = false; checkWord(); });
      g.appendChild(cell);
    }
  }
}

function extendPath(r, c) {
  const last = wsPath[wsPath.length - 1];
  if (last.r === r && last.c === c) return;
  if (wsPath.length === 1) { wsPath.push({r, c}); return; }
  const dr = Math.sign(wsPath[1].r - wsPath[0].r);
  const dc = Math.sign(wsPath[1].c - wsPath[0].c);
  if (r === last.r + dr && c === last.c + dc) wsPath.push({r, c});
}

function highlightPath() {
  document.querySelectorAll('.wc:not(.found)').forEach(c => c.classList.remove('sel'));
  wsPath.forEach(p => {
    const el = document.querySelector(`.wc[data-r="${p.r}"][data-c="${p.c}"]`);
    if (el && !el.classList.contains('found')) el.classList.add('sel');
  });
}

function checkWord() {
  const selected = wsPath.map(p => wsGrid[p.r][p.c]).join('');
  const reversed = selected.split('').reverse().join('');
  const match = wsWords.find(w => w === selected || w === reversed);
  if (match && !wsWordsFound.has(match)) {
    wsWordsFound.add(match);
    wsPath.forEach(p => wsFound.add(`${p.r},${p.c}`));
    renderGrid();
    document.querySelectorAll('.wsw').forEach(el => {
      if (el.dataset.word === match) el.classList.add('found');
    });
    spark(innerWidth / 2, innerHeight / 2);
    if (wsWordsFound.size === wsWords.length) {
      setTimeout(() => {
        confetti(90);
        document.getElementById('wsWin').style.display = 'block';
        document.getElementById('wsSkipRow').style.display = 'none';
      }, 400);
    }
  }
  wsPath = [];
  document.querySelectorAll('.wc:not(.found)').forEach(c => c.classList.remove('sel'));
}

function renderWordList() {
  const container = document.getElementById('wswords');
  container.innerHTML = '<h3>✦ Find These ✦</h3>';
  wsWords.forEach(word => {
    const d = document.createElement('div');
    d.className = 'wsw'; d.dataset.word = word; d.textContent = word;
    container.appendChild(d);
  });
}

/* ═══════════════════════════════
   SPARKLE BURST
═══════════════════════════════ */
function spark(x, y) {
  const burst = document.createElement('div');
  burst.className = 'sburst';
  burst.style.cssText = `left:${x}px;top:${y}px;`;
  const colors = ['#f4c842','#ffe57a','#fff','#b8922a','#7b3fa0','#e25c5c','#5cb87c'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'sbp';
    const angle = (i / 20) * 360;
    const dist  = 45 + Math.random() * 70;
    p.style.cssText = `background:${colors[i % colors.length]};--tx:${Math.cos(angle*Math.PI/180)*dist}px;--ty:${Math.sin(angle*Math.PI/180)*dist}px;`;
    burst.appendChild(p);
  }
  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 900);
}

/* ═══════════════════════════════
   SORTING HAT
═══════════════════════════════ */
function shakeHat() {
  const wrap = document.getElementById('hatWrap');
  wrap.style.animation = 'none';
  wrap.style.transform = 'rotate(-25deg) scale(1.15)';
  setTimeout(() => {
    wrap.style.transform = 'rotate(25deg) scale(1.15)';
    setTimeout(() => {
      wrap.style.transform = '';
      wrap.style.animation = '';
    }, 200);
  }, 160);
}

function pickH(house, label, msg, col) {
  document.querySelectorAll('.hbtn').forEach(b => b.classList.remove('sel'));
  const houseClasses = { gryffindor: 'griff', slytherin: 'slyth', ravenclaw: 'raven', hufflepuff: 'huffl' };
  document.querySelector('.' + houseClasses[house]).classList.add('sel');

  const res = document.getElementById('sRes');
  res.style.display   = 'block';
  res.style.color     = col;
  res.style.textShadow = `0 0 25px ${col}80`;
  res.textContent = label;

  const desc = document.getElementById('sDesc');
  desc.style.display = 'block';
  desc.textContent   = msg;

  document.getElementById('sortNext').style.display = 'inline-block';
  confetti(40);
  spark(innerWidth / 2, innerHeight / 2);
}

/* ═══════════════════════════════
   SCRATCH CARD
═══════════════════════════════ */
function initScratch() {
  const card = document.getElementById('scCard');
  const canvas = document.getElementById('scrC');
  const ctx = canvas.getContext('2d');

  canvas.width  = card.offsetWidth;
  canvas.height = card.offsetHeight;

  // Draw mystical overlay
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#1a0a3a');
  grad.addColorStop(.5, '#0e0525');
  grad.addColorStop(1, '#050a1e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw rune/mandala pattern
  const cx = canvas.width / 2, cy = canvas.height / 2;
  ctx.strokeStyle = 'rgba(244,200,66,0.35)';
  ctx.lineWidth = 1;

  // Radiating lines
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * canvas.width, cy + Math.sin(a) * canvas.height);
    ctx.stroke();
  }
  // Concentric hexagons
  for (let ring = 1; ring <= 6; ring++) {
    const r = (ring / 6) * Math.min(canvas.width, canvas.height) * .75;
    ctx.beginPath();
    for (let i = 0; i <= 6; i++) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 6;
      const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.stroke();
  }

  // Center text
  ctx.fillStyle = 'rgba(244,200,66,0.6)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.floor(canvas.height * .18)}px Cinzel Decorative, serif`;
  ctx.fillText('✦ SCRATCH ✦', cx, cy);

  let scratching = false;
  const total = canvas.width * canvas.height;

  const scratchAt = (x, y) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill();

    // Check progress every ~5% of time
    if (Math.random() < .05) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let transparent = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] < 128) transparent++;
      const pct = Math.min(100, Math.round(transparent / total * 400));
      document.getElementById('scPct').textContent = `${pct}% Revealed`;
      if (pct >= 60 && document.getElementById('scDone').style.display === 'none') {
        document.getElementById('scDone').style.display = 'block';
        document.getElementById('scHint').style.display = 'none';
        confetti(60);
      }
    }
  };

  canvas.addEventListener('mousedown',  e => { scratching = true; scratchAt(e.offsetX, e.offsetY); });
  canvas.addEventListener('mousemove',  e => { if (scratching) scratchAt(e.offsetX, e.offsetY); });
  canvas.addEventListener('mouseup',    () => scratching = false);
  canvas.addEventListener('mouseleave', () => scratching = false);
  canvas.addEventListener('touchstart', e => {
    scratching = true;
    const r = canvas.getBoundingClientRect();
    scratchAt(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
  }, { passive: true });
  canvas.addEventListener('touchmove',  e => {
    if (!scratching) return;
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    scratchAt(e.touches[0].clientX - r.left, e.touches[0].clientY - r.top);
  }, { passive: false });
  canvas.addEventListener('touchend',   () => scratching = false);
}

/* ═══════════════════════════════
   FINAL LETTER
═══════════════════════════════ */
function openLetter() {
  const env = document.getElementById('envWrap');
  env.style.transition = 'all .5s ease';
  env.style.transform  = 'scale(0) rotate(20deg)';
  env.style.opacity    = '0';

  setTimeout(() => {
    env.style.display = 'none';
    const parch = document.getElementById('parch');
    parch.style.display = 'block';

    document.getElementById('pTitle').textContent =
      (C.letter.title || `Happy Birthday, ${C.name}!`).replace(/NAME/g, C.name);

    const bodyHtml = (C.letter.body || '').replace(/NAME/g, C.name).replace(/\n/g, '<br>');
    document.getElementById('pBody').innerHTML = bodyHtml;

    document.getElementById('pSign').textContent =
      (C.letter.signature || '— With love 🪄').replace(/NAME/g, C.name);

    confetti(80);
    setTimeout(() => {
      document.getElementById('finRow').style.display = 'flex';
    }, 1500);
  }, 550);
}

function bigCelebrate() {
  confetti(180);
  for (let i = 0; i < 15; i++) {
    setTimeout(() => spark(Math.random() * innerWidth, Math.random() * innerHeight), i * 150);
  }
}

/* ═══════════════════════════════
   CONFETTI
═══════════════════════════════ */
function confetti(count = 60) {
  const colors = ['#f4c842','#ffe57a','#b8922a','#ae0001','#2a623d','#5a7bd6','#ecb939','#fff','#7b3fa0','#e25c5c'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const c = document.createElement('div');
      c.className = 'cfp';
      const col = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 9;
      const isCircle = Math.random() > .5;
      c.style.cssText = `left:${Math.random()*100}vw;background:${col};width:${size}px;height:${size}px;border-radius:${isCircle?'50%':'2px'};animation-duration:${2+Math.random()*3}s;animation-delay:${Math.random()*.5}s;transform:rotate(${Math.random()*360}deg);`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5000);
    }, i * 25);
  }
}
