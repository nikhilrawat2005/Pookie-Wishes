// Anniversary Journey - Core Logic
let userData = null;

// Default Data for Testing
const DEFAULT_DATA = {
    names: "Sahil & Priya",
    letter: "Happy Anniversary my pookie! \n\nLooking back at these photos reminds me of how far we've come. Every scroll represents a step we took together. Thank you for being by my side and making every moment feel like a movie. \n\nI love you to the moon and back!",
    signature: "Sahil",
    photos: [
        "assets/1000121228.jpg.jpeg",
        "assets/1000121229.jpg.jpeg",
        "assets/1000121230.jpg.jpeg",
        "assets/1000121232.jpg.jpeg"
    ],
    song: "Perfect - Ed Sheeran"
};

document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();
    await initExperience();
    initReveals();
});

async function initExperience() {
    // 1. Load User Data
    try {
        const response = await fetch('../../data/user.json');
        userData = await response.json();
    } catch (e) {
        userData = DEFAULT_DATA;
    }

    // 2. Map Data to UI
    document.getElementById('display-names').textContent = userData.names || userData.recipientName || DEFAULT_DATA.names;
    document.getElementById('display-letter').textContent = userData.letter || userData.wishMessage || DEFAULT_DATA.letter;
    document.getElementById('display-signature').textContent = userData.signature || userData.senderName || DEFAULT_DATA.signature;

    // 3. Inject 4 Staggered Moments
    const defaultPhotos = [
        'assets/1000121228.jpg.jpeg',
        'assets/1000121229.jpg.jpeg',
        'assets/1000121230.jpg.jpeg',
        'assets/1000121232.jpg.jpeg'
    ];
    
    const photos = (userData.photos && userData.photos.length >= 4) ? userData.photos : defaultPhotos;
    const container = document.getElementById('photo-container');
    container.innerHTML = '';

    const stickers = [
        'assets/sticker-bow.png',
        'assets/sticker-kitty.png',
        'assets/sticker-cat-couple.png',
        'assets/sticker-love.webp',
        'assets/sticker-heart-kitty.webp',
        'assets/sticker-extra.png'
    ];

    const messages = [
        { title: "The Beginning", body: "Where it all began. The day the stars aligned and our paths finally crossed." },
        { title: "Sweet Days", body: "Every laugh we shared and every date we went on only made us stronger." },
        { title: "My Constant", body: "Through every high and low, you have been my rock and my safest home." },
        { title: "Today & Always", body: "And here we are today, still writing our beautiful forever story together." }
    ];

    photos.slice(0, 4).forEach((url, i) => {
        const moment = document.createElement('div');
        moment.className = 'photo-moment reveal';
        
        // Subtle tilt instead of full rotation
        const rot = (i % 2 === 0 ? '-1' : '1'); 
        
        // One sticker per photo for a cleaner look
        const stick = stickers[i % stickers.length];
        const msg = messages[i] || messages[0];

        moment.innerHTML = `
            <div class="moment-photo-wrap">
                <div class="wood-mount">
                    <div class="photo-frame" style="transform: rotate(${rot}deg)">
                        <img src="${url}" alt="Memory ${i+1}" loading="lazy">
                        <div class="photo-caption">Moment #${i+1}</div>
                        <img src="${stick}" class="sticker sticker-bow" alt="sticker">
                    </div>
                </div>
            </div>
            <div class="moment-text-wrap">
                <div class="text-card">
                    <h3>${msg.title}</h3>
                    <p>${msg.body}</p>
                </div>
            </div>
        `;
        container.appendChild(moment);
    });

    // 4. Initialize Scroll Path Animation & Background Vibe
    initScrollPath();
    spawnFloaters();
}

function spawnFloaters() {
    const container = document.getElementById('bg-floaters');
    if (!container) return;
    const icons = ['❤️', '💖', '✨', '🌟', '🍭', '🌸'];
    
    for (let i = 0; i < 15; i++) {
        const el = document.createElement('div');
        el.className = 'float-el';
        el.textContent = icons[Math.floor(Math.random() * icons.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 100 + 'vh';
        el.style.animationDelay = (Math.random() * 10) + 's';
        el.style.fontSize = (0.5 + Math.random() * 1.5) + 'rem';
        container.appendChild(el);
    }
}

function initScrollPath() {
    gsap.registerPlugin(ScrollTrigger);

    const path = document.querySelector('.main-path');
    if (!path) return;
    
    // Dynamically set path length based on container height
    const track = document.querySelector('.journey-track');
    const length = track.offsetHeight - 200;
    
    // Update SVG path data to match height
    path.setAttribute('d', `M 1 0 L 1 ${length}`);

    gsap.fromTo(path, 
        { strokeDashoffset: length, strokeDasharray: length },
        {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
                trigger: ".journey-track",
                start: "top 20%",
                end: "bottom 80%",
                scrub: 1
            }
        }
    );
}

function startJourney() {
    const intro = document.getElementById('section-intro');
    const journey = document.getElementById('section-journey');

    gsap.to(intro, { 
        duration: 1, 
        opacity: 0, 
        y: -50,
        onComplete: () => {
            intro.classList.remove('active');
            journey.classList.add('active');
            gsap.fromTo(journey, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
            
            // Refresh ScrollTrigger after adding content
            ScrollTrigger.refresh();
        }
    });

    // Start Music if needed
}

function revealLetter() {
    const journey = document.getElementById('section-journey');
    const letter = document.getElementById('section-letter');

    gsap.to(journey, { 
        duration: 1, 
        opacity: 0, 
        scale: 0.9,
        onComplete: () => {
            journey.classList.remove('active');
            letter.classList.add('active');
            gsap.fromTo(letter, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1 });
            window.scrollTo(0, 0);
        }
    });
}

function showEnding() {
    const letter = document.getElementById('section-letter');
    const ending = document.getElementById('section-ending');

    gsap.to(letter, { 
        duration: 1, 
        opacity: 0, 
        x: -100,
        onComplete: () => {
            letter.classList.remove('active');
            ending.classList.add('active');
            gsap.fromTo(ending, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 1 });
        }
    });
}

function restartJourney() {
    location.reload(); // Simplest way to reset everything
}

// Reveal Observer for Scroll Animations
function initReveals() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('on');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Smooth scrolling helper (optional enhancement)
document.addEventListener('scroll', () => {
    // We could add parallax effects here if needed
});
