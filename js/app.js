// ═══════════════════════════════════════════════════════
//  POOKIE WISH — app.js
//  Clean Firebase v9 compat integration
// ═══════════════════════════════════════════════════════

// ── YOUR FIREBASE CONFIG (already filled in!) ─────────
const FB_CONFIG = {
  apiKey:            "AIzaSyDSwNeLEDIuSOMeT-8vnPYifxax9NKj484",
  authDomain:        "pookie-wish.firebaseapp.com",
  projectId:         "pookie-wish",
  storageBucket:     "pookie-wish.firebasestorage.app",
  messagingSenderId: "741136764035",
  appId:             "1:741136764035:web:1164a5c857c3c6ec9a9fb6"
};

// ── STATE ─────────────────────────────────────────────
let currentUser = null;
let favSet      = new Set();
let tplData     = null;
let fbReady     = false;

// ── BOOT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadTemplateData();
  initNavScroll();
  renderTemplateCards();
  renderComingSoon();
  showLoginPrompt();
  initFirebase();
});

// ═══════════════════════════════════════════════════════
//  FIREBASE
// ═══════════════════════════════════════════════════════
function initFirebase() {
  try {
    // prevent double-init
    if (!firebase.apps.length) {
      firebase.initializeApp(FB_CONFIG);
    }
    fbReady = true;

    firebase.auth().onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        await loadUserFavs(user.uid);
        updateAuthUI(user);
        renderFavSection();
      } else {
        updateAuthUI(null);
        showLoginPrompt();
        refreshAllFavBtns();
      }
    });
  } catch (err) {
    console.warn('[PookieWish] Firebase init failed:', err.message);
    // Graceful fallback — load from localStorage
    const saved = localStorage.getItem('pw_favs');
    if (saved) favSet = new Set(JSON.parse(saved));
    refreshAllFavBtns();
  }
}

// Google Sign-In popup
async function googleLogin() {
  if (!fbReady) { toast('Login unavailable right now', 'err'); return; }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    closeModal('modal-auth');
    toast('Welcome to Pookie Wish! 🎉', 'ok');
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      toast('Login failed — try again', 'err');
    }
  }
}

// Sign out
async function doLogout() {
  try {
    await firebase.auth().signOut();
  } catch (err) { console.error(err); }
  currentUser = null;
  favSet.clear();
  closeDd();
  showLoginPrompt();
  refreshAllFavBtns();
  toast('Logged out! Come back soon 👋', 'inf');
}

// ═══════════════════════════════════════════════════════
//  AUTH UI
// ═══════════════════════════════════════════════════════
function updateAuthUI(user) {
  const $loginBtn = document.getElementById('btn-login');
  const $userWrap = document.getElementById('u-wrap');
  const $avatar   = document.getElementById('u-av');
  const $uname    = document.getElementById('dd-uname');
  const $uemail   = document.getElementById('dd-uemail');

  if (user) {
    $loginBtn?.classList.add('hidden');
    $userWrap?.classList.remove('hidden');
    if ($avatar) {
      $avatar.src = user.photoURL
        || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`;
      $avatar.onerror = () => { $avatar.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`; };
    }
    if ($uname)  $uname.textContent  = user.displayName || 'Pookie ✨';
    if ($uemail) $uemail.textContent = user.email || '';
  } else {
    $loginBtn?.classList.remove('hidden');
    $userWrap?.classList.add('hidden');
  }
}

function toggleDd() { document.getElementById('u-dd')?.classList.toggle('open'); }
function closeDd()  { document.getElementById('u-dd')?.classList.remove('open'); }

document.addEventListener('click', (e) => {
  if (!e.target.closest('#u-wrap')) closeDd();
});

// ═══════════════════════════════════════════════════════
//  FAVORITES
// ═══════════════════════════════════════════════════════
async function loadUserFavs(uid) {
  try {
    const db  = firebase.firestore();
    const doc = await db.collection('users').doc(uid).get();
    favSet = new Set(doc.exists ? (doc.data().favs || []) : []);
  } catch {
    // Firestore might not be set up yet — use localStorage
    const saved = localStorage.getItem('pw_favs');
    favSet = saved ? new Set(JSON.parse(saved)) : new Set();
  }
  refreshAllFavBtns();
}

