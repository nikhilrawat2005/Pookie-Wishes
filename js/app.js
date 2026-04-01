// ═══════════════════════════════════════════════════════
//  POOKIE WISHES — app.js  (v10 — Custom Backend)
//  Custom email/upload backend · Firebase v9-compat
// ═══════════════════════════════════════════════════════

// ── Page detection ────────────────────────────────────
const isPages  = window.location.pathname.includes('/pages/');
const ROOT     = isPages ? '../' : '';
const DATA_URL = ROOT + 'data/site.json';

const PAGE = (() => {
  const p = window.location.pathname;
  if (p.includes('favorites'))    return 'favorites';
  if (p.includes('how-it-works')) return 'how';
  if (p.includes('template'))     return 'detail';
  if (p.includes('checkout'))     return 'checkout';
  if (p.includes('order-success'))return 'success';
  return 'home';
})();

// ── State ─────────────────────────────────────────────
let SITE        = null;
let currentUser = null;
let favSet      = new Set();
let cart        = [];
let fbReady     = false;

// ── Simple cache ──────────────────────────────────────
const cache = {};
function getCached(key, fn) {
  if (cache[key]) return cache[key];
  return (cache[key] = fn());
}

// ── Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  SITE = await loadData();
  injectSiteText();
  initNavScroll();
  initCartDrawer();
  initFirebase();
  loadLocalCart();
  updateCartBadge();

  if (PAGE === 'home')    { renderTemplateCards(); renderComingSoon(); }
  if (PAGE === 'detail')  { renderDetailPage(); }
  if (PAGE === 'checkout') { initCheckout(); }

  initReveals();
});

// ═══════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════
async function loadData() {
  try {
    const r = await fetch(DATA_URL);
    return await r.json();
  } catch { return { site:{}, templates:[], comingSoon:[], firebase:{}, googleForm:{} }; }
}

function injectSiteText() {
  if (!SITE?.site) return;
  const s = SITE.site;
  document.querySelectorAll('[data-site-name]').forEach(el => el.textContent = s.name || 'Pookie Wishes');
  document.querySelectorAll('[data-site-email]').forEach(el => el.textContent = s.email || '');
  document.querySelectorAll('[data-site-email-href]').forEach(el => el.href = `mailto:${s.email || ''}`);
  document.querySelectorAll('[data-site-insta]').forEach(el => {
    el.href = s.instagram || '#';
    el.textContent = s.instagramHandle || '@pookiewish';
  });
  document.querySelectorAll('[data-site-wa]').forEach(el =>
    el.href = `https://wa.me/${(s.whatsapp||'').replace(/\D/g,'')}`);
}

// ═══════════════════════════════════════════════════════
//  FIREBASE  (v9 compat — NO module imports)
// ═══════════════════════════════════════════════════════
function initFirebase() {
  const cfg = SITE?.firebase;
  if (!cfg?.apiKey || cfg.apiKey.startsWith('YOUR')) {
    console.warn('[PW] Firebase not configured');
    if (PAGE === 'favorites') showFavPrompt();
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    fbReady = true;
    window.fbReady = true;
    firebase.auth().onAuthStateChanged(async user => {
      currentUser = user;
      updateAuthUI(user);
      if (user) {
        await syncFavs(user.uid);
        if (PAGE === 'favorites') renderFavPage();
        else refreshFavBtns();
        addAdminToMobileMenu();   // Add admin link to mobile menu if admin

        const ADMIN_EMAILS = [
          "teamcipher.work@gmail.com",
          "nikhil2005114@gmail.com"
        ];
        if (ADMIN_EMAILS.includes(user.email)) {
          const nav = document.querySelector(".nav-links");
          if (nav && !document.getElementById("admin-btn")) {
            const btn = document.createElement("a");
            btn.href = ROOT + "admin/index.html";
            btn.innerText = "Admin Panel ⚙️";
            btn.className = "btn btn-ghost";
            btn.id = "admin-btn";
            nav.appendChild(btn);
          }
          
          const uDd = document.getElementById("u-dd");
          if (uDd && !document.getElementById("admin-dd-btn")) {
            const ddItem = document.createElement("a");
            ddItem.href = ROOT + "admin/index.html";
            ddItem.innerText = "⚙️ Admin Panel";
            ddItem.className = "dd-item";
            ddItem.id = "admin-dd-btn";
            const sep = uDd.querySelector(".dd-sep");
            if (sep) {
              uDd.insertBefore(ddItem, sep);
            } else {
              uDd.appendChild(ddItem);
            }
          }
        }
      } else {
        if (PAGE === 'favorites') showFavPrompt();
        else refreshFavBtns();
      }
    });
  } catch (e) {
    console.warn('[PW] Firebase init error:', e.message);
    fbReady = false;
    window.fbReady = false;
  }
}


