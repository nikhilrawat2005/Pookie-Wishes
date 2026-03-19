// ═══════════════════════════════════════════════════════
//  POOKIE WISHES — app.js  (v4)
//  Firebase Google + Email auth · Multi-page
// ═══════════════════════════════════════════════════════

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

// Detect which page we're on
const isRoot       = !window.location.pathname.includes('/pages/');
const dataPath     = isRoot ? 'data/templates.json' : '../data/templates.json';
const orderPath    = isRoot ? 'pages/order.html'    : 'order.html';
const indexPath    = isRoot ? 'index.html'          : '../index.html';
const PAGE         = window.PAGE || (window.location.pathname.includes('favorites') ? 'favorites' : 'home');

// ── BOOT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initNavScroll();
  await loadTemplateData();
  if (PAGE !== 'favorites') {
    renderTemplateCards();
    renderComingSoon();
  }
  initFirebase();
});

// ═══════════════════════════════════════════════════════
//  FIREBASE INIT
// ═══════════════════════════════════════════════════════
function initFirebase() {
  try {
    if (!firebase.apps.length) firebase.initializeApp(FB_CONFIG);
    fbReady = true;

    firebase.auth().onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        await loadUserFavs(user.uid);
        updateAuthUI(user);
        if (PAGE === 'favorites') renderFavPage();
        else refreshAllFavBtns();
      } else {
        updateAuthUI(null);
        if (PAGE === 'favorites') showFavLoginPrompt();
        else refreshAllFavBtns();
      }
    });
  } catch (err) {
    console.warn('[PookieWishes] Firebase init failed:', err.message);
    const s = localStorage.getItem('pw_favs');
    if (s) favSet = new Set(JSON.parse(s));
    if (PAGE === 'favorites') showFavLoginPrompt();
    refreshAllFavBtns();
  }
}

// ═══════════════════════════════════════════════════════
//  AUTH — GOOGLE
// ═══════════════════════════════════════════════════════
async function googleLogin() {
  if (!fbReady) { toast('Login not available right now', 'err'); return; }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    closeModal('modal-auth');
    toast('Welcome to Pookie Wishes! 🎉', 'ok');
  } catch (err) {
    if (err.code !== 'auth/popup-closed-by-user') {
      toast('Login failed — try again', 'err');
    }
  }
}

// ═══════════════════════════════════════════════════════
//  AUTH — EMAIL
// ═══════════════════════════════════════════════════════
async function emailSignIn() {
  const email = document.getElementById('auth-email')?.value.trim();
  const pw    = document.getElementById('auth-pw')?.value;
  if (!email || !pw) { toast('Enter email and password', 'err'); return; }
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pw);
    closeModal('modal-auth');
    toast('Welcome back! 🎉', 'ok');
  } catch (err) {
    toast(friendlyAuthError(err.code), 'err');
  }
}

async function emailRegister() {
  const email = document.getElementById('auth-email')?.value.trim();
  const pw    = document.getElementById('auth-pw')?.value;
  if (!email || !pw) { toast('Enter email and password', 'err'); return; }
  if (pw.length < 6) { toast('Password must be at least 6 characters', 'err'); return; }
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, pw);
    closeModal('modal-auth');
    toast('Account created! Welcome 🎉', 'ok');
  } catch (err) {
    toast(friendlyAuthError(err.code), 'err');
  }
}

async function resetPassword() {
  const email = document.getElementById('auth-email')?.value.trim();
  if (!email) { toast('Enter your email first', 'err'); return; }
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    toast('Reset email sent! Check your inbox 📧', 'ok');
  } catch (err) {
    toast(friendlyAuthError(err.code), 'err');
  }
}

function friendlyAuthError(code) {
  const map = {
    'auth/user-not-found':     'No account found with this email',
    'auth/wrong-password':     'Incorrect password',
    'auth/email-already-in-use': 'Email already registered — try signing in',
    'auth/invalid-email':      'Invalid email address',
    'auth/too-many-requests':  'Too many attempts — try again later',
    'auth/network-request-failed': 'Network error — check your connection',
  };
  return map[code] || 'Something went wrong — try again';
}

