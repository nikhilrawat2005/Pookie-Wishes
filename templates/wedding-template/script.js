/**
 * Pookie Wishes — Royal Nuptials Wedding Template
 * Data-driven from user_content/config.json
 */

// ── DEFAULT LETTER CONTENT ──
const DEFAULT_LETTER = {
    msg1: "Today, as you stand together at the beginning of this beautiful new chapter, I want you to know how truly special this moment is. Not just for you — but for everyone whose life has been touched by your love, your warmth, and the joy you carry into every room you enter.",
    p2: "May your journey together be filled with mornings that start with warm smiles, evenings wrapped in the kind of comfort only home can give, and a lifetime of moments that remind you every single day why you chose each other.",
    p3: "Marriage is not just a ceremony. It is a promise whispered between two hearts — to stay, to grow, to forgive, and to love even harder when the world gets heavy. From this day forward, may every moment bring you closer together.",
    p4: "With all the love in my heart — congratulations on your beautiful forever. 💛"
};

// ── CARD DATA ──
let cardData = {
    brideName: "Anya",
    groomName: "Aryan",
    weddingDate: "January 24, 2026",
    letter: { ...DEFAULT_LETTER }
};

// ══════════════════════════════════════════════
// INIT — Load data and boot up
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
    let data;
    try {
        if (typeof window.getPookieData === 'function') {
            data = await window.getPookieData('wedding');
        }
        if (!data) {
            const res = await fetch('user_content/config.json');
            if (res.ok) data = await res.json();
        }

        if (data) {
            console.log('[Wedding] Loaded data:', data);
            if (data.brideName) cardData.brideName = data.brideName;
            if (data.groomName) cardData.groomName = data.groomName;
            
            // Format Date (e.g. 2026-05-20 -> May 20, 2026)
            if (data.weddingDate) {
                let dStr = data.weddingDate;
                if (dStr.length === 10 && dStr.includes('-')) {
                    const d = new Date(dStr);
                    if (!isNaN(d)) dStr = d.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });
                }
                cardData.weddingDate = dStr;
            }

            // Letter content logic
            if (data.message || data.letterContent) {
                // If user wrote a custom message, we REPLACE the whole letter
                // unless they entered multiple paragraphs (not currently possible via form)
                if (data.message) {
                    cardData.letter.msg1 = data.message;
                    cardData.letter.p2 = ""; // Clear defaults
                    cardData.letter.p3 = "";
                    cardData.letter.p4 = "";
                } else if (data.letterContent) {
                    cardData.letter.msg1 = data.letterContent.msg1 || DEFAULT_LETTER.msg1;
                    cardData.letter.p2 = data.letterContent.p2 || "";
                    cardData.letter.p3 = data.letterContent.p3 || "";
                    cardData.letter.p4 = data.letterContent.p4 || "";
                }
            }

            // Global Placeholder Fix (v3)
            if (window.bindPookiePlaceholders) {
                window.bindPookiePlaceholders({
                    name: cardData.brideName,
                    sender: cardData.brideName + " & " + cardData.groomName,
                    message: cardData.letter.msg1
                });
            }
        }
    } catch (e) {
        console.warn('[Wedding] Data load failed:', e.message);
    }

    // Apply all data to DOM
    applyCardData();

    // Init all visual systems
    initPetals();
    initScrollReveal();
    initDoodleEngine();
    initWisdom();
    initTypewriter(cardData.letter);
});

// ══════════════════════════════════════════════
// APPLY DATA TO DOM
// ══════════════════════════════════════════════
function applyCardData() {
    document.querySelectorAll('.bride-name').forEach(el => el.textContent = cardData.brideName);
    document.querySelectorAll('.groom-name').forEach(el => el.textContent = cardData.groomName);
    document.querySelectorAll('.wedding-date').forEach(el => el.textContent = cardData.weddingDate.toUpperCase());

    // Update page title
    document.title = `${cardData.brideName} & ${cardData.groomName} · Wedding Wish 💛`;
}