// ═══════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════
async function googleLogin() {
  if (!fbReady) { toast('Auth not ready — check Firebase config', 'err'); return; }
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    closeModal('modal-auth');
    toast('Welcome! 🎉', 'ok');
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') toast('Google login failed', 'err');
  }
}

async function emailSignIn() {
  if (!fbReady) { toast('Auth not ready', 'err'); return; }
  const email = getVal('auth-email');
  const pw    = getVal('auth-pw');
  if (!email || !pw) { toast('Enter email and password', 'err'); return; }
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pw);
    closeModal('modal-auth');
    toast('Welcome back! 🎉', 'ok');
  } catch (e) { toast(authErrMsg(e.code), 'err'); }
}

async function emailRegister() {
  if (!fbReady) { toast('Auth not ready', 'err'); return; }
  const email = getVal('auth-email');
  const pw    = getVal('auth-pw');
  if (!email || !pw) { toast('Enter email and password', 'err'); return; }
  if (pw.length < 6) { toast('Password needs 6+ characters', 'err'); return; }
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, pw);
    closeModal('modal-auth');
    toast('Account created! 🎉', 'ok');
  } catch (e) { toast(authErrMsg(e.code), 'err'); }
}

async function resetPassword() {
  const email = getVal('auth-email');
  if (!email) { toast('Enter your email first', 'err'); return; }
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    toast('Reset email sent! Check your inbox 📧', 'ok');
  } catch (e) { toast(authErrMsg(e.code), 'err'); }
}

async function doLogout() {
  try { await firebase.auth().signOut(); } catch {}
  closeDd();
  toast('Logged out! 👋', 'inf');
  if (PAGE === 'favorites') showFavPrompt();
}

function authErrMsg(code) {
  const map = {
    'auth/user-not-found':      'No account with this email',
    'auth/wrong-password':      'Incorrect password',
    'auth/invalid-credential':  'Email or password is wrong',
    'auth/email-already-in-use':'Email already registered — try logging in',
    'auth/invalid-email':       'Invalid email address',
    'auth/too-many-requests':   'Too many attempts — try again later',
    'auth/network-request-failed': 'Network error — check connection'
  };
  return map[code] || 'Something went wrong';
}

// ── Auth UI ──────────────────────────────────────────
function updateAuthUI(user) {
  const $btn  = document.getElementById('btn-login');
  const $wrap = document.getElementById('u-wrap');
  const $av   = document.getElementById('u-av');
  const $name = document.getElementById('dd-uname');
  const $mail = document.getElementById('dd-uemail');
  if (user) {
    $btn?.classList.add('hidden');
    $wrap?.classList.remove('hidden');
    if ($av) {
      $av.src = user.photoURL
        || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`;
      $av.onerror = () => {
        $av.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`;
      };
    }
    if ($name) $name.textContent = user.displayName || user.email?.split('@')[0] || 'Pookie ✨';
    if ($mail) $mail.textContent = user.email || '';
  } else {
    $btn?.classList.remove('hidden');
    $wrap?.classList.add('hidden');
  }
}
function toggleDd() { document.getElementById('u-dd')?.classList.toggle('open'); }
function closeDd()  { document.getElementById('u-dd')?.classList.remove('open'); }
document.addEventListener('click', e => { if (!e.target.closest('#u-wrap')) closeDd(); });

// ── Admin helper ─────────────────────────────────────
function isAdmin() {
  return currentUser && [
    "teamcipher.work@gmail.com",
    "nikhil2005114@gmail.com"
  ].includes(currentUser.email);
}

// ── Add admin button to mobile menu ──────────────────
function addAdminToMobileMenu() {
  if (!isAdmin()) return;

  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu) return;

  // Avoid duplicates
  if (mobileMenu.querySelector('.admin-mobile-link')) return;

  const adminLink = document.createElement('a');
  adminLink.href = ROOT + 'admin/index.html';
  adminLink.className = 'btn btn-ghost admin-mobile-link';
  adminLink.textContent = 'Admin Panel ⚙️';
  mobileMenu.appendChild(adminLink);
}

