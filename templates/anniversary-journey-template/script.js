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
        'assets/11289829e92f9243e9d2b959ab2f3623.jpg',
        'assets/2e310d8c00d8ebc6465efe3ab9e1ffad.jpg',
        'assets/40fc469d09c8f18f1033068caf6745fd.jpg',
        'assets/936161586f96a5da464d1a67da62bb02.jpg',
        'assets/9cb65cee24e5e5ab12abb85675752e38.jpg',
        'assets/9dbd2fc1b9e194daa8e8c4b8d5020658.jpg',
        'assets/bf371a9022ef74145a505937ee051c48.jpg',
        'assets/c0fa93882918f515144cfaa5d20f8a17.jpg',
        'assets/cda44050-2819-4986-b6c8-05c59c7f8e57.webp',
        'assets/download (1).png',
        'assets/eyes.gif',
        'assets/spidy-kitty.png',
        'assets/sticker-bow.png',
        'assets/sticker-cat-couple.png',
        'assets/sticker-heart-kitty.webp',
        'assets/sticker-kitty.png'
    ];


    const messages = [
        { 
            title: "The Beginning of Us ✨", 
            body: "Thinking back to the very first moment we met, I never realized I was looking at my entire future. It wasn’t just a meeting; it was the start of a beautiful symphony that only we can hear. You walked into my life and suddenly everything made sense—the songs, the poems, the stars. You are the best thing that ever happened to me, and I’ll cherish this 'beginning' for the rest of my life. Every time I see this photo, I'm reminded of that magical spark that changed my world forever. I love you to the moon and back! 🧿💖" 
        },
        { 
            title: "Every Laugh & Date 🍭", 
            body: "From our nervous first dates to the countless hours we spent laughing until our stomachs hurt, every second with you has been a treasure. It’s the way you look at me when you think I’m not watching, and the way you hold my hand like you’re never letting go. Thank you for making even the most ordinary days feel like a scene from a movie. You are my constant source of joy and my favorite adventure. Looking at these memories makes me realize how lucky I am to have you as my partner in crime. Just us against the world! 🍬🌸" 
        },
        { 
            title: "My Rock & My Home 🏡", 
            body: "Life isn't always easy, but having you by my side makes every challenge feel small. You’ve been my rock through every storm and my biggest cheerleader in every success. In your arms, I found a home that I never want to leave. Thank you for loving me at my best and especially when I wasn't at my easiest. You are the peace in my chaos and the love of my life. This journey with you is my most sacred blessing, and I'm so grateful for every high and low we've weathered together. ⚓❤️🌟" 
        },
        { 
            title: "Today & Forever ♾️", 
            body: "And here we are today, stronger and more in love than ever before. This journey has been more beautiful than I ever dreamed possible, and yet I feel like we’re only just getting started. I promise to keep choosing you, day after day, year after year. Here’s to many more anniversaries, more laughs, and a lifetime of 'us'. I love you more than words could ever describe, my pookie. You are my forever, my always, and my everything. Let's make the future even more magical than our past! 💍🧸✨" 
        }
    ];


    photos.slice(0, 4).forEach((url, i) => {
        const moment = document.createElement('div');
        moment.className = 'photo-moment reveal';
        
        // Subtle tilt
        const rot = (i % 2 === 0 ? '-1' : '1'); 
        const msg = messages[i] || messages[0];

        moment.innerHTML = `
            <div class="moment-photo-wrap">
                <div class="wood-mount">
                    <div class="photo-frame" style="transform: rotate(${rot}deg)">
                        <img src="${url}" alt="Memory ${i+1}" loading="lazy">
                        <div class="photo-caption">Moment #${i+1}</div>
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


    // 4. Initialize Scroll Path Animation & Visuals
    initScrollPath();
    initDoodleEngine();
}

function initDoodleEngine() {
    const container = document.getElementById('decor-container');
    if (!container) return;
    
    const stickers = [
        'assets/11289829e92f9243e9d2b959ab2f3623.jpg',
        'assets/2e310d8c00d8ebc6465efe3ab9e1ffad.jpg',
        'assets/40fc469d09c8f18f1033068caf6745fd.jpg',
        'assets/936161586f96a5da464d1a67da62bb02.jpg',
        'assets/9cb65cee24e5e5ab12abb85675752e38.jpg',
        'assets/9dbd2fc1b9e194daa8e8c4b8d5020658.jpg',
        'assets/bf371a9022ef74145a505937ee051c48.jpg',
        'assets/c0fa93882918f515144cfaa5d20f8a17.jpg',
        'assets/cda44050-2819-4986-b6c8-05c59c7f8e57.webp',
        'assets/download (1).png',
        'assets/spidy-kitty.png',
        'assets/sticker-kitty.png',
        'assets/sticker-cat-couple.png'
    ];

    const icons = ['❤️', '💖', '✨', '🌟', '🍭', '🌸', '🧿'];

    // 1. Background "Faded Memories" (Using user photos as watermarks in blank spaces)
    const bgPhotos = (userData && userData.photos) ? userData.photos : [
        'assets/1000121228.jpg.jpeg',
        'assets/1000121229.jpg.jpeg',
        'assets/1000121230.jpg.jpeg',
        'assets/1000121232.jpg.jpeg'
    ];

    bgPhotos.forEach((url, i) => {
        spawnDecor(url, {
            top: (20 + (i * 25)) + 'vh',
            left: (i % 2 === 0 ? '5%' : '75%'),
            layer: 'layer-deep',
            size: 'size-lg',
            isPhoto: true
        });
    });

    // 2. Viewport Corner Accents
    const corners = [
        { top: '2vh', left: '2%' }, { top: '2vh', right: '2%' },
        { top: '95vh', left: '2%' }, { top: '95vh', right: '2%' }
    ];

    
    corners.forEach(pos => {
        spawnDecor(stickers[Math.floor(Math.random() * stickers.length)], {
            ...pos,
            layer: 'layer-mid',
            size: 'size-lg'
        });
    });

    // 3. Anchor to Content Moments (Strict Left-Right Pattern)
    const moments = document.querySelectorAll('.photo-moment');
    moments.forEach((m, idx) => {
        const yBase = m.offsetTop;
        const isLeftMoment = (idx % 2 === 0); // Photo is left, Text is right

        // Add clusters around the MOMENT (Left then Right)
        for(let i=0; i<6; i++) {
            const isSticker = Math.random() > 0.4;
            const sideOffset = isLeftMoment ? (Math.random() * 25) : (75 + Math.random() * 15);
            
            spawnDecor(isSticker ? stickers[Math.floor(Math.random() * stickers.length)] : icons[Math.floor(Math.random() * icons.length)], {
                top: yBase + (Math.random() * 600 - 300) + 'px',
                left: sideOffset + '%',
                layer: i < 2 ? 'layer-mid' : 'layer-deep',
                size: i % 2 === 0 ? 'size-lg' : 'size-md',
                isIcon: !isSticker
            });
        }
    });


    // 3. Random Sparkles (Fills the 'off-white' gaps)
    for(let i=0; i<15; i++) {
        spawnDecor(icons[Math.floor(Math.random() * icons.length)], {
            top: (Math.random() * 100) + '%',
            left: (Math.random() * 100) + '%',
            layer: 'layer-accent',
            size: 'size-sm',
            isIcon: true
        });
    }

    // Initialize Parallax
    initParallax();
}

function spawnDecor(content, config) {
    const container = document.getElementById('decor-container');
    const el = document.createElement('div');
    el.className = `static-decor ${config.layer} ${config.size} ${config.isPhoto ? 'bg-photo-decor' : ''}`;
    
    if (config.isIcon) {
        el.textContent = content;
    } else {
        const img = document.createElement('img');
        img.src = content;
        el.appendChild(img);
    }


    if (config.top) el.style.top = config.top;
    if (config.left) el.style.left = config.left;
    if (config.right) el.style.right = config.right;
    if (config.bottom) el.style.bottom = config.bottom;
    
    el.style.transform = `rotate(${Math.random() * 60 - 30}deg)`;
    container.appendChild(el);
}

function initParallax() {
    gsap.utils.toArray('.static-decor').forEach(decor => {
        // Deep layer moves slower for more perceived distance
        const movement = decor.classList.contains('layer-deep') ? -150 : -300;
        
        gsap.to(decor, {
            y: movement,
            ease: "none",
            scrollTrigger: {
                trigger: decor,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
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
