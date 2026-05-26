/* ===== SCROLL REVEAL ===== */
const srObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.sr').forEach(el => srObserver.observe(el));

/* ===== GLITCH ON CHAOS CELLS ===== */
document.querySelectorAll('.chaos-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    const img = card.querySelector('img');
    let ticks = 0;
    const id = setInterval(() => {
      const x = (Math.random() - 0.5) * 8;
      const y = (Math.random() - 0.5) * 6;
      const hue = 310 + Math.random() * 40;
      img.style.transform = `scale(1.07) translate(${x}px,${y}px) rotate(${(Math.random()-0.5)*1.5}deg)`;
      img.style.filter = `contrast(1.45) saturate(1.6) hue-rotate(${hue}deg)`;
      ticks++;
      if (ticks > 6) {
        clearInterval(id);
        img.style.transform = 'scale(1.07)';
        img.style.filter = 'contrast(1.4) saturate(1.5) hue-rotate(320deg)';
      }
    }, 55);
  });
  card.addEventListener('mouseleave', () => {
    const img = card.querySelector('img');
    img.style.transform = '';
    img.style.filter = '';
  });
});

/* ===== FLIP CARDS — CLICK TOGGLE ===== */
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
  });
});

/* ===== STAGGERED MSG THREAD ANIMATION ===== */
function animateMsgThread(thread) {
  const msgs = thread.querySelectorAll('.msg, .msg-time');
  msgs.forEach((msg, i) => {
    msg.style.opacity = '0';
    msg.style.animation = 'none';
    // Force reflow
    void msg.offsetWidth;
    msg.style.animation = `msgPop 0.45s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.22 + 0.2}s forwards`;
  });
}

/* Trigger each msg thread when it enters viewport */
document.querySelectorAll('.msg-thread').forEach(thread => {
  let triggered = false;
  const obs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      animateMsgThread(thread);
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(thread);
});

/* ===== PARALLAX ON BG ELEMENTS ===== */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const ambient = document.querySelector('.s1-ambient');
      if (ambient) ambient.style.transform = `translateY(${scrollY * 0.25}px)`;

      const particles = document.querySelector('.s1-particles');
      if (particles) particles.style.transform = `translateY(${scrollY * 0.1}px)`;

      const ghost = document.querySelector('.s6-ghost-text');
      if (ghost) {
        const s6 = document.getElementById('s6');
        if (s6) {
          const rect = s6.getBoundingClientRect();
          ghost.style.transform = `translateX(-50%) translateY(${rect.top * 0.08}px)`;
        }
      }
      ticking = false;
    });
    ticking = true;
  }
});

/* ===== CUSTOM CURSOR (desktop only) ===== */
if (window.matchMedia('(pointer: fine)').matches) {
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    width: 6px;
    height: 6px;
    background: #ff1a6b;
    border-radius: 50%;
    pointer-events: none;
    z-index: 99998;
    transition: transform 0.1s ease;
    box-shadow: 0 0 10px #ff1a6b, 0 0 25px rgba(255,26,107,0.4);
    mix-blend-mode: screen;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(cursor);

  const trail = document.createElement('div');
  trail.style.cssText = `
    position: fixed;
    width: 26px;
    height: 26px;
    border: 1px solid rgba(255,26,107,0.35);
    border-radius: 50%;
    pointer-events: none;
    z-index: 99997;
    transition: left 0.15s ease, top 0.15s ease, transform 0.15s ease;
    transform: translate(-50%, -50%);
  `;
  document.body.appendChild(trail);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    trail.style.left  = e.clientX + 'px';
    trail.style.top   = e.clientY + 'px';
  });

  document.querySelectorAll('a, .flip-card, .chaos-card, .img-caption-card, .bonus-img, .mosaic-cell').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
      trail.style.transform = 'translate(-50%, -50%) scale(1.6)';
      trail.style.borderColor = 'rgba(255,26,107,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      trail.style.transform = 'translate(-50%, -50%) scale(1)';
      trail.style.borderColor = 'rgba(255,26,107,0.35)';
    });
  });
}

/* ===== NAV ACTIVE HIGHLIGHT ===== */
const sections = document.querySelectorAll('.scene[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.style.color = '');
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.style.color = '#ff1a6b';
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

/* ===== NAV SCROLL BLUR ===== */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    nav.style.background = 'rgba(6,6,8,0.95)';
    nav.style.boxShadow = '0 1px 0 rgba(255,26,107,0.1)';
  } else {
    nav.style.background = '';
    nav.style.boxShadow = '';
  }
}, { passive: true });

/* ===== MOBILE MENU TOGGLE ===== */
const menuBtn = document.querySelector('.nav-menu-btn');
const navLinksEl = document.querySelector('.nav-links');
if (menuBtn && navLinksEl) {
  menuBtn.addEventListener('click', () => {
    const open = navLinksEl.style.display === 'flex';
    navLinksEl.style.display = open ? 'none' : 'flex';
    navLinksEl.style.flexDirection = 'column';
    navLinksEl.style.position = 'absolute';
    navLinksEl.style.top = '60px';
    navLinksEl.style.right = '20px';
    navLinksEl.style.background = 'rgba(6,6,8,0.97)';
    navLinksEl.style.border = '1px solid rgba(255,26,107,0.2)';
    navLinksEl.style.padding = '20px';
    navLinksEl.style.gap = '16px';
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.style.display = 'none';
    });
  });
}

/* ===== TITLE HOVER GLITCH (S1) ===== */
const title = document.querySelector('.s1-title');
if (title) {
  title.addEventListener('mouseenter', () => {
    title.style.animation = 'glitchRepeat 0.3s steps(1) forwards';
  });
  title.addEventListener('mouseleave', () => {
    title.style.animation = '';
  });
}

/* ===== SECRET MESSAGE UNLOCK ===== */
const unlockBtn = document.getElementById('unlockBtn');
const secretLocked = document.getElementById('secretLocked');
const secretRevealed = document.getElementById('secretRevealed');

if (unlockBtn && secretLocked && secretRevealed) {
  unlockBtn.addEventListener('click', () => {
    // Shake / pulse the lock first
    unlockBtn.style.transform = 'scale(0.95)';
    setTimeout(() => { unlockBtn.style.transform = ''; }, 120);

    // Small glitch flash on the whole locked box
    secretLocked.style.transition = 'opacity 0.3s';
    secretLocked.style.opacity = '0';

    setTimeout(() => {
      secretLocked.style.display = 'none';
      secretRevealed.classList.add('open');

      // Stagger the message thread inside reveal
      const msgs = secretRevealed.querySelectorAll('.msg, .msg-time');
      msgs.forEach((m, i) => {
        m.style.opacity = '0';
        m.style.animation = `msgPop 0.4s cubic-bezier(0.34,1.56,0.64,1) ${2.6 + i * 0.22}s forwards`;
      });

      // Scroll to it smoothly
      setTimeout(() => {
        secretRevealed.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }, 350);
  });
}