// ═══════════════════════════════════════════════════════
//  FAVOURITES
// ═══════════════════════════════════════════════════════
async function syncFavs(uid) {
  try {
    const doc = await firebase.firestore().collection('users').doc(uid).get();
    const remote = new Set(doc.exists ? (doc.data()?.favs || []) : []);
    const local  = new Set(JSON.parse(localStorage.getItem('pw_favs') || '[]'));
    favSet = new Set([...remote, ...local]);
    await persistFavs(uid);
  } catch {
    favSet = new Set(JSON.parse(localStorage.getItem('pw_favs') || '[]'));
  }
  refreshFavBtns();
}

async function persistFavs(uid) {
  const arr = [...favSet];
  localStorage.setItem('pw_favs', JSON.stringify(arr));
  if (!uid || !fbReady) return;
  try {
    await firebase.firestore().collection('users').doc(uid).set(
      { favs: arr, ts: firebase.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
  } catch {}
}

async function toggleFav(id, e) {
  if (e) e.stopPropagation();
  if (!currentUser) {
    openModal('modal-auth');
    toast('Sign in to save favourites 💖', 'inf');
    return;
  }
  favSet.has(id) ? favSet.delete(id) : favSet.add(id);
  await persistFavs(currentUser.uid);
  refreshFavBtns();
  if (PAGE === 'favorites') renderFavPage();
  toast(favSet.has(id) ? 'Saved 💖' : 'Removed', favSet.has(id) ? 'ok' : 'inf');
}

function refreshFavBtns() {
  document.querySelectorAll('[data-fav]').forEach(b => {
    const on = favSet.has(b.dataset.fav);
    b.classList.toggle('on', on);
    b.textContent = on ? '💖' : '🤍';
  });
}

function showFavPrompt() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  c.innerHTML = `
    <div class="fav-empty">
      <span class="big">💌</span>
      <h3>Sign in to see your favourites</h3>
      <p>Tap 💖 on any template to save it here.</p>
      <button class="btn btn-primary btn-lg" onclick="openModal('modal-auth')">Sign In 💖</button>
    </div>`;
}

function renderFavPage() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  if (!currentUser) { showFavPrompt(); return; }
  const list = (SITE?.templates || []).filter(t => favSet.has(t.id));
  if (!list.length) {
    c.innerHTML = `
      <div class="fav-empty">
        <span class="big">🤍</span>
        <h3>No favourites yet</h3>
        <p>Tap 💖 on any template on the <a href="${ROOT}index.html" style="color:var(--pink)">home page</a>.</p>
      </div>`;
    return;
  }
  c.innerHTML = `<div class="t-grid">${list.map(buildCard).join('')}</div>`;
  refreshFavBtns(); refreshCartBtns();
}

// ═══════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════
function loadLocalCart() {
  try { cart = JSON.parse(localStorage.getItem('pw_cart') || '[]'); }
  catch { cart = []; }
  syncCartWithSite();
  updateCartBadge(); refreshCartBtns(); renderCartDrawer();
}

// Keep cart item prices in sync with the latest template prices in `data/site.json`.
function syncCartWithSite() {
  if (!SITE?.templates?.length || !Array.isArray(cart) || !cart.length) return false;
  let changed = false;
  cart = cart.map(item => {
    const tpl = (SITE.templates || []).find(t => t.id === item.id);
    if (!tpl) return item;

    const next = {
      ...item,
      name: tpl.name ?? item.name,
      emoji: tpl.emoji ?? item.emoji,
      price: Number(tpl.price ?? item.price ?? 0),
      currency: tpl.currency || item.currency || '₹'
    };

    if (
      item.name !== next.name ||
      item.emoji !== next.emoji ||
      item.price !== next.price ||
      item.currency !== next.currency
    ) changed = true;

    return next;
  });

  if (changed) localStorage.setItem('pw_cart', JSON.stringify(cart));
  return changed;
}

function saveCart() {
  localStorage.setItem('pw_cart', JSON.stringify(cart));
  updateCartBadge(); refreshCartBtns(); renderCartDrawer();
}

