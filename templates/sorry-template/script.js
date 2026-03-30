// Configuration and State
let userData = null;
let currentScene = 0;
let audio = new Audio();
let stampUsed = false;

// DOM Elements
const app = document.getElementById('scene-container');
const loading = document.getElementById('loading');
const nav = document.getElementById('global-nav');
const btnNext = document.getElementById('btn-next');
const btnBack = document.getElementById('btn-back');
const cursor = document.getElementById('custom-cursor');

// Init
async function init() {
    try {
        if (window.getPookieData) {
            userData = await window.getPookieData('sorry');
        }
        
        // Fallback or if no ?id provided
        if (!userData) {
            const response = await fetch('user.json');
            userData = await response.json();
        }
        
        lucide.createIcons();
        
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.remove();
                showScene(0);
            }, 1000);
        }, 2000);

        setupParticles();
        setupCursor();
        setupGlobalListeners();
    } catch (err) {
        console.error("Failed to load user data:", err);
    }
}

// Particle Background logic
function setupParticles() {
    const container = document.getElementById('particle-container');
    const colors = ['#FFB7C5', '#FFD1DC', '#FF6B81'];
    
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'heart-particle';
        p.innerHTML = '<i data-lucide="heart" class="w-4 h-4 fill-current"></i>';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.top = Math.random() * 100 + 'vh';
        p.style.fontSize = (Math.random() * 10 + 10) + 'px';
        p.style.color = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(p);
        
        gsap.to(p, {
            y: "-=100",
            x: "+=" + (Math.random() * 40 - 20),
            rotation: Math.random() * 360,
            duration: 5 + Math.random() * 10,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
    lucide.createIcons({ container });
}

// Custom Cursor logic
function setupCursor() {
    window.addEventListener('mousemove', (e) => {
        // Use simpler animation for cursor to reduce JS overhead
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

function showScene(index) {
    console.log(`[Nav] moving from ${currentScene} to ${index}`);
    currentScene = index;
    
    btnNext.innerHTML = '<span class="tracking-tighter text-lg uppercase">Next</span> <i data-lucide="arrow-right" class="w-6 h-6"></i>';
    btnNext.disabled = false;
    btnNext.style.opacity = "1";
    btnNext.style.pointerEvents = "auto";
    
    btnNext.onclick = () => { if (currentScene < 5) showScene(currentScene + 1); };
    btnBack.onclick = () => { if (currentScene > 0) showScene(currentScene - 1); };
    
    if ([1, 4, 5].includes(index)) {
        btnNext.style.display = 'none';
    } else {
        btnNext.style.display = 'flex';
    }
    
    // Reset stamp state if re-entering voucher scene
    if (index === 4) stampUsed = false;
    
    if (index !== 4 && audio) {
        audio.pause();
    }

    lucide.createIcons({ container: btnNext });

    const children = Array.from(app.children);
    if (children.length > 0) {
        gsap.to(children, {
            opacity: 0,
            y: -30,
            duration: 0.3,
            stagger: 0.05,
            onComplete: () => {
                renderNewContent(index);
            }
        });
    } else {
        renderNewContent(index);
    }
}

function renderNewContent(index) {
    app.innerHTML = '';
    renderScene(index);
    updateProgressBar(index);
    
    const newChildren = Array.from(app.children);
    gsap.fromTo(newChildren, 
        { opacity: 0, y: 30, scale: 0.95 },
        { 
            opacity: 1, 
            y: 0, 
            scale: 1, 
            duration: 0.5, 
            stagger: 0.1, 
            ease: "power2.out", 
            onComplete: () => {
                console.log(`[Nav] arrived at scene ${index}`);
            }
        }
    );
    
    updateNav(index);
}

function updateProgressBar(index) {
    const bar = document.getElementById('progress-bar-el');
    const progress = ((index + 1) / 6) * 100;
    gsap.to(bar, { width: `${progress}%`, duration: 1, ease: "power2.out" });
}

function updateNav(index) {
    gsap.to(nav, { opacity: (index === 0 || index === 1) ? 1 : 1, duration: 1 });
    btnBack.style.visibility = (index === 0 || index === 1) ? "hidden" : "visible";
}

function renderScene(index) {
    const scenes = [
        renderWelcome,
        renderGame,
        renderSuccess,
        renderLetter,
        renderCards,
        renderMusic
    ];
    scenes[index]();
    lucide.createIcons();
}

function renderWelcome() {
    app.innerHTML = `
        <div class="space-y-8 py-6 scale-[var(--card-scale)]">
            <div class="relative inline-block">
                <span class="absolute -top-10 -left-10 text-4xl animate-bounce">✨</span>
                <h2 class="text-secondary font-cursive text-3xl mb-2 opacity-0 welcome-fade-in">${userData.welcomeTitle}</h2>
            </div>
            <div class="relative group">
                <h1 class="text-6xl md:text-8xl font-black text-dark tracking-tighter leading-none mb-4 uppercase italic">
                    I am <span class="text-secondary drop-shadow-xl">SORRY</span>
                </h1>
                <div class="h-2 w-24 bg-secondary mx-auto rounded-full group-hover:w-48 transition-all duration-500"></div>
            </div>
            <p class="text-gray-500 max-w-sm mx-auto text-lg leading-relaxed handwriting font-medium">
                ${userData.welcomeSubText}
            </p>
            <div class="relative mt-4">
                <img src="./sorry image/gaOmpX3C9ZA5YyhXk0v6OGr88gx8FMbYe9n2cDwrL25_LPAGdibjP5YKGhOoVM_cLq7VFVThqCPzw7SsIn6s2ntI3959A1owHPa33jIdF3g.jpg" class="w-56 h-56 object-cover mx-auto rounded-3xl shadow-2xl animate-float border-8 border-white">
                <div class="absolute -top-4 -right-4 bg-secondary text-white p-3 rounded-full shadow-lg rotate-12">
                    <i data-lucide="heart" class="w-6 h-6 fill-current"></i>
                </div>
            </div>
        </div>
    `;
    gsap.from('.welcome-fade-in', { opacity: 0, y: 20, duration: 1, delay: 0.5 });
}

function renderGame() {
    app.innerHTML = `
        <div class="space-y-6 w-full scale-[var(--card-scale)]">
            <h2 class="text-dark font-bold text-3xl">Complete the Pattern ❤️</h2>
            <div id="game-grid" class="grid grid-cols-3 gap-3 max-w-[300px] mx-auto bg-white/20 p-4 rounded-3xl shadow-inner border border-white/40">
                ${Array(9).fill(0).map((_, i) => {
                    let content = '';
                    let extraClass = '';
                    if (i === 0 || i === 8) {
                        content = '<i data-lucide="heart" class="text-secondary fill-secondary w-10 h-10"></i>';
                        extraClass = 'is-heart';
                    } else if (i === 4) {
                        content = '';
                        extraClass = 'is-empty cursor-pointer hover:bg-white/80';
                    } else {
                        content = '<i data-lucide="x" class="text-gray-300 w-8 h-8"></i>';
                        extraClass = 'is-x';
                    }
                    return `
                        <div class="game-cell w-16 h-16 md:w-20 md:h-20 bg-white/60 rounded-2xl ${extraClass}" ${i === 4 ? 'onclick="handleCellClick(this)"' : ''}>
                            ${content}
                        </div>
                    `;
                }).join('')}
            </div>
            <p id="game-tip" class="text-secondary font-medium px-4 leading-relaxed">Now it's your turn to fill the heart in this game okaay</p>
            <div class="flex justify-center gap-4 mt-4">
                <img src="./sorry image/f1186fc3-ffe4-4895-9ed2-2766500c2e19.webp" class="w-12 h-12 rounded-xl shadow-md rotate-[-12deg]">
                <img src="./sorry image/9b6f5dbb-20d9-4434-bac2-bfc09301bc80.webp" class="w-12 h-12 rounded-xl shadow-md rotate-[12deg]">
            </div>
        </div>
    `;
}

window.handleCellClick = (el) => {
    if (el.classList.contains('is-empty')) {
        el.innerHTML = '<i data-lucide="heart" class="text-secondary fill-secondary w-10 h-10"></i>';
        el.classList.remove('is-empty');
        el.classList.add('is-heart');
        if (window.lucide) window.lucide.createIcons({ container: el });

        gsap.from(el.querySelector('i'), { scale: 0, rotation: 180, duration: 0.5, ease: "back.out" });
        document.querySelectorAll('.game-cell.is-heart i').forEach(h => h.classList.add('heart-glow'));

        const tip = document.getElementById('game-tip');
        tip.innerHTML = "You won! My heart is complete! ❤️";
        gsap.to(tip, { scale: 1.2, color: "#FF6B81", duration: 0.5, yoyo: true, repeat: 1 });

        setTimeout(() => showScene(2, true), 1500); 
    }
};

function renderSuccess() {
    app.innerHTML = `
        <div class="space-y-8 flex flex-col items-center py-6 scale-[var(--card-scale)]">
            <div class="relative">
                <div class="absolute inset-0 bg-secondary blur-[100px] opacity-30 animate-pulse"></div>
                <div class="relative z-10">
                    <img src="./sorry image/005b68c3-bce1-4310-9a6c-acc90ce77199.webp" class="w-48 h-48 object-cover rounded-[40px] shadow-2xl border-4 border-white rotate-[-3deg]">
                    <img src="./sorry image/3d743400-810b-4249-846c-0b21541281e9.webp" class="absolute -bottom-6 -left-6 w-20 h-20 animate-bounce">
                </div>
                <div class="absolute -top-5 -right-5 transform rotate-12 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-secondary/20 font-black text-secondary">WON!</div>
            </div>
            <div class="space-y-2">
                <h1 class="text-5xl font-cursive text-dark">❤️ You won my heart! ❤️</h1>
                <p class="text-gray-400 italic text-lg uppercase tracking-widest text-xs">I'm so lucky to have you...</p>
            </div>
        </div>
    `;
    launchConfetti();
}

function launchConfetti() {
    const container = document.getElementById('scene-wrapper');
    for(let i=0; i<40; i++) {
        setTimeout(() => {
            const h = document.createElement('div');
            h.innerHTML = '<i data-lucide="heart" class="w-6 h-6 fill-current"></i>';
            h.classList.add('confetti-heart');
            h.style.left = Math.random() * 100 + '%';
            h.style.top = '-50px';
            h.style.color = ['#FFB7C5', '#FF6B81', '#FFD1DC'][Math.floor(Math.random() * 3)];
            container.appendChild(h);
            lucide.createIcons({ container: h });
            gsap.to(h, { y: container.offsetHeight + 100, x: (Math.random() - 0.5) * 400, rotation: Math.random() * 720, duration: 2 + Math.random() * 3, ease: "power1.out", onComplete: () => h.remove() });
        }, i * 100);
    }
}

function renderLetter() {
    app.innerHTML = `
        <div class="flex flex-col items-center justify-center p-4 w-full scale-[var(--card-scale)]">
            <div class="mb-6 text-center">
                <h2 class="text-secondary font-black text-3xl tracking-tighter">A Private Letter</h2>
                <p class="text-gray-400 text-[10px] uppercase tracking-widest mt-1">Tap the heart to open 🩷</p>
            </div>
            <div id="envelope" class="envelope-wrapper relative group" onclick="openEnvelope()">
                <div class="envelope-flap flex items-center justify-center">
                    <div class="wax-seal w-20 h-20 bg-secondary rounded-full flex items-center justify-center shadow-xl border-4 border-white z-20 group-hover:scale-110 transition-transform">
                        <img src="./sorry image/738ffeb8-05d8-45d7-831e-4a849554b810.webp" class="w-12 h-12 rounded-full object-cover">
                    </div>
                </div>
                <div class="envelope-letter shadow-2xl rounded-xl">
                    <div class="letter-paper h-full rounded-xl">
                        <div class="flex justify-between items-start mb-6 border-b-2 border-accent pb-4">
                            <h3 class="text-secondary font-black text-2xl">${userData.letterTitle}</h3>
                            <div class="relative">
                                <img src="./sorry image/kitty.jpg" class="w-12 h-12 rounded-lg rotate-12 border-2 border-accent">
                                <img src="./sorry image/280a31ad-3ac2-46dc-a266-8974d5160df9.webp" class="absolute -top-2 -right-2 w-6 h-6 rotate-12">
                            </div>
                        </div>
                        <div class="text-left text-dark space-y-4 handwriting text-xl leading-relaxed">
                            <p>${userData.letterBody.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>
                        </div>
                        <div class="mt-12 text-right border-t border-accent pt-6">
                            <p class="font-cursive text-secondary text-3xl">${userData.senderName} 🩷</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.openEnvelope = () => {
    const env = document.getElementById('envelope');
    env.classList.toggle('open');
    // We keep the nav but user can use the internal Next button
};

// --------------------- VOUCHER SCENE (RESTORED) ---------------------
function renderCards() {
    app.innerHTML = `
        <div class="space-y-6 w-full max-w-md py-4 scale-[var(--card-scale)]">
            <div class="text-center">
                <h2 class="text-dark font-black text-4xl mb-1 tracking-tighter italic uppercase">${userData.specialCardTitle}</h2>
                <p class="text-secondary font-medium tracking-[0.2em] text-[10px] uppercase">Official Pookie Voucher</p>
            </div>
            
            <div id="voucher" class="voucher-check relative group hover:rotate-1 transition-transform duration-500">
                <div class="flex justify-between items-center mb-6">
                    <div class="flex flex-col">
                        <span class="text-[8px] font-black text-gray-300 uppercase tracking-widest">Serial No. PW-2024</span>
                        <h3 class="text-secondary font-black text-2xl tracking-tighter italic">Voucher Check</h3>
                    </div>
                </div>

                <div class="space-y-4 text-left border-y-2 border-dashed border-accent py-6 my-6 relative">
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-gray-400 uppercase">Pay To The Order Of:</span>
                        <span class="text-lg font-black text-dark handwriting">${userData.recipientName} ❤️</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-xs font-bold text-gray-400 uppercase">Valid Until:</span>
                        <span class="text-lg font-black text-dark tracking-tighter italic">LIFE LONG ✨</span>
                    </div>
                </div>

                <div class="flex justify-between items-end mt-6">
                    <div class="text-left">
                        <p class="text-[8px] font-bold text-gray-300 uppercase">Authorized Signature</p>
                        <p class="font-cursive text-secondary text-xl border-b-2 border-accent px-2">${userData.senderName} 🩷</p>
                    </div>
                    <div class="voucher-verified-stamp">Verified By<br>Bhondu Pookie 🐾</div>
                </div>

                <!-- Floating Sticker -->
                <img src="./sorry image/cda44050-2819-4986-b6c8-05c59c7f8e57.webp" class="absolute top-2 right-2 w-10 opacity-40 rotate-[15deg]">
            </div>

            <div id="voucher-controls" class="flex flex-col gap-3">
                <button id="stamp-btn" class="bg-dark text-white w-full py-5 rounded-3xl flex items-center justify-center gap-3 shadow-2xl transform hover:-translate-y-1 active:scale-95 transition-all group overflow-hidden relative">
                    <div class="absolute inset-0 bg-secondary translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    <div class="relative z-10 flex items-center justify-center gap-3">
                        <i data-lucide="sparkles" class="w-6 h-6 text-yellow-400 group-hover:rotate-12 transition-transform"></i>
                        <span class="font-black text-lg uppercase tracking-wider text-white">Stamp My Voucher</span>
                    </div>
                </button>
            </div>
        </div>
    `;

    const stampBtn = document.getElementById('stamp-btn');
    if (stampBtn) {
        stampBtn.onclick = handleStamp;
    }
}

window.handleStamp = () => {
    if (stampUsed) return;
    stampUsed = true;

    const stampEl = document.querySelector('.voucher-verified-stamp');
    if (!stampEl) return;

    gsap.fromTo(stampEl, 
        { scale: 2, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(3)" }
    );
    
    launchConfetti();

    btnNext.style.display = 'flex';
    btnNext.onclick = () => showScene(5);
    gsap.fromTo(btnNext, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5 });
};

function renderMusic() {
    const songs = userData.songs;
    app.innerHTML = `
        <div class="space-y-6 w-full max-w-sm py-2 scale-[var(--card-scale)] flex flex-col items-center justify-center">
            <div class="text-center">
                <h2 class="text-dark font-black text-3xl mb-1 tracking-tighter italic uppercase">The Heart Player</h2>
            </div>
            <div id="player" class="bg-white rounded-[40px] p-6 shadow-2xl space-y-6 relative overflow-hidden border border-accent/20">
                <div id="album-art-container" class="w-48 h-48 mx-auto rounded-[30px] shadow-2xl ring-1 ring-black/5 overflow-hidden transform transition-all duration-700 hover:scale-105 relative group">
                    <img id="album-art" src="./sorry image/ac221a99-510d-43d6-b91b-2a432b0a602f.webp" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div class="visualizer">${Array(5).fill(0).map(() => '<div class="v-bar"></div>').join('')}</div>
                    </div>
                </div>
                <div class="text-center space-y-1">
                    <h3 id="song-title" class="text-2xl font-black text-dark truncate px-2 tracking-tighter">${songs[0].title}</h3>
                    <p id="song-artist" class="text-secondary font-bold uppercase text-[8px] tracking-[0.4em]">${songs[0].artist}</p>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center gap-4">
                        <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                            <div id="p-bar" class="absolute left-0 top-0 h-full bg-secondary w-0 transition-all duration-100"></div>
                        </div>
                    </div>
                    <div class="flex items-center justify-around">
                        <button id="prev-song" class="text-gray-300 hover:text-secondary transform hover:scale-125 transition-all"><i data-lucide="skip-back" class="w-6 h-6"></i></button>
                        <button id="play-song" class="bg-secondary text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-90 transition-all"><i data-lucide="play" class="fill-current ml-1 w-6 h-6"></i></button>
                        <button id="next-song" class="text-gray-300 hover:text-secondary transform hover:scale-125 transition-all"><i data-lucide="skip-forward" class="w-6 h-6"></i></button>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 w-full max-w-[280px] mt-4">
                <button id="btn-forgive" class="bg-secondary text-white w-full py-3 rounded-xl font-black text-base shadow-xl hover:scale-105 transition-all outline-none">
                    FORGIVE ME? 🩷
                </button>
                <button id="btn-replay" class="bg-dark text-white w-full py-3 rounded-xl font-black text-base shadow-xl hover:scale-105 transition-all outline-none flex items-center justify-center gap-2">
                    <i data-lucide="refresh-cw" class="w-4 h-4"></i> WATCH IT AGAIN
                </button>
            </div>
            <div class="mt-4 animate-float">
                <img src="./sorry image/hello-kitty-i-love-you.gif" class="w-16 h-16 object-contain opacity-60">
            </div>
        </div>
    `;
    setupMusicLogic(songs);
}
 
function setupMusicLogic(songs) {
    let currentIdx = 0;
    let isPlaying = false;
    
    const art = document.getElementById('album-art');
    const title = document.getElementById('song-title');
    const artist = document.getElementById('song-artist');
    const playBtn = document.getElementById('play-song');
    const pBar = document.getElementById('p-bar');
    const visualizer = document.querySelectorAll('.v-bar');
    
    const toggleVisualizer = (play) => visualizer.forEach(v => v.style.animationPlayState = play ? 'running' : 'paused');
    toggleVisualizer(false);

    const updateSong = (idx) => {
        currentIdx = idx;
        audio.pause();
        audio.src = songs[idx].url || `${songs[idx].title}.mp3`;
        
        gsap.to('#album-art-container', { scale: 0.9, opacity: 0.5, duration: 0.3, onComplete: () => {
            title.innerText = songs[idx].title;
            artist.innerText = songs[idx].artist;
            if (songs[idx].cover) {
                art.src = songs[idx].cover.includes('/') ? songs[idx].cover : `./sorry image/${songs[idx].cover}`;
            }
            pBar.style.width = '0%';
            isPlaying = false;
            playBtn.innerHTML = '<i data-lucide="play" class="fill-current ml-1 w-6 h-6"></i>';
            lucide.createIcons({ container: playBtn });
            toggleVisualizer(false);
            gsap.to('#album-art-container', { scale: 1, opacity: 1, duration: 0.5, ease: "back.out" });
        }});
    };

    const initialCover = songs[0].cover;
    if (initialCover) {
        art.src = initialCover.includes('/') ? initialCover : `./sorry image/${initialCover}`;
    }
    audio.src = songs[0].url || `${songs[0].title}.mp3`;

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const pct = (audio.currentTime / audio.duration) * 100;
            pBar.style.width = `${pct}%`;
        }
    });

    audio.addEventListener('ended', () => {
        updateSong((currentIdx + 1) % songs.length);
        audio.play();
        isPlaying = true;
        playBtn.innerHTML = '<i data-lucide="pause" class="fill-current w-6 h-6"></i>';
        lucide.createIcons({ container: playBtn });
        toggleVisualizer(true);
    });

    document.getElementById('next-song').onclick = () => updateSong((currentIdx + 1) % songs.length);
    document.getElementById('prev-song').onclick = () => updateSong((currentIdx - 1 + songs.length) % songs.length);
    
    playBtn.onclick = () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            audio.play().catch(e => console.log("Audio play blocked"));
            playBtn.innerHTML = '<i data-lucide="pause" class="fill-current w-6 h-6"></i>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<i data-lucide="play" class="fill-current ml-1 w-6 h-6"></i>';
        }
        lucide.createIcons({ container: playBtn });
        toggleVisualizer(isPlaying);
    };

    document.getElementById('btn-forgive').onclick = () => {
        launchConfetti();
        alert("Yay! I love you so much! 🩷 Best pookie forever!");
    };
    
    document.getElementById('btn-replay').onclick = () => {
        showScene(0, true);
    };
}

function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');
        console.log(`[GlobalClick] action: ${action}`);
        if (action === 'reveal') {
            showScene(3);
        }
    });
}

init();