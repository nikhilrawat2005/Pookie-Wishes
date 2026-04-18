/**
 * Pookie Wishes — Premium Wedding Wish Card
 * Universal content · AI message · Premium mode · Share CTA
 */

// ── DEFAULT LETTER CONTENT (Universal — no past story needed) ──
const DEFAULT_LETTER = {
    msg1: "Today, as you stand together at the beginning of this beautiful new chapter, I want you to know how truly special this moment is. Not just for you — but for everyone whose life has been touched by your love, your warmth, and the joy you carry into every room you enter.",
    p2: "May your journey together be filled with mornings that start with warm smiles, evenings wrapped in the kind of comfort only home can give, and a lifetime of moments that remind you every single day why you chose each other.",
    p3: "Marriage is not just a ceremony. It is a promise whispered between two hearts — to stay, to grow, to forgive, and to love even harder when the world gets heavy. From this day forward, may every moment bring you closer together.",
    p4: "With all the love in my heart — congratulations on your beautiful forever. 💛"
};

// ── CARD STATE ──
let cardData = {
    brideName: "Anya",
    groomName: "Aryan",
    weddingDate: "January 24, 2026",
    location: "",
    letter: { ...DEFAULT_LETTER }
};

// ══════════════════════════════════════════════
// CUSTOMIZER
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Premium toggle
    document.getElementById('toggle-premium').addEventListener('change', function () {
        const fields = document.getElementById('premium-fields');
        fields.classList.toggle('hidden', !this.checked);
    });

    // Load config.json as default preview data (silent, non-blocking)
    fetch('user_content/config.json')
        .then(r => r.json())
        .then(data => {
            if (data.brideName) document.getElementById('inp-bride').placeholder = data.brideName;
            if (data.groomName) document.getElementById('inp-groom').placeholder = data.groomName;
            if (data.weddingDate) document.getElementById('inp-date').placeholder = data.weddingDate;
        })
        .catch(() => {});
});

function createCard() {
    const bride = document.getElementById('inp-bride').value.trim();
    const groom = document.getElementById('inp-groom').value.trim();
    const date  = document.getElementById('inp-date').value.trim();

    if (!bride || !groom) {
        shakeField(!bride ? 'inp-bride' : 'inp-groom');
        return;
    }

    cardData.brideName   = bride;
    cardData.groomName   = groom;
    cardData.weddingDate = date || 'Today';

    const isPremium = document.getElementById('toggle-premium').checked;
    if (isPremium) {
        const loc      = document.getElementById('inp-location').value.trim();
        const msg      = document.getElementById('inp-custom-msg').value.trim();
        cardData.location = loc;
        if (msg) {
            cardData.letter.msg1 = msg;
        }
        if (loc) {
            document.querySelector('.hero-location').textContent = loc;
            document.querySelector('.hero-location').classList.remove('hidden');
        }
    }

    // Inject names + date everywhere
    applyCardData();

    // Transition: hide overlay, show card
    const overlay = document.getElementById('customizer-overlay');
    overlay.style.opacity = '0';
    overlay.style.transform = 'scale(1.04)';
    setTimeout(() => {
        overlay.style.display = 'none';
        const card = document.getElementById('main-card');
        card.classList.remove('hidden');
        card.style.opacity = '0';
        requestAnimationFrame(() => {
            card.style.transition = 'opacity .9s ease';
            card.style.opacity = '1';
        });

        // Init everything after reveal
        setTimeout(() => {
            initPetals();
            initScrollReveal();
            initDoodleEngine();
            initWisdom();
            initTypewriter(cardData.letter);
        }, 100);
    }, 500);
}

function applyCardData() {
    document.querySelectorAll('.bride-name').forEach(el => el.textContent = cardData.brideName);
    document.querySelectorAll('.groom-name').forEach(el => el.textContent = cardData.groomName);
    document.querySelectorAll('.wedding-date').forEach(el => el.textContent = cardData.weddingDate.toUpperCase());

    // Update title
    document.title = `${cardData.brideName} & ${cardData.groomName} · Wedding Wish`;
}