function addToCart(id, e) {
  if (e) e.stopPropagation();
  const tpl = (SITE?.templates || []).find(t => t.id === id);
  if (!tpl) return;
  if (cart.find(i => i.id === id)) { toast('Already in cart!', 'inf'); return; }
  cart.push({
    id,
    name: tpl.name,
    price: Number(tpl.price),
    currency: tpl.currency || '₹',
    emoji: tpl.emoji
  });
  saveCart();
  toast(`${tpl.emoji} Added to cart!`, 'ok');
}

function removeFromCart(id) { cart = cart.filter(i => i.id !== id); saveCart(); }

function updateCartBadge() {
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = cart.length;
    el.style.display = cart.length ? 'flex' : 'none';
  });
}

function refreshCartBtns() {
  document.querySelectorAll('[data-cart-add]').forEach(b => {
    const inCart = cart.some(i => i.id === b.dataset.cartAdd);
    b.classList.toggle('in', inCart);
    b.textContent = inCart ? '🛒' : '＋';
    b.title = inCart ? 'In cart' : 'Add to cart';
  });
}

function openCart()  {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-drawer')?.classList.add('open');
  renderCartDrawer();
}
function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.getElementById('cart-drawer')?.classList.remove('open');
}

function initCartDrawer() {
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);
}

function renderCartDrawer() {
  const body   = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty"><span class="bi">🛒</span><p>Your cart is empty</p></div>`;
    if (footer) footer.style.display = 'none';
    return;
  }
  if (footer) footer.style.display = '';
  const total = cart.reduce((s, i) => s + i.price, 0);
  body.innerHTML = cart.map(item => {
    const tpl     = (SITE?.templates || []).find(t => t.id === item.id) || {};
    const phClass = item.id === 'hello-kitty' ? 'hk' : 'hp';
    const bg      = phClass === 'hk' ? 'linear-gradient(135deg,#fff0f4,#f4eeff)' : 'linear-gradient(135deg,#f5eee8,#f0ece0)';
    return `
      <div class="cart-item">
        <div class="cart-item-thumb">
          ${tpl.media?.thumbnail
            ? `<img src="${ROOT}${tpl.media.thumbnail}" onerror="this.style.display='none';this.nextElementSibling.style.background='${bg}'">`
            : ''}
          <div class="cart-item-ph ${phClass}" style="${tpl.media?.thumbnail ? 'display:none' : `background:${bg}`}">${item.emoji}</div>
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.emoji} ${item.name}</div>
          <div class="cart-item-price">${item.currency}${item.price}</div>
        </div>
        <span class="cart-item-remove" onclick="removeFromCart('${item.id}')">✕</span>
      </div>`;
  }).join('');
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `₹${total}`;
}

function checkoutCart() {
  if (!cart.length) return;
  closeCart();
  window.location.href = (isPages ? '' : 'pages/') + 'checkout.html';
}

// ═══════════════════════════════════════════════════════
//  TEMPLATE CARDS
// ═══════════════════════════════════════════════════════
function buildCard(t) {
  const isFav  = favSet.has(t.id);
  const inCart = cart.some(i => i.id === t.id);
  const ph     = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const bg     = ph === 'hk' ? 'linear-gradient(135deg,#fff0f4,#f4eeff,#eef4ff)' : 'linear-gradient(135deg,#f5eee8,#f0ece0,#eaeaf5)';
  const search = [t.name, ...(t.tags||[]), t.vibe||''].join(' ').toLowerCase();
  const detailUrl = `${ROOT}pages/template.html?t=${t.id}`;
  const addBtnLabel = inCart ? '🛒 In Cart' : '🛒 Add to Cart';

  const imgHTML = t.media?.thumbnail
    ? `<img class="t-thumb" src="${ROOT}${t.media.thumbnail}" alt="${t.name}" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.removeAttribute('style')">`
    : '';
  const phHTML = `<div class="t-ph ${ph}" ${t.media?.thumbnail ? 'style="display:none"' : `style="background:${bg}"`}>
    <span class="ph-emoji">${t.emoji}</span></div>`;

  return `
    <div class="t-card" data-id="${t.id}" data-search="${search}" onclick="location.href='${detailUrl}'">
      <div class="t-media">
        ${imgHTML}${phHTML}
        ${t.badge ? `<span class="t-badge ${t.badge.includes('New') ? 'new' : ''}">${t.badge}</span>` : ''}
        <div class="t-card-actions" onclick="event.stopPropagation()">
          <button class="card-icon-btn fav ${isFav?'on':''}" data-fav="${t.id}"
            onclick="toggleFav('${t.id}',event)">${isFav?'💖':'🤍'}</button>
        </div>
      </div>
      <div class="t-body">
        <div class="t-meta">
          <span class="t-name">${t.emoji} ${t.name}</span>
          <span class="t-price">${t.currency||'₹'}${t.price}</span>
        </div>
        <div class="t-tagline">${t.tagline}</div>
        <div class="t-card-btns" onclick="event.stopPropagation()">
          <button class="btn btn-outline" onclick="addToCart('${t.id}',event)">${addBtnLabel}</button>
          <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${t.id}',event); location.href='${ROOT}pages/checkout.html'">Create Surprise 🎁</button>
        </div>
      </div>
    </div>`;
}

