// Anniversary Journey - Core Logic
let userData = null;

// Default Data for Testing
const DEFAULT_DATA = {
    names: "Sahil & Priya",
    letter: "Happy Anniversary my pookie! \n\nLooking back at these photos reminds me of how far we've come. Every scroll represents a step we took together. Thank you for being by my side and making every moment feel like a movie. \n\nI love you to the moon and back!",
    signature: "Sahil",
    photos: [
        "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1518199266791-bd004246875d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522673607200-1648832cee98?auto=format&fit=crop&q=80&w=800"
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

    // 3. Inject Photos & Stickers
    const photos = (userData.photos && userData.photos.length) ? userData.photos : DEFAULT_DATA.photos;
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

    photos.forEach((url, i) => {
        const moment = document.createElement('div');
        moment.className = 'photo-moment reveal';
        
        // Random Rotation for Polaroid Feel
        const rot = (Math.random() * 6 - 3).toFixed(1); // -3 to +3 deg
        
        // Pick a random sticker
        const stickerUrl = stickers[i % stickers.length];
        const stickerClass = i % 2 === 0 ? 'sticker-bow' : 'sticker-heart';

        moment.innerHTML = `
            <div class="photo-frame" style="transform: rotate(${rot}deg)">
                <img src="${url}" alt="Memory ${i+1}" loading="lazy">
                <div class="photo-caption">Moment #${i+1}</div>
                <img src="${stickerUrl}" class="sticker ${stickerClass}" alt="sticker">
            </div>
        `;
        container.appendChild(moment);
    });

    // 4. Initialize Scroll Path Animation
    initScrollPath();

    // 5. Wood Background Check (Local & Data)
    const journeySec = document.getElementById('section-journey');
    if (userData.woodBackground) {
        journeySec.style.backgroundImage = `url(${userData.woodBackground})`;
    } else {
        // Check if local wood-board.jpg exists (using an image object to verify)
        const img = new Image();
        img.src = 'assets/wood-board.jpg';
        img.onload = () => journeySec.style.backgroundImage = `url('assets/wood-board.jpg')`;
    }
}

function initScrollPath() {
    gsap.registerPlugin(ScrollTrigger);

    const path = document.querySelector('.main-path');
    const length = 1000; // SVG coordinate units

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
