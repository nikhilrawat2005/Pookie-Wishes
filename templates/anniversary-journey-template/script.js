// ============================================
//  ANNIVERSARY JOURNEY — POLISHED EDITION
// ============================================
gsap.registerPlugin(ScrollTrigger);

// ── DATA ──────────────────────────────────
const DATA = {
    names: "Sahil & Priya",
    letter: `Happy Anniversary my pookie! ✨

Looking back at these photos reminds me of how far we've come together. Every scroll, every moment — it's been the most beautiful adventure of my life.

Thank you for being my safe place, my laughter, my home. You walked into my world and turned it into something I could have never imagined.

I love you to the moon and back, and then some. 🌙`,
    signature: "Sahil",
    photos: [
        "assets/1000121228.jpg.jpeg",
        "assets/1000121229.jpg.jpeg",
        "assets/1000121230.jpg.jpeg",
        "assets/1000121232.jpg.jpeg"
    ]
};

const MOMENTS = [
    {
        title: "The Beginning of Us",
        number: "Chapter I",
        caption: "Where it all started",
        body: "Thinking back to the very first moment — I never realized I was looking at my entire future. You walked into my life and suddenly everything made sense. Every song, every poem, every star. You are the best thing that has ever happened to me, and I'll treasure this beginning for the rest of my life. 💖"
    },
    {
        title: "Every Laugh & Date",
        number: "Chapter II",
        caption: "Our favourite days",
        body: "From our nervous first dates to the countless hours we spent laughing until our stomachs hurt — every second with you has been a treasure. It's the way you look at me when you think I'm not watching. Thank you for making even the most ordinary days feel cinematic. You are my constant joy. 🍭"
    },
    {
        title: "My Rock & My Home",
        number: "Chapter III",
        caption: "Through every storm",
        body: "Life isn't always easy, but having you by my side makes every challenge feel small. You've been my rock through every storm and my biggest cheerleader in every success. In your arms, I found a home I never want to leave. Thank you for loving me at my best and at my hardest. ⚓"
    },
    {
        title: "Today & Forever",
        number: "Chapter IV",
        caption: "And beyond",
        body: "And here we are today, stronger and more in love than ever before. This journey has been more beautiful than I ever dreamed possible — yet I feel we're only just getting started. I promise to keep choosing you, day after day, year after year. Here's to forever, my pookie. 💍✨"
    }
];

const STICKERS_ACCENT = [
    'assets/sticker-cat-couple.png',
    'assets/sticker-bow.png',
    'assets/sticker-kitty.png',
    'assets/sticker-heart-kitty.webp'
];

const STICKERS_BG = [
    'assets/11289829e92f9243e9d2b959ab2f3623.jpg',
    'assets/2e310d8c00d8ebc6465efe3ab9e1ffad.jpg',
    'assets/40fc469d09c8f18f1033068caf6745fd.jpg',
    'assets/9cb65cee24e5e5ab12abb85675752e38.jpg',
    'assets/bf371a9022ef74145a505937ee051c48.jpg',
    'assets/c0fa93882918f515144cfaa5d20f8a17.jpg',
    'assets/download.png',
    'assets/download (1).png',
    'assets/download (2).png',
    'assets/download (3).png'
];

// ── INIT ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initData();
    initPetalCanvas();
    initReveals();
    buildPhotoMoments();
});

function initData() {
    document.getElementById('display-names').textContent   = DATA.names;
    document.getElementById('display-letter').textContent  = DATA.letter;
    document.getElementById('display-signature').textContent = DATA.signature;
}

// ── PETAL CANVAS ─────────────────────────
function initPetalCanvas() {
    const canvas = document.getElementById('petal-canvas');
    const ctx    = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const petals = [];
    const COLORS = ['#f5c6c6','#f9d5d5','#fce4d6','#f8bbd0','#c4847a'];

    for (let i = 0; i < 28; i++) {
        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: 3 + Math.random() * 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            speed: 0.3 + Math.random() * 0.7,
            drift: (Math.random() - 0.5) * 0.4,
            rot: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            opacity: 0.15 + Math.random() * 0.45
        });
    }

    function drawPetal(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r * 1.5, p.r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function loop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.y  -= p.speed;
            p.x  += p.drift;
            p.rot += p.rotSpeed;
            if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
            drawPetal(p);
        });
        requestAnimationFrame(loop);
    }
    loop();
}