async function persistFavs(uid) {
  const arr = [...favSet];
  try {
    await firebase.firestore().collection('users').doc(uid).set(
      { favs: arr, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch {
    localStorage.setItem('pw_favs', JSON.stringify(arr));
  }
}

async function toggleFav(templateId) {
  if (!currentUser) {
    openModal('modal-auth');
    toast('Login to save favourites! 💖', 'inf');
    return;
  }
  if (favSet.has(templateId)) {
    favSet.delete(templateId);
    toast('Removed from favourites', 'inf');
  } else {
    favSet.add(templateId);
    toast('Added to favourites! 💖', 'ok');
  }
  await persistFavs(currentUser.uid);
  refreshAllFavBtns();
  renderFavSection();
}

function refreshAllFavBtns() {
  document.querySelectorAll('[data-fav]').forEach(btn => {
    const active = favSet.has(btn.dataset.fav);
    btn.classList.toggle('on', active);
    btn.textContent = active ? '💖' : '🤍';
    btn.title = active ? 'Remove from favourites' : 'Save to favourites';
  });
}

// ═══════════════════════════════════════════════════════
//  TEMPLATE DATA & CARDS
// ═══════════════════════════════════════════════════════
async function loadTemplateData() {
  try {
    const res = await fetch('data/templates.json');
    tplData = await res.json();
  } catch (err) {
    console.error('[PookieWish] Could not load templates.json', err);
    tplData = { templates: [], comingSoon: [] };
  }
}

function buildCard(t, forFavSection = false) {
  const isFav     = favSet.has(t.id);
  const phClass   = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const vibeClass = t.id === 'hello-kitty' ? 'v-cute' : 'v-magic';

  const imgHTML = t.image
    ? `<img class="t-img" src="${t.image}" alt="${t.name}" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.style.removeProperty('display')">`
    : '';

  const phHTML = `
    <div class="t-ph ${phClass}" ${t.image ? 'style="display:none"' : ''}>
      <span class="ph-emoji">${t.emoji}</span>
      <span class="ph-hint">📸 Add: ${t.image || 'images/' + t.id + '-preview.jpg'}</span>
    </div>`;

  const featsHTML = (t.features || []).map(f => `<div class="t-feat">${f}</div>`).join('');
  const tagsHTML  = (t.tags    || []).map(g => `<span class="t-tag">#${g}</span>`).join('');

  return `
    <div class="t-card" data-id="${t.id}">
      <div class="t-img-wrap">
        ${imgHTML}${phHTML}
        ${t.badge ? `<span class="t-badge">${t.badge}</span>` : ''}
        <button class="fav-btn ${isFav ? 'on' : ''}" data-fav="${t.id}"
                onclick="toggleFav('${t.id}')">${isFav ? '💖' : '🤍'}</button>
        <div class="t-over">
          <a href="${t.demoUrl}" target="_blank" rel="noopener" class="t-over-btn">
            👀 Visit Website
          </a>
        </div>
      </div>
      <div class="t-body">
        <div class="t-meta">
          <span class="t-name">${t.emoji} ${t.name}</span>
          <span class="t-price">${t.price}</span>
        </div>
        <div class="t-tagline">${t.tagline}</div>
        <span class="t-vibe ${vibeClass}">✦ ${t.vibe}</span>
        <p class="t-desc">${t.description}</p>
        <div class="t-feats">${featsHTML}</div>
        <div class="t-tags">${tagsHTML}</div>
        <div class="t-actions">
          <a href="${t.demoUrl}" target="_blank" rel="noopener" class="btn btn-outline">
            👀 Visit
          </a>
          <a href="pages/order.html?t=${t.id}" class="btn btn-primary">
            🎁 Order — ${t.price}
          </a>
        </div>
      </div>
    </div>`;
}

function renderTemplateCards() {
  const grid = document.getElementById('tpl-grid');
  if (!grid || !tplData) return;
  grid.innerHTML = tplData.templates.map(t => buildCard(t)).join('');
}

function renderComingSoon() {
  const grid = document.getElementById('cs-grid');
  if (!grid || !tplData) return;
  grid.innerHTML = tplData.comingSoon.map(c => `
    <div class="cs-card">
      <span class="cs-em">${c.emoji}</span>
      <div class="cs-name">${c.name}</div>
      <div class="cs-tag">${c.tagline}</div>
      <span class="cs-bdg">coming soon</span>
    </div>`).join('');
}

function showLoginPrompt() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  c.innerHTML = `
    <div class="fav-empty">
      <span class="big">💌</span>
      <h3>Save Your Favourites</h3>
      <p>Login with Google to bookmark templates and find them here instantly!</p>
      <button class="btn btn-primary btn-lg" onclick="openModal('modal-auth')">
        Login to Save 💖
      </button>
    </div>`;
}

function renderFavSection() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  const list = (tplData?.templates || []).filter(t => favSet.has(t.id));
  if (!list.length) {
    c.innerHTML = `
      <div class="fav-empty">
        <span class="big">🤍</span>
        <h3>No favourites yet!</h3>
        <p>Tap the heart on any template above to save it here for later.</p>
      </div>`;
    return;
  }
  c.innerHTML = `<div class="t-grid">${list.map(t => buildCard(t, true)).join('')}</div>`;
  refreshAllFavBtns();
}

// ═══════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape')
    document.querySelectorAll('.overlay.open').forEach(o => {
      o.classList.remove('open'); document.body.style.overflow = '';
    });
});

// ═══════════════════════════════════════════════════════
//  NAVBAR SCROLL
// ═══════════════════════════════════════════════════════
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 36);
  }, { passive: true });
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
function toast(msg, type = 'inf') {
  const container = document.getElementById('toasts');
  if (!container) return;
  const icons = { ok: '✅', err: '❌', inf: '💬' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ═══════════════════════════════════════════════════════
//  EXPOSE GLOBALS (called from HTML onclick)
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  googleLogin,
  doLogout,
  toggleFav,
  openModal,
  closeModal,
  toggleDd,
  closeDd,
});