function renderTemplateCards() {
  const g = document.getElementById('tpl-grid');
  if (!g) return;
  const cards = (SITE?.templates||[]).map(buildCard).join('');
  g.innerHTML = cards || '<div class="load-msg"><span>🌸</span>No templates found</div>';
}

function renderComingSoon() {
  const g = document.getElementById('cs-grid');
  if (!g) return;
  g.innerHTML = (SITE?.comingSoon||[]).map(c => `
    <div class="cs-card">
      <span class="cs-em">${c.emoji}</span>
      <div class="cs-name">${c.name}</div>
      <div class="cs-tag">${c.tagline}</div>
      <span class="cs-bdg">coming soon</span>
    </div>`).join('');
}

// ── Search ────────────────────────────────────────────
function handleSearch(q) {
  q = (q||'').toLowerCase().trim();
  document.getElementById('search-clear')?.classList.toggle('hidden', !q);
  const cards = document.querySelectorAll('.t-card');
  let n = 0;
  cards.forEach(c => {
    const match = !q || (c.dataset.search||'').includes(q);
    c.style.display = match ? '' : 'none';
    if (match) n++;
  });
  const lbl = document.getElementById('filter-label');
  const cnt = document.getElementById('filter-count');
  if (lbl) lbl.textContent = q ? 'Search Results' : 'All Templates';
  if (cnt) cnt.textContent = q ? `${n} found` : '';
}
function clearSearch() {
  const i = document.getElementById('search-inp');
  if (i) i.value = '';
  handleSearch('');
}