// ── Sign out ──────────────────────────────────────────
async function doLogout() {
  try { await firebase.auth().signOut(); } catch (e) { console.error(e); }
  currentUser = null;
  favSet.clear();
  closeDd();
  toast('Logged out! 👋', 'inf');
  if (PAGE === 'favorites') showFavLoginPrompt();
  refreshAllFavBtns();
}

// ═══════════════════════════════════════════════════════
//  AUTH UI
// ═══════════════════════════════════════════════════════
function updateAuthUI(user) {
  const $btn    = document.getElementById('btn-login');
  const $wrap   = document.getElementById('u-wrap');
  const $av     = document.getElementById('u-av');
  const $uname  = document.getElementById('dd-uname');
  const $uemail = document.getElementById('dd-uemail');
  if (user) {
    $btn?.classList.add('hidden');
    $wrap?.classList.remove('hidden');
    if ($av) {
      $av.src = user.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`;
      $av.onerror = () => { $av.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`; };
    }
    if ($uname)  $uname.textContent  = user.displayName || user.email || 'Pookie ✨';
    if ($uemail) $uemail.textContent = user.email || '';
  } else {
    $btn?.classList.remove('hidden');
    $wrap?.classList.add('hidden');
  }
}
function toggleDd() { document.getElementById('u-dd')?.classList.toggle('open'); }
function closeDd()  { document.getElementById('u-dd')?.classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('#u-wrap')) closeDd(); });

// ═══════════════════════════════════════════════════════
//  FAVOURITES
// ═══════════════════════════════════════════════════════
async function loadUserFavs(uid) {
  try {
    const doc = await firebase.firestore().collection('users').doc(uid).get();
    favSet = new Set(doc.exists ? (doc.data().favs || []) : []);
  } catch {
    const s = localStorage.getItem('pw_favs');
    favSet = s ? new Set(JSON.parse(s)) : new Set();
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
  } catch { localStorage.setItem('pw_favs', JSON.stringify(arr)); }
}

async function toggleFav(id) {
  if (!currentUser) { openModal('modal-auth'); toast('Sign in to save favourites 💖', 'inf'); return; }
  favSet.has(id) ? favSet.delete(id) : favSet.add(id);
  await persistFavs(currentUser.uid);
  refreshAllFavBtns();
  if (PAGE === 'favorites') renderFavPage();
  toast(favSet.has(id) ? 'Saved to favourites 💖' : 'Removed from favourites', favSet.has(id) ? 'ok' : 'inf');
}

function refreshAllFavBtns() {
  document.querySelectorAll('[data-fav]').forEach(b => {
    const on = favSet.has(b.dataset.fav);
    b.classList.toggle('on', on);
    b.textContent = on ? '💖' : '🤍';
  });
}

// ── Favorites page render ────────────────────────────
function showFavLoginPrompt() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  c.innerHTML = `
    <div class="fav-empty">
      <span class="big">💌</span>
      <h3>Sign in to see your favourites</h3>
      <p>Save templates you love by clicking the heart icon, then find them all here.</p>
      <button class="btn btn-primary btn-lg" onclick="openModal('modal-auth')">Sign In 💖</button>
    </div>`;
}

function renderFavPage() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  if (!currentUser) { showFavLoginPrompt(); return; }
  const list = (tplData?.templates || []).filter(t => favSet.has(t.id));
  if (!list.length) {
    c.innerHTML = `
      <div class="fav-empty">
        <span class="big">🤍</span>
        <h3>No favourites yet</h3>
        <p>Tap the heart on any template on the <a href="${indexPath}" style="color:var(--pink)">home page</a> to save it here.</p>
      </div>`;
    return;
  }
  c.innerHTML = `<div class="t-grid">${list.map(t => buildCard(t)).join('')}</div>`;
  refreshAllFavBtns();
}