function shakeField(id) {
    const el = document.getElementById(id);
    el.style.borderColor = '#c4747a';
    el.style.animation = 'shake .4s ease';
    setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 500);
}

// ══════════════════════════════════════════════
// AI MESSAGE GENERATOR (Anthropic API)
// ══════════════════════════════════════════════
async function generateAIMessage() {
    const btn = document.getElementById('btn-ai-generate');
    const preview = document.getElementById('ai-preview');
    const bride = document.getElementById('inp-bride').value.trim() || 'the bride';
    const groom = document.getElementById('inp-groom').value.trim() || 'the groom';
    const relation = document.getElementById('inp-relation').value.trim();
    const date = document.getElementById('inp-date').value.trim() || 'their wedding day';

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-icon spin">✨</span> Generating...';
    preview.classList.remove('hidden');
    preview.textContent = '';

    const prompt = `Write a beautiful, heartfelt wedding message for ${bride} and ${groom} who are getting married on ${date}. ${relation ? `The sender is the ${relation}.` : ''} 

Rules:
- Only celebrate the present moment and the beautiful future ahead — NEVER mention how they met, their proposal, or past memories
- Keep it warm, personal, and emotional but concise (3–4 sentences max)
- Universal — can be sent by anyone without knowing the couple's full story
- End with one powerful line they'll remember forever
- No generic phrases like "wishing you a happy married life"

Output ONLY the message, nothing else.`;

    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 300,
                messages: [{ role: "user", content: prompt }]
            })
        });
        const data = await response.json();
        const msg = data.content?.[0]?.text || DEFAULT_LETTER.msg1;

        preview.textContent = msg;
        preview.style.opacity = '0';
        preview.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
            preview.style.transition = 'opacity .6s ease, transform .6s ease';
            preview.style.opacity = '1';
            preview.style.transform = 'none';
        });

        // Save to card data
        cardData.letter.msg1 = msg;
        document.getElementById('inp-custom-msg').value = msg;

    } catch (e) {
        preview.textContent = DEFAULT_LETTER.msg1;
    }

    btn.disabled = false;
    btn.innerHTML = '<span class="btn-icon">✨</span> Regenerate Message';
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

    if (p2) p2.textContent = content.p2 || DEFAULT_LETTER.p2;
    if (p3) p3.textContent = content.p3 || DEFAULT_LETTER.p3;
    if (p4) p4.textContent = content.p4 || DEFAULT_LETTER.p4;

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

// ══════════════════════════════════════════════
// CTAs
// ══════════════════════════════════════════════
function scrollToWish() {
    document.getElementById('love-lock').scrollIntoView({ behavior: 'smooth' });
}

async function shareCard() {
    const title = `${cardData.brideName} & ${cardData.groomName} — Wedding Wish`;
    const text  = `Wishing ${cardData.brideName} & ${cardData.groomName} a beautiful forever ❤️`;

    if (navigator.share) {
        try {
            await navigator.share({ title, text, url: window.location.href });
        } catch {}
    } else {
        // Fallback: copy to clipboard
        try {
            await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
            showToast('Link copied to clipboard! 💌');
        } catch {
            showToast('Share this page to spread the love 💌');
        }
    }
}

function createNewCard() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        document.getElementById('main-card').classList.add('hidden');
        const overlay = document.getElementById('customizer-overlay');
        overlay.style.display = '';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(.97)';
        requestAnimationFrame(() => {
            overlay.style.transition = 'opacity .6s ease, transform .6s ease';
            overlay.style.opacity = '1';
            overlay.style.transform = 'none';
        });
        // Reset
        document.getElementById('inp-bride').value = '';
        document.getElementById('inp-groom').value = '';
        document.getElementById('inp-date').value = '';
    }, 400);
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

// ── Expose globals ──
window.unlockHeart   = unlockHeart;
window.createCard    = createCard;
window.generateAIMessage = generateAIMessage;
window.shareCard     = shareCard;
window.createNewCard = createNewCard;
window.scrollToWish  = scrollToWish;