// ══════════════════════════════════════════════
// WISDOM QUOTES
// ══════════════════════════════════════════════
function initWisdom() {
    const quotes = [
        { text: "A successful marriage requires falling in love many times, always with the same person.", author: "Mignon McLaughlin" },
        { text: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn" },
        { text: "You don't marry someone you can live with — you marry the person you cannot live without.", author: "Anonymous" },
        { text: "Whatever our souls are made of, his and hers are the same.", author: "Emily Brontë" },
    ];
    const grid = document.getElementById('wisdom-grid');
    if (!grid) return;
    grid.innerHTML = quotes.map(q => `
        <div class="wisdom-card reveal">
            <blockquote>"${q.text}"</blockquote>
            <cite>— ${q.author}</cite>
        </div>
    `).join('');
    // Re-observe new elements
    initScrollReveal();
}

// ══════════════════════════════════════════════
// PETAL ANIMATION
// ══════════════════════════════════════════════
function initPetals() {
    const layer = document.getElementById('petalLayer');
    if (!layer) return;
    const colors = ['#f8d7da','#fdf2f2','#ffeaa0','#fff','#fce4ec','#f3e5f5','#ffe4b5'];
    for (let i = 0; i < 55; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        const size = 8 + Math.random() * 16;
        p.style.cssText = `
            left:${Math.random() * 100}%;
            width:${size}px; height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration:${10 + Math.random() * 14}s;
            animation-delay:${Math.random() * 20}s;
            border-radius:${Math.random() > .5 ? '0 80% 0 80%' : '80% 0 80% 0'};
            opacity:.85;
        `;
        layer.appendChild(p);
    }
}

// ══════════════════════════════════════════════
// SCROLL REVEAL
// ══════════════════════════════════════════════
function initScrollReveal() {
    const revObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('in');
        });
    }, { threshold: .08 });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        if (!el.classList.contains('in')) revObs.observe(el);
    });
}

// ══════════════════════════════════════════════
// TYPEWRITER
// ══════════════════════════════════════════════
function initTypewriter(content) {
    const msg1 = content.msg1 || DEFAULT_LETTER.msg1;
    let typed = false;
    const letterEl = document.getElementById('letter-typed');
    const p2 = document.getElementById('letter-p2');
    const p3 = document.getElementById('letter-p3');
    const p4 = document.getElementById('letter-p4');

    if (p2) p2.textContent = (content.p2 !== undefined) ? content.p2 : DEFAULT_LETTER.p2;
    if (p3) p3.textContent = (content.p3 !== undefined) ? content.p3 : DEFAULT_LETTER.p3;
    if (p4) p4.textContent = (content.p4 !== undefined) ? content.p4 : DEFAULT_LETTER.p4;

    const letterObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !typed) {
            typed = true;
            letterObs.disconnect();
            let i = 0;
            function tick() {
                if (i < msg1.length) {
                    if (letterEl) letterEl.textContent += msg1[i++];
                    setTimeout(tick, 14);
                } else {
                    setTimeout(() => {
                        if (p2) p2.style.cssText = 'opacity:1;transition:opacity 1.5s';
                        setTimeout(() => {
                            if (p3) p3.style.cssText = 'opacity:1;transition:opacity 1.5s';
                            setTimeout(() => {
                                if (p4) p4.style.cssText = 'opacity:1;transition:opacity 1.5s';
                            }, 1000);
                        }, 1000);
                    }, 500);
                }
            }
            tick();
        }
    }, { threshold: .3 });
    const target = document.getElementById('love-letter');
    if (target) letterObs.observe(target);
}

// ══════════════════════════════════════════════
// DOODLE ENGINE
// ══════════════════════════════════════════════
function initDoodleEngine() {
    const slots = document.querySelectorAll('.doodle-slot[data-sticker]');
    slots.forEach(slot => {
        const file   = slot.getAttribute('data-sticker');
        const size   = parseInt(slot.getAttribute('data-size')) || 120;
        const rotate = parseFloat(slot.getAttribute('data-rotate')) || 0;
        const img = document.createElement('img');
        img.src = `images/${file}`;
        img.className = 'sticker';
        img.style.cssText = `width:${size}px;`;
        img.style.transform = `rotate(${rotate}deg)`;
        img.style.animationDelay = `${(Math.random() * 4).toFixed(1)}s`;
        slot.appendChild(img);
    });
}

// ══════════════════════════════════════════════
// LOVE LOCK
// ══════════════════════════════════════════════
let lockOpen = false;
function unlockHeart() {
    if (lockOpen) return;
    lockOpen = true;
    const stage = document.getElementById('lockStage');
    stage.classList.add('unlocked');
    launchConfetti(35);
    setTimeout(() => launchConfetti(45), 700);
    setTimeout(() => {
        const reveal = document.getElementById('lockReveal');
        if (reveal) reveal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1400);
}

// ══════════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════════
function launchConfetti(n = 60) {
    const emojis = ['💍','🌸','💛','✨','🤍','💐','🎊','💫','🌺','❤️','💒','🥂','🌼','🌹'];
    for (let i = 0; i < n; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'conf-piece';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            const size = 14 + Math.random() * 16;
            el.style.cssText = `left:${Math.random() * 100}vw;font-size:${size}px;animation-duration:${2.5 + Math.random() * 3}s`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 6500);
        }, i * 40);
    }
}

// ── UTILITY ──
function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

// ── Expose globals ──
window.unlockHeart = unlockHeart;
