/**
 * Royal Nuptials — Polished Script
 * Smart sticker injection, enhanced content, all sections
 */

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initPetals();
    initScrollReveal();
    initDoodleEngine();
    initWisdom();
});

// --- WISDOM QUOTES (built-in) ---
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
    // re-observe newly created elements
    initScrollReveal();
}

// --- DATA LOADING ---
async function loadConfig() {
    try {
        const response = await fetch('user_content/config.json');
        const data = await response.json();

        if (data.brideName) document.querySelectorAll('.bride-name').forEach(el => el.textContent = data.brideName);
        if (data.groomName) document.querySelectorAll('.groom-name').forEach(el => el.textContent = data.groomName);
        if (data.weddingDate) document.querySelectorAll('.wedding-date').forEach(el => el.textContent = data.weddingDate);
        if (data.location) document.querySelectorAll('.location-text').forEach(el => el.textContent = data.location);
        if (data.heroText) document.querySelector('.hero-subtitle') && (document.querySelector('.hero-subtitle').textContent = data.heroText);

        // Timeline
        const timelineContent = document.getElementById('timeline-content');
        if (timelineContent && data.timeline) {
            timelineContent.innerHTML = data.timeline.map(item => `
                <div class="timeline-item reveal">
                    <div class="time-year">${item.year}</div>
                    <div class="time-mark"></div>
                    <div class="time-desc">${item.event}</div>
                </div>
            `).join('');
        }

        // Wishes
        const wishesContainer = document.getElementById('wishes-container');
        const flowers = [
            'images/af01c37c8da6dfd3d0330a1fbdbd761e.jpg',
            'images/f98c75359b3aab99ec29651b703df9b9.jpg',
            'images/d35faf4c47f312f0c0ea3e636a2f6a43.jpg',
            'images/1f1782224d76bfb1b7d3e803a538900c.jpg',
        ];
        if (wishesContainer && data.wishes) {
            wishesContainer.innerHTML = data.wishes.map((wish, index) => `
                <div class="wish-item ${index % 2 === 0 ? 'left' : 'right'} reveal">
                    <div class="wish-empty"></div>
                    <div class="wish-dot"><div class="wish-dot-inner"></div></div>
                    <div class="wish-content">
                        <img src="${flowers[index % flowers.length]}" class="wish-flower" alt="flower">
                        <h4>${wish.title}</h4>
                        <p>${wish.text}</p>
                    </div>
                </div>
            `).join('');
        }

        if (data.letterContent) initTypewriter(data.letterContent);
        initScrollReveal();

    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// --- PETAL ANIMATION ---
function initPetals() {
    const layer = document.getElementById('petalLayer');
    if (!layer) return;
    const colors = ['#f8d7da', '#fdf2f2', '#ffeaa0', '#fff', '#fce4ec', '#f3e5f5'];
    for (let i = 0; i < 50; i++) {
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

// --- SCROLL REVEAL ---
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

// --- TYPEWRITER ---
function initTypewriter(content) {
    const msg1 = content.msg1 || "";
    let typed = false;
    const letterEl = document.getElementById('letter-typed');
    const p2 = document.getElementById('letter-p2');
    const p3 = document.getElementById('letter-p3');
    const p4 = document.getElementById('letter-p4');

    if (p2) p2.textContent = content.p2;
    if (p3) p3.textContent = content.p3;
    if (p4) p4.textContent = content.p4;

    const letterObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !typed) {
            typed = true;
            letterObs.disconnect();
            let i = 0;
            function tick() {
                if (i < msg1.length) {
                    if (letterEl) letterEl.textContent += msg1[i++];
                    setTimeout(tick, 16);
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

// --- DOODLE ENGINE — Smart Data-Attribute Sticker System ---
function initDoodleEngine() {
    const slots = document.querySelectorAll('.doodle-slot[data-sticker]');
    slots.forEach(slot => {
        const file    = slot.getAttribute('data-sticker');
        const size    = parseInt(slot.getAttribute('data-size')) || 120;
        const rotate  = parseFloat(slot.getAttribute('data-rotate')) || 0;

        const img = document.createElement('img');
        img.src = `images/${file}`;
        img.className = 'sticker';
        img.style.cssText = `
            width:${size}px;
            --r:${rotate}deg;
        `;
        img.style.transform = `rotate(${rotate}deg)`;

        // Add slight random bob offset so they don't all bob in sync
        const delay = (Math.random() * 4).toFixed(1);
        img.style.animationDelay = `${delay}s`;

        slot.appendChild(img);
    });
}

// --- LOVE LOCK ---
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

// --- CONFETTI ---
function launchConfetti(n = 60) {
    const emojis = ['💍', '🌸', '💛', '✨', '🤍', '💐', '🎊', '💫', '🌺', '❤️', '💒', '🥂', '🌼', '🌹'];
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

window.unlockHeart = unlockHeart;