// ═══════════════════════════════════════════════════════
//  TEMPLATE DETAIL PAGE — with proper video player
// ═══════════════════════════════════════════════════════
function renderDetailPage() {
  const tid = new URLSearchParams(location.search).get('t');
  const t   = (SITE?.templates||[]).find(x => x.id === tid);
  const root = document.getElementById('detail-root');
  if (!root) return;
  if (!t) { root.innerHTML = '<p style="padding:120px 48px;color:var(--muted)">Template not found.</p>'; return; }

  document.title = `${t.name} — Pookie Wishes ✨`;
  const ph    = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const bg    = ph === 'hk' ? 'linear-gradient(135deg,#fff0f4,#f4eeff,#eef4ff)' : 'linear-gradient(135deg,#f5eee8,#f0ece0,#eaeaf5)';
  const vibeC = t.id === 'hello-kitty' ? 'v-cute' : 'v-magic';
  const isFav  = favSet.has(t.id);
  const inCart = cart.some(i => i.id === t.id);

  const hasVideo = !!t.media?.video;
  const hasThumb = !!t.media?.thumbnail;

  const mediaInner = hasVideo ? `
      <video id="detail-vid"
        src="${t.media.video}"
        ${hasThumb ? `poster="${ROOT}${t.media.thumbnail}"` : ''}
        preload="metadata"
        playsinline
        style="width:100%;height:100%;display:block;object-fit:cover">
      </video>
      <div class="vid-overlay" id="vid-overlay" onclick="vidTogglePlay()">
        <div class="vid-play-btn" id="vid-play-btn">▶</div>
      </div>
    `
    : hasThumb
    ? `<img src="${ROOT}${t.media.thumbnail}" alt="${t.name}" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="t-ph ${ph}" style="height:100%;${bg ? `background:${bg}` : ''}"><span style="font-size:5rem">${t.emoji}</span></div>`;

  const galItems = (t.media?.gallery||[]).filter(Boolean);
  const galHTML  = (hasVideo || galItems.length) ? `
    <div class="gallery-thumbs" id="gallery-thumbs">
      ${hasVideo ? `<div class="gallery-thumb active" id="gthumb-video" onclick="galShowVideo(this)" title="Play video">
        <div class="gph ${ph}" style="${bg ? `background:${bg}` : ''}">▶</div>
      </div>` : ''}
      ${galItems.map((img, i) => `
        <div class="gallery-thumb ${!hasVideo&&i===0?'active':''}" onclick="galShowImg('${ROOT}${img}',this)">
          <img src="${ROOT}${img}" loading="lazy" onerror="this.parentElement.style.display='none'">
        </div>`).join('')}
    </div>` : '';

  const featsHTML = (t.features||[]).map(f => `<div class="feat-item">${f}</div>`).join('');
  const tagsHTML  = (t.tags||[]).map(g => `<span class="tag">#${g}</span>`).join('');

  root.innerHTML = `
    <div class="detail-page">
      <a href="${ROOT}index.html" class="back-link">← All Templates</a>
      <div class="detail-grid">

        <!-- Media -->
        <div class="detail-media">
          <div class="media-player" id="media-player">${mediaInner}</div>
          ${galHTML}
          ${hasVideo ? `
          <div class="vid-controls" id="vid-controls">
            <button class="vc-btn" onclick="vidTogglePlay()" id="vc-play">▶</button>
            <div class="vc-progress-wrap" onclick="vidSeek(event)" id="vc-prog-wrap">
              <div class="vc-progress-bar"><div class="vc-progress-fill" id="vc-fill"></div></div>
              <div class="vc-thumb" id="vc-thumb"></div>
            </div>
            <div class="vc-time" id="vc-time">0:00</div>
            <button class="vc-btn" onclick="vidToggleMute()" id="vc-mute">🔊</button>
            <button class="vc-btn" onclick="vidFullscreen()">⛶</button>
          </div>` : ''}
        </div>

        <!-- Info -->
        <div class="detail-info">
          ${t.badge ? `<div class="detail-badge">${t.badge}</div>` : ''}
          <h1 class="detail-name">${t.emoji} ${t.name}</h1>
          <div class="detail-tagline">${t.tagline}</div>
          <span class="detail-vibe ${vibeC}">✦ ${t.vibe}</span>
          <p class="detail-desc">${t.longDesc || t.shortDesc}</p>
          <div class="detail-features">
            <div class="feat-title">What's included</div>
            <div class="feat-list">${featsHTML}</div>
          </div>
          <div class="detail-tags">${tagsHTML}</div>
          <div class="service-specs">
            <div class="spec-item"><strong>Output:</strong> Personalized digital webpage</div>
            <div class="spec-item"><strong>Delivery:</strong> Private shareable link</div>
            <div class="spec-item"><strong>Access:</strong> Mobile & desktop access</div>
            <div class="spec-item"><strong>Time:</strong> Instant automated delivery</div>
          </div>
          <div class="price-row">
            <div class="price-amount">${t.currency||'₹'}${t.price}</div>
            <div class="price-note">One-time · Fully customised for your moment ✨<br>Instant delivery via private link.</div>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary btn-lg" style="flex:1"
              onclick="addToCart('${t.id}',event);setTimeout(()=>checkoutCart(),300)">
              Create Surprise 🎁
            </button>
            <button class="card-icon-btn fav ${isFav?'on':''}" data-fav="${t.id}"
              onclick="toggleFav('${t.id}',event)" style="width:44px;height:44px;font-size:1.1rem">
              ${isFav?'💖':'🤍'}
            </button>
            <button class="card-icon-btn cart-add ${inCart?'in':''}" data-cart-add="${t.id}"
              onclick="addToCart('${t.id}',event)" style="width:44px;height:44px;font-size:1.1rem">
              ${inCart?'🛒':'＋'}
            </button>
          </div>
        </div>
      </div>
    </div>`;

  if (hasVideo) initVideoPlayer();
}