// ── PHOTO MOMENTS ────────────────────────
function buildPhotoMoments() {
    const container = document.getElementById('photo-container');
    container.innerHTML = '';

    DATA.photos.slice(0, 4).forEach((url, i) => {
        const m = document.createElement('div');
        m.className = `photo-moment ${i % 2 === 0 ? 'from-left' : 'from-right'}`;
        const info = MOMENTS[i];

        m.innerHTML = `
            <div class="moment-photo-side">
                <div class="polaroid">
                    <img src="${url}" class="polaroid-img" alt="Memory ${i+1}" loading="lazy">
                    <div class="polaroid-caption">${info.caption}</div>
                </div>
            </div>
            <div class="timeline-node">
                <div class="timeline-node-dot"></div>
            </div>
            <div class="moment-text-side">
                <span class="moment-number">${info.number}</span>
                <h3 class="moment-title">${info.title}</h3>
                <p class="moment-body">${info.body}</p>
            </div>
        `;
        container.appendChild(m);
    });

    // Scatter ambient stickers
    buildDecorLayer();

    // Init scroll reveals for moments
    initMomentReveals();

    // Timeline fill
    initTimelineFill();
}

function buildDecorLayer() {
    const container = document.getElementById('decor-container');
    if (!container) return;
    container.innerHTML = '';

    // Soft accent stickers near moments (very subtle)
    const positions = [
        { top:'8%',  left:'5%',  cls:'size-lg layer-mid',  src: STICKERS_ACCENT[0] },
        { top:'8%',  right:'5%', cls:'size-md layer-mid',  src: STICKERS_ACCENT[1] },
        { top:'30%', left:'2%',  cls:'size-md layer-deep', src: STICKERS_ACCENT[2] },
        { top:'55%', right:'3%', cls:'size-md layer-deep', src: STICKERS_ACCENT[3] },
        { top:'75%', left:'4%',  cls:'size-lg layer-mid',  src: STICKERS_ACCENT[0] },
        { top:'75%', right:'4%', cls:'size-md layer-mid',  src: STICKERS_ACCENT[1] },
    ];

    positions.forEach(p => {
        const el = document.createElement('div');
        el.className = `static-decor ${p.cls}`;
        el.style.top = p.top;
        if (p.left)  el.style.left  = p.left;
        if (p.right) el.style.right = p.right;
        el.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
        el.innerHTML = `<img src="${p.src}" alt="">`;
        container.appendChild(el);
    });

    // Tiny emoji sprinkles
    const emojis = ['♥','✦','✿','❋','✸'];
    for (let i = 0; i < 12; i++) {
        const el = document.createElement('div');
        el.className = 'static-decor layer-deep';
        el.style.top  = (5 + Math.random() * 90) + '%';
        el.style.left = (Math.random() * 92) + '%';
        el.style.fontSize = (10 + Math.random() * 14) + 'px';
        el.style.color = Math.random() > 0.5 ? '#9B2335' : '#C9A84C';
        el.style.opacity = String(0.06 + Math.random() * 0.1);
        el.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        container.appendChild(el);
    }
}

function initMomentReveals() {
    const moments = document.querySelectorAll('.photo-moment');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('on');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25, rootMargin: '0px 0px -60px 0px' });

    moments.forEach(m => observer.observe(m));
}

function initTimelineFill() {
    const fill  = document.getElementById('timeline-fill');
    const track = document.querySelector('.journey-wrap');
    if (!fill || !track) return;

    const update = () => {
        const rect  = track.getBoundingClientRect();
        const total = track.offsetHeight;
        const progress = Math.max(0, Math.min(1, (-rect.top + window.innerHeight * 0.5) / total));
        fill.style.height = (progress * 100) + '%';
    };

    window.addEventListener('scroll', update, { passive: true });
    update();
}

// ── REVEALS ──────────────────────────────
function initReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── NAVIGATION ───────────────────────────
function startJourney() {
    const intro   = document.getElementById('section-intro');
    const journey = document.getElementById('section-journey');

    gsap.to(intro, {
        duration: 0.8, opacity: 0, y: -40, ease: 'power3.in',
        onComplete: () => {
            intro.classList.remove('active');
            journey.classList.add('active');
            window.scrollTo(0, 0);
            gsap.fromTo(journey, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
            ScrollTrigger.refresh();
        }
    });
}

function revealLetter() {
    const journey = document.getElementById('section-journey');
    const letter  = document.getElementById('section-letter');

    gsap.to(journey, {
        duration: 0.8, opacity: 0, scale: 0.97, ease: 'power3.in',
        onComplete: () => {
            journey.classList.remove('active');
            letter.classList.add('active');
            window.scrollTo(0, 0);
            gsap.fromTo(letter, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' });
            // Re-trigger reveals
            document.querySelectorAll('#section-letter .reveal').forEach(el => {
                setTimeout(() => el.classList.add('on'), 600);
            });
        }
    });
}

function showEnding() {
    const letter = document.getElementById('section-letter');
    const ending = document.getElementById('section-ending');

    gsap.to(letter, {
        duration: 0.8, opacity: 0, x: -60, ease: 'power3.in',
        onComplete: () => {
            letter.classList.remove('active');
            ending.classList.add('active');
            gsap.fromTo(ending, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out' });
            setTimeout(() => {
                document.querySelectorAll('#section-ending .reveal').forEach(el => el.classList.add('on'));
            }, 400);
        }
    });
}

function restartJourney() {
    location.reload();
}