// ═══════════════════════════════════════════════════════
//  TEMPLATES
// ═══════════════════════════════════════════════════════
async function loadTemplateData() {
  try {
    const res = await fetch(dataPath);
    tplData = await res.json();
  } catch { tplData = { templates: [], comingSoon: [] }; }
}

function buildCard(t) {
  const isFav   = favSet.has(t.id);
  const phClass = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const vibeC   = t.id === 'hello-kitty' ? 'v-cute' : 'v-magic';
  const search  = [t.name, ...(t.tags||[]), t.vibe||''].join(' ').toLowerCase();

  const imgHTML = t.image
    ? `<img class="t-img" src="${isRoot ? '' : '../'}${t.image}" alt="${t.name}" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.removeAttribute('style')">`
    : '';
  const phHTML = `
    <div class="t-ph ${phClass}" ${t.image ? 'style="display:none"' : ''}>
      <span class="ph-emoji">${t.emoji}</span>
      <span class="ph-hint">📸 Preview coming soon</span>
    </div>`;

  const feats = (t.features||[]).map(f=>`<div class="t-feat">${f}</div>`).join('');
  const tags  = (t.tags||[]).map(g=>`<span class="t-tag">#${g}</span>`).join('');

  return `
    <div class="t-card" data-id="${t.id}" data-search="${search}">
      <div class="t-img-wrap">
        ${imgHTML}${phHTML}
        ${t.badge ? `<span class="t-badge">${t.badge}</span>` : ''}
        <button class="fav-btn ${isFav?'on':''}" data-fav="${t.id}"
                onclick="toggleFav('${t.id}')">${isFav?'💖':'🤍'}</button>
        <div class="t-over">
          <a href="${t.demoUrl}" target="_blank" rel="noopener" class="t-over-btn">👀 Visit Website</a>
        </div>
      </div>
      <div class="t-body">
        <div class="t-meta">
          <span class="t-name">${t.emoji} ${t.name}</span>
          <span class="t-price">${t.price}</span>
        </div>
        <div class="t-tagline">${t.tagline}</div>
        <span class="t-vibe ${vibeC}">✦ ${t.vibe}</span>
        <p class="t-desc">${t.description}</p>
        <div class="t-feats">${feats}</div>
        <div class="t-tags">${tags}</div>
        <div class="t-actions">
          <a href="${t.demoUrl}" target="_blank" rel="noopener" class="btn btn-outline">👀 Visit</a>
          <a href="${orderPath}?t=${t.id}" class="btn btn-primary">🎁 Order — ${t.price}</a>
        </div>
      </div>
    </div>`;
}

function renderTemplateCards() {
  const g = document.getElementById('tpl-grid');
  if (!g) return;
  g.innerHTML = (tplData?.templates||[]).map(buildCard).join('');
}

function renderComingSoon() {
  const g = document.getElementById('cs-grid');
  if (!g) return;
  g.innerHTML = (tplData?.comingSoon||[]).map(c=>`
    <div class="cs-card">
      <span class="cs-em">${c.emoji}</span>
      <div class="cs-name">${c.name}</div>
      <div class="cs-tag">${c.tagline}</div>
      <span class="cs-bdg">coming soon</span>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════
function openModal(id)  { document.getElementById(id)?.classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); document.body.style.overflow=''; }
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) { e.target.classList.remove('open'); document.body.style.overflow=''; }
});
document.addEventListener('keydown', e => {
  if (e.key==='Escape') document.querySelectorAll('.overlay.open').forEach(o => { o.classList.remove('open'); document.body.style.overflow=''; });
});

// ═══════════════════════════════════════════════════════
//  NAVBAR SCROLL
// ═══════════════════════════════════════════════════════
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', scrollY > 36), {passive:true});
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
function toast(msg, type='inf') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const icons = {ok:'✅', err:'❌', inf:'💬'};
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(()=>el.remove(),300); }, 3000);
}

// ═══════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  googleLogin, emailSignIn, emailRegister, resetPassword,
  doLogout, toggleFav, openModal, closeModal, toggleDd, closeDd,
});