// ── Video player ──────────────────────────────────────
function initVideoPlayer() {
  const vid = document.getElementById('detail-vid');
  if (!vid) return;

  vid.addEventListener('timeupdate', () => {
    if (!vid.duration) return;
    const pct = (vid.currentTime / vid.duration) * 100;
    const fill = document.getElementById('vc-fill');
    const thumb = document.getElementById('vc-thumb');
    if (fill)  fill.style.width = pct + '%';
    if (thumb) thumb.style.left  = pct + '%';
    const timeEl = document.getElementById('vc-time');
    if (timeEl) timeEl.textContent = fmtTime(vid.currentTime) + ' / ' + fmtTime(vid.duration);
  });

  vid.addEventListener('ended', () => {
    const playBtn = document.getElementById('vc-play');
    const overlay = document.getElementById('vid-overlay');
    const pbig    = document.getElementById('vid-play-btn');
    if (playBtn) playBtn.textContent = '▶';
    if (overlay) overlay.style.display = 'flex';
    if (pbig)    pbig.textContent = '▶';
  });

  vid.addEventListener('play',  () => {
    const playBtn = document.getElementById('vc-play');
    const overlay = document.getElementById('vid-overlay');
    if (playBtn) playBtn.textContent = '⏸';
    if (overlay) overlay.style.opacity = '0';
    setTimeout(() => { if (overlay && !vid.paused) overlay.style.display = 'none'; }, 300);
  });
  vid.addEventListener('pause', () => {
    const playBtn = document.getElementById('vc-play');
    const overlay = document.getElementById('vid-overlay');
    const pbig    = document.getElementById('vid-play-btn');
    if (playBtn) playBtn.textContent = '▶';
    if (overlay) { overlay.style.display = 'flex'; overlay.style.opacity = '1'; }
    if (pbig)    pbig.textContent = '▶';
  });
}

function fmtTime(s) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

function vidTogglePlay() {
  const vid = document.getElementById('detail-vid');
  if (!vid) return;
  vid.paused ? vid.play() : vid.pause();
}

function vidToggleMute() {
  const vid = document.getElementById('detail-vid');
  const btn = document.getElementById('vc-mute');
  if (!vid) return;
  vid.muted = !vid.muted;
  if (btn) btn.textContent = vid.muted ? '🔇' : '🔊';
}

function vidFullscreen() {
  const player = document.getElementById('media-player');
  if (player?.requestFullscreen) player.requestFullscreen();
  else if (player?.webkitRequestFullscreen) player.webkitRequestFullscreen();
}

function vidSeek(e) {
  const vid  = document.getElementById('detail-vid');
  const wrap = document.getElementById('vc-prog-wrap');
  if (!vid || !wrap || !vid.duration) return;
  const rect = wrap.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  vid.currentTime = pct * vid.duration;
}

function galShowVideo(el) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const player  = document.getElementById('media-player');
  const vid      = document.getElementById('detail-vid');
  const controls = document.getElementById('vid-controls');
  if (!player) return;
  const t = (SITE?.templates||[]).find(x => x.id === new URLSearchParams(location.search).get('t'));
  if (!t?.media?.video) return;
  const ph = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const bg = ph === 'hk' ? 'linear-gradient(135deg,#fff0f4,#f4eeff)' : 'linear-gradient(135deg,#f5eee8,#f0ece0)';
  player.innerHTML = `
    <video id="detail-vid" src="${t.media.video}"
      ${t.media?.thumbnail ? `poster="${ROOT}${t.media.thumbnail}"` : ''}
      preload="metadata" playsinline
      style="width:100%;height:100%;display:block;object-fit:cover"></video>
    <div class="vid-overlay" id="vid-overlay" onclick="vidTogglePlay()">
      <div class="vid-play-btn" id="vid-play-btn">▶</div>
    </div>`;
  if (controls) controls.style.display = 'flex';
  initVideoPlayer();
}

function galShowImg(src, el) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const player   = document.getElementById('media-player');
  const controls = document.getElementById('vid-controls');
  if (!player) return;
  const vid = document.getElementById('detail-vid');
  if (vid) vid.pause();
  player.innerHTML = `<img src="${src}" alt="gallery" style="width:100%;height:100%;object-fit:cover;display:block">`;
  if (controls) controls.style.display = 'none';
}

// ═══════════════════════════════════════════════════════
//  ORDER SAVING & CHECKOUT (Pro version)
// ═══════════════════════════════════════════════════════

// --- Loading feedback ---
function setLoading(state) {
  const btn = document.getElementById("submit-btn");
  if (!btn) return;

  if (state) {
    btn.disabled = true;
    btn.innerHTML = `<span class="loading-spinner"></span> Processing...`;
  } else {
    btn.disabled = false;
    btn.innerText = "Submit Order ✨";
  }
}


