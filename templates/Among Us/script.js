let currentSceneIndex = 1;
const totalScenes = 7;
let voteInterval = null;

// We will inject the names dynamically after fetching data.json
let targetName = 'Crewmate';

function initSetup() {
    const loaderBar = document.querySelector('.loader-bar');
    const cta = document.querySelector('.cta-setup');
    let progress = 0;
    
    // Optimize: Reduce initial delay for better snappiness
    setTimeout(() => {
        const interval = setInterval(() => {
            progress += 2; // Speed up progress significantly
            if(loaderBar) loaderBar.style.width = `${progress}%`;
            
            if(progress >= 100) {
                clearInterval(interval);
                if(cta) cta.classList.add('visible');
            }
        }, 30); // ~1.5s total progress
    }, 2800); // Reduce initial 4.5s wait to 2.8s
}

function startVoteCounter() {
    const voteText = document.getElementById('vote-counter-text');
    if (!voteText) return;
    
    let dots = 0;
    voteInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        const dotsStr = ".".repeat(dots);
        voteText.textContent = `Voting in progress${dotsStr}`;
    }, 500);
}

function stopVoteCounter() {
    if (voteInterval) clearInterval(voteInterval);
}


// --- FAKE CONTROL LOGIC ---
function staySilent() {
    const btnSilent = document.getElementById('btn-silent');
    const btnDefend = document.getElementById('btn-defend');
    if(btnSilent) btnSilent.disabled = true;
    if(btnDefend) btnDefend.disabled = true;
    startTensionTimer();
}

function defendYourself() {
    const btnSilent = document.getElementById('btn-silent');
    const btnDefend = document.getElementById('btn-defend');
    const msg = document.getElementById('too-late-msg');
    
    if(btnSilent) btnSilent.disabled = true;
    if(btnDefend) btnDefend.disabled = true;
    if(msg) msg.classList.remove('hidden');
    
    setTimeout(() => {
        startTensionTimer();
    }, 1500); // 1.5s delay after reading message
}

function startTensionTimer() {
    stopVoteCounter();
    const overlay = document.getElementById('tension-overlay');
    const numberEl = document.getElementById('countdown-number');
    if(!overlay || !numberEl) { nextScene(); return; }
    
    overlay.classList.add('visible');
    
    let count = 3;
    numberEl.textContent = count;
    
    // Countdown immediately from 3 -> 2 -> 1 over 3 intervals
    const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
            numberEl.textContent = count;
            // Pop animation manually via scaling toggle
            numberEl.style.transform = 'scale(1.2)';
            setTimeout(() => numberEl.style.transform = 'scale(1)', 150);
        } else {
            clearInterval(countInterval);
            overlay.classList.remove('visible');
            nextScene(); 
        }
    }, 1000);
}


function nextScene() {
    const currentScene = document.getElementById(`scene-${currentSceneIndex}`);
    if (currentScene) {
        currentScene.classList.remove('active');
    }
    
    currentSceneIndex++;
    if (currentSceneIndex > totalScenes) return;

    const nextSceneEl = document.getElementById(`scene-${currentSceneIndex}`);
    if (nextSceneEl) {
        nextSceneEl.classList.add('active');
        handleSceneSpecifics(currentSceneIndex);
    }
}

function handleSceneSpecifics(index) {
    if (index === 3) {
        startVoteCounter();
    } else {
        stopVoteCounter(); // backup stop
    }

    if (index === 4) {
        const line1 = document.getElementById('eject-text-1');
        const line2 = document.getElementById('eject-text-2');
        const text1Output = `${targetName} has been ejected.`;
        const text2Output = `${targetName} was NOT the impostor.`;

        // Start typing after a short delay
        setTimeout(() => {
            typeWriter(line1, text1Output, 50, () => {
                setTimeout(() => {
                    typeWriter(line2, text2Output, 50, () => {
                        // After line 2 finishes, wait 2.5 seconds then transition
                        setTimeout(() => {
                            nextScene();
                        }, 2500);
                    });
                }, 800);
            });
        }, 800);
    }
    
    if (index === 5) {
        // Scan Result auto-progress
        setTimeout(() => {
            nextScene(); // To Reveal Scene 6
        }, 7000); // 7s allows time for reading stats
    }
}

function shareUrl() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert("Link copied! Task remaining: Send to your friend.");
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}

let setupInitialized = false;

async function loadDataAndInitialize() {
    if (setupInitialized) return;
    setupInitialized = true;
    
    try {
        if (window.getPookieData) {
            const pData = await window.getPookieData('among-us');
            if (pData && pData.targetName) {
                targetName = pData.targetName;
                document.querySelectorAll('.inject-name').forEach(el => el.textContent = targetName);
                initSetup();
                return;
            }
        }
        
        // Fallback: local data.json
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            targetName = data.targetName || 'Crewmate';
        }
    } catch (err) {
        console.error('Data load error:', err);
    } finally {
        document.querySelectorAll('.inject-name').forEach(el => el.textContent = targetName);
        initSetup();
    }
}

document.addEventListener("DOMContentLoaded", loadDataAndInitialize);
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => {
        if (!setupInitialized && currentSceneIndex === 1) { loadDataAndInitialize(); }
    }, 100);
}

function typeWriter(element, text, speed, callback) {
    if(!element) return;
    let i = 0;
    element.textContent = "";
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}
