/**
 * Royal Nuptials Template Script
 * Handles animations, dynamic content loading, and the DoodleEngine (stickers)
 */

document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initPetals();
    initScrollReveal();
    initDoodleEngine();
});

// --- DATA LOADING ---
async function loadConfig() {
    try {
        const response = await fetch('user_content/config.json');
        const data = await response.json();
        
        // Update DOM elements with config data
        if (data.brideName) document.querySelector('.bride-name').textContent = data.brideName;
        if (data.groomName) document.querySelector('.groom-name').textContent = data.groomName;
        if (data.weddingDate) document.querySelector('.wedding-date').textContent = data.weddingDate;
        if (data.location) document.querySelector('.location-text').textContent = data.location;
        if (data.heroText) document.querySelector('.hero-subtitle').textContent = data.heroText;
        
        // Timeline loading
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

        // Wishes loading
        const wishesContainer = document.getElementById('wishes-container');
        if (wishesContainer && data.wishes) {
            wishesContainer.innerHTML = data.wishes.map((wish, index) => `
                <div class="wish-item ${index % 2 === 0 ? 'left' : 'right'} reveal">
                    <div class="wish-empty"></div>
                    <div class="wish-dot"><div class="wish-dot-inner"></div></div>
                    <div class="wish-content">
                        <h3>${wish.title}</h3>
                        <p>${wish.text}</p>
                    </div>
                </div>
            `).join('');
        }

        // Initialize Typewriter after config is loaded
        if (data.letterContent) {
            initTypewriter(data.letterContent);
        }

    } catch (error) {
        console.error('Error loading config:', error);
    }
}

// --- PETAL ANIMATION ---
function initPetals() {
    const layer = document.getElementById('petalLayer');
    if (!layer) return;
    const colors = ['#f8d7da', '#fdf2f2', '#ffc107', '#fff'];
    for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'petal';
        const size = 10 + Math.random() * 16;
        p.style.cssText = `
            left:${Math.random() * 100}%;
            width:${size}px;height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration:${10 + Math.random() * 14}s;
            animation-delay:${Math.random() * 18}s;
            border-radius:${Math.random() > .5 ? '0 80% 0 80%' : '80% 0 80% 0'};
            opacity:.8;
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
    }, { threshold: .1 });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revObs.observe(el));
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
                    letterEl.textContent += msg1[i++];
                    setTimeout(tick, 18);
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

// --- DOODLE ENGINE (Sticker Injection) ---
function initDoodleEngine() {
    const stickerList = [
        "00b3bd8d1e6aafbe6d44754fa630306e.jpg",
        "19af0e09011f87d5b54ae1362bd22638.jpg",
        "1f1782224d76bfb1b7d3e803a538900c.jpg",
        "29f8ada0158a4fc2d9e167106e489aa2.jpg",
        "4993b813df12fa1952cd58b6ccc08238.jpg",
        "4b6890a49cf0f64452f0065b003521e9.jpg",
        "5118b880b87d768007f12f641968d6ee.jpg",
        "551084a7dfd6d720535c958d061db0c2.jpg",
        "56176ac49782b1a2ea8d33d3c41e26fd.jpg",
        "6d4d8df79b99daee79f0473d3b3fee06.jpg",
        "9b8f7dc6603d2ac5004462176edf084b.jpg",
        "aa915da345bb5913d745b170196dc672.jpg",
        "af01c37c8da6dfd3d0330a1fbdbd761e.jpg",
        "c1f23f217b8da8f3d0583523187ba486.jpg",
        "d2a27d435abe0d9fd75eccfbeb4f9eb1.jpg",
        "d35faf4c47f312f0c0ea3e636a2f6a43.jpg",
        "download (2).png",
        "download (3).png",
        "download (5).png",
        "download.png",
        "e30935609ccc365b82aaf24914708c2b.jpg",
        "e3ded39ecf73129b0137f2b8c0599293.jpg",
        "f473af62bf608409ecda7a0844c3dc00.jpg",
        "f98c75359b3aab99ec29651b703df9b9.jpg"
    ];

    const slots = document.querySelectorAll('.doodle-slot');
    slots.forEach((slot, index) => {
        if (index < stickerList.length) {
            const img = document.createElement('img');
            img.src = `images/${stickerList[index]}`;
            img.className = 'sticker';
            
            // Random variation
            const rotate = (Math.random() - 0.5) * 20; // -10 to 10 deg
            const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
            img.style.transform = `rotate(${rotate}deg) scale(${scale})`;
            
            slot.appendChild(img);
        }
    });
}

// --- LOVE LOCK ---
let lockOpen = false;
function unlockHeart() {
    if (lockOpen) return;
    lockOpen = true;
    document.getElementById('lockStage').classList.add('unlocked');
    const lockCta = document.getElementById('lockCta');
    if (lockCta) lockCta.style.display = 'none';
    const lockReveal = document.getElementById('lockReveal');
    if (lockReveal) {
        lockReveal.style.maxHeight = '1000px';
        lockReveal.style.opacity = '1';
    }
    launchConfetti(50);
}

// --- CONFETTI ---
function launchConfetti(n = 60) {
    const emojis = ['💍', '🌸', '💛', '✨', '🤍', '💐', '🎊', '💫', '🌺', '❤️'];
    for (let i = 0; i < n; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'conf-piece';
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            el.style.cssText = `left:${Math.random() * 100}vw;font-size:${14 + Math.random() * 14}px;animation-duration:${2 + Math.random() * 3}s`;
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 5000);
        }, i * 35);
    }
}

// Make globally accessible for onClick handlers
window.unlockHeart = unlockHeart;