// --- Save order (structured format) ---
async function saveOrder(orderData) {
  if (!fbReady) {
    console.error("Firebase not ready");
    toast("Firebase not ready – order not saved", "err");
    throw new Error("Firebase not ready");
  }

  try {
    const db = firebase.firestore();
    const docRef = await db.collection("orders").add({
      user: {
        name: orderData.name,
        email: orderData.email
      },
      templateId: orderData.items[0]?.id || 'sorry', // Store at root for easy fetch ✨
      items: orderData.items,
      total: orderData.total,
      screenshot: orderData.screenshot,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("Order saved:", docRef.id);
    toast("Order saved successfully! ✅", "ok");
    return docRef.id;
  } catch (err) {
    console.error("Error saving order:", err);
    toast("Failed to save order: " + err.message, "err");
    throw err;
  }
}

// --- Main submit order (with progress updates) ---
const submitOrder = safeAsync(async () => {
  // Validate required fields
  const name  = getVal("f-name");
  const email = getVal("f-email");
  if (!name || !email) {
    toast("Fill all required fields ❌", "err");
    return;
  }

  // Validate cart
  if (!cart.length) {
    toast("Your cart is empty. Add a template first.", "err");
    return;
  }

  setLoading(true);
  const btn = document.getElementById("submit-btn");

  let screenshotURL = "";

  // Update button to show saving status
  if (btn) btn.innerHTML = `<span class="loading-spinner"></span> Saving order...`;

  const total = cart.reduce((sum, i) => sum + i.price, 0);
  const orderData = {
    name,
    email,
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      currency: item.currency,
      emoji: item.emoji
    })),
    total,
    screenshot: screenshotURL
  };

  const orderId = await saveOrder(orderData);

  // Clear local cart after successful order
  localStorage.removeItem('pookie_cart');
  cart = [];
  updateCartBadge();

  // Redirect with parameters so success page can adapt! ✨
  const encodedEmail = encodeURIComponent(email);
  window.location.href = `${ROOT}pages/order-success.html?id=${orderId}&email=${encodedEmail}`;
});

// --- Initialize checkout page (adds preview & submit listener)---
function initCheckout() {
  // Attach event listener to submit button if exists
  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) {
    submitBtn.addEventListener("click", submitOrder);
  }

  // Instant screenshot preview using URL.createObjectURL
  const screenshotInput = document.getElementById("f-screenshot");
  const previewImg = document.getElementById("ss-prev");
  if (screenshotInput && previewImg) {
    screenshotInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const url = URL.createObjectURL(e.target.files[0]);
        previewImg.src = url;
        // Optional: store previous URL to revoke later
        if (screenshotInput.dataset.prevUrl) {
          URL.revokeObjectURL(screenshotInput.dataset.prevUrl);
        }
        screenshotInput.dataset.prevUrl = url;
      } else {
        previewImg.src = "";
        if (screenshotInput.dataset.prevUrl) {
          URL.revokeObjectURL(screenshotInput.dataset.prevUrl);
          delete screenshotInput.dataset.prevUrl;
        }
      }
    });
  }
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
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay.open').forEach(o => {
      o.classList.remove('open');
    });
    document.body.style.overflow = '';
  }
});

// ═══════════════════════════════════════════════════════
//  NAVBAR
// ═══════════════════════════════════════════════════════
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () =>
    nav?.classList.toggle('scrolled', window.scrollY > 36), { passive: true });
}

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
function toast(msg, type = 'inf') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const icons = { ok:'✅', err:'❌', inf:'💬' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3000);
}

// ── Utils ─────────────────────────────────────────────
function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }

// --- Safe async wrapper (error handling) ---
function safeAsync(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (e) {
      console.error(e);
      toast("Something went wrong ❌", "err");
    }
  };
}

// ═══════════════════════════════════════════════════════
//  ANIMATIONS & REVEALS
// ═══════════════════════════════════════════════════════
function initReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        if (entry.target.classList.contains('stagger-in')) {
          Array.from(entry.target.children).forEach((child, i) => {
            setTimeout(() => child.classList.add('on'), i * 100);
          });
        }
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .stagger-in').forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  googleLogin, emailSignIn, emailRegister, resetPassword, doLogout,
  toggleFav, addToCart, removeFromCart, openCart, closeCart, checkoutCart,
  openModal, closeModal, toggleDd, closeDd,
  handleSearch, clearSearch,
  vidTogglePlay, vidToggleMute, vidFullscreen, vidSeek,
  galShowVideo, galShowImg,

  saveOrder,
  submitOrder,
  isAdmin,
  getCached,
  initReveals
});