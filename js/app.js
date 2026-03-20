// ═══════════════════════════════════════════════════════
//  POOKIE WISHES — app.js v5
//  Firebase Auth (Google + Email) · Cart · Favourites
//  Order Flow → EmailJS confirmation + Firebase storage
// ═══════════════════════════════════════════════════════

// ── Routing helpers ──────────────────────────────────
const isPages   = window.location.pathname.includes('/pages/');
const ROOT      = isPages ? '../' : '';
const DATA_URL  = ROOT + 'data/site.json';
const ORDER_URL = ROOT + 'pages/order.html';
const INDEX_URL = ROOT + 'index.html';

const PAGE = (() => {
  const p = window.location.pathname;
  if (p.includes('favorites'))     return 'favorites';
  if (p.includes('how-it-works'))  return 'how';
  if (p.includes('template'))      return 'detail';
  return 'home';
})();

// ── Global state ─────────────────────────────────────
let SITE      = null;   // full site.json data
let currentUser = null;
let favSet    = new Set();
let cart      = [];     // [{id, name, price, currency, emoji}]
let fbReady   = false;

// ── Boot ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  SITE = await loadSiteData();
  injectSiteConfig();
  initNavScroll();
  initCartDrawer();

  if (PAGE === 'home') {
    renderTemplateCards();
    renderComingSoon();
  }
  if (PAGE === 'detail') renderDetailPage();

  initFirebase();
  loadLocalCart();
  updateCartBadge();
});

// ═══════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════
async function loadSiteData() {
  try {
    const r = await fetch(DATA_URL);
    return await r.json();
  } catch { return { site:{}, templates:[], comingSoon:[], firebase:{}, emailjs:{} }; }
}

// Inject contact info from JSON into footer/header
function injectSiteConfig() {
  if (!SITE?.site) return;
  const s = SITE.site;
  document.querySelectorAll('[data-site-email]').forEach(el => el.textContent = s.email || '');
  document.querySelectorAll('[data-site-email-href]').forEach(el => el.href = `mailto:${s.email || ''}`);
  document.querySelectorAll('[data-site-insta]').forEach(el => { el.href = s.instagram || '#'; el.textContent = s.instagramHandle || '@pookiewish'; });
  document.querySelectorAll('[data-site-wa]').forEach(el => el.href = `https://wa.me/${(s.whatsapp||'').replace(/\D/g,'')}` );
  document.querySelectorAll('[data-site-name]').forEach(el => el.textContent = s.name || 'Pookie Wishes');
}

// ═══════════════════════════════════════════════════════
//  FIREBASE
// ═══════════════════════════════════════════════════════
function initFirebase() {
  if (!SITE?.firebase?.apiKey || SITE.firebase.apiKey.startsWith('YOUR')) {
    console.warn('[PW] Firebase config missing in site.json');
    if (PAGE === 'favorites') showFavLoginPrompt();
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(SITE.firebase);
    fbReady = true;

    firebase.auth().onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        await syncFavs(user.uid);
        updateAuthUI(user);
        if (PAGE === 'favorites') renderFavPage();
        else refreshFavBtns();
      } else {
        updateAuthUI(null);
        if (PAGE === 'favorites') showFavLoginPrompt();
        else refreshFavBtns();
      }
    });
  } catch (e) {
    console.warn('[PW] Firebase init error:', e.message);
  }
}

// ─── Google ───────────────────────────────────────────
async function googleLogin() {
  if (!fbReady) { toast('Auth not ready', 'err'); return; }
  try {
    await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    closeModal('modal-auth');
    toast('Welcome to Pookie Wishes! 🎉', 'ok');
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') toast('Google login failed', 'err');
  }
}

// ─── Email sign-in ────────────────────────────────────
async function emailSignIn() {
  const email = val('auth-email'), pw = val('auth-pw');
  if (!email || !pw) { toast('Enter email and password', 'err'); return; }
  try {
    await firebase.auth().signInWithEmailAndPassword(email, pw);
    closeModal('modal-auth'); toast('Welcome back! 🎉', 'ok');
  } catch (e) { toast(authErr(e.code), 'err'); }
}

// ─── Email register ───────────────────────────────────
async function emailRegister() {
  const email = val('auth-email'), pw = val('auth-pw');
  if (!email || !pw) { toast('Enter email and password', 'err'); return; }
  if (pw.length < 6) { toast('Password needs 6+ characters', 'err'); return; }
  try {
    await firebase.auth().createUserWithEmailAndPassword(email, pw);
    closeModal('modal-auth'); toast('Account created! 🎉', 'ok');
  } catch (e) { toast(authErr(e.code), 'err'); }
}

async function resetPassword() {
  const email = val('auth-email');
  if (!email) { toast('Enter your email first', 'err'); return; }
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    toast('Reset email sent! Check your inbox 📧', 'ok');
  } catch (e) { toast(authErr(e.code), 'err'); }
}

async function doLogout() {
  try { await firebase.auth().signOut(); } catch {}
  currentUser = null; favSet.clear();
  closeDd(); refreshFavBtns();
  if (PAGE === 'favorites') showFavLoginPrompt();
  toast('Logged out! 👋', 'inf');
}

function authErr(code) {
  const m = { 'auth/user-not-found':'No account found','auth/wrong-password':'Wrong password',
    'auth/email-already-in-use':'Email already registered','auth/invalid-email':'Invalid email',
    'auth/too-many-requests':'Too many attempts — try later','auth/network-request-failed':'Network error' };
  return m[code] || 'Something went wrong';
}

// ─── Auth UI ──────────────────────────────────────────
function updateAuthUI(user) {
  const $btn  = document.getElementById('btn-login');
  const $wrap = document.getElementById('u-wrap');
  const $av   = document.getElementById('u-av');
  if (user) {
    $btn?.classList.add('hidden');
    $wrap?.classList.remove('hidden');
    if ($av) {
      $av.src = user.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`;
      $av.onerror = () => { $av.src = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`; };
    }
    const n = document.getElementById('dd-uname'); if (n) n.textContent = user.displayName || user.email || 'Pookie ✨';
    const e = document.getElementById('dd-uemail'); if (e) e.textContent = user.email || '';
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
async function syncFavs(uid) {
  try {
    const doc = await firebase.firestore().collection('users').doc(uid).get();
    const remote = new Set(doc.exists ? (doc.data().favs || []) : []);
    const local  = new Set(JSON.parse(localStorage.getItem('pw_favs') || '[]'));
    favSet = new Set([...remote, ...local]);
    await saveFavs(uid);
  } catch {
    favSet = new Set(JSON.parse(localStorage.getItem('pw_favs') || '[]'));
  }
  refreshFavBtns();
}

async function saveFavs(uid) {
  const arr = [...favSet];
  localStorage.setItem('pw_favs', JSON.stringify(arr));
  if (!uid) return;
  try {
    await firebase.firestore().collection('users').doc(uid).set(
      { favs: arr, ts: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
  } catch {}
}

async function toggleFav(id, e) {
  if (e) e.stopPropagation();
  if (!currentUser) { openModal('modal-auth'); toast('Sign in to save favourites 💖', 'inf'); return; }
  favSet.has(id) ? favSet.delete(id) : favSet.add(id);
  await saveFavs(currentUser.uid);
  refreshFavBtns();
  if (PAGE === 'favorites') renderFavPage();
  toast(favSet.has(id) ? 'Added to favourites 💖' : 'Removed', favSet.has(id) ? 'ok' : 'inf');
}

function refreshFavBtns() {
  document.querySelectorAll('[data-fav]').forEach(b => {
    const on = favSet.has(b.dataset.fav);
    b.classList.toggle('on', on);
    b.textContent = on ? '💖' : '🤍';
  });
}

function showFavLoginPrompt() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  c.innerHTML = `<div class="fav-empty"><span class="big">💌</span>
    <h3>Sign in to see your favourites</h3>
    <p>Tap 💖 on any template to save it, then find them all here.</p>
    <button class="btn btn-primary btn-lg" onclick="openModal('modal-auth')">Sign In 💖</button></div>`;
}

function renderFavPage() {
  const c = document.getElementById('fav-cont');
  if (!c) return;
  if (!currentUser) { showFavLoginPrompt(); return; }
  const list = (SITE?.templates || []).filter(t => favSet.has(t.id));
  if (!list.length) {
    c.innerHTML = `<div class="fav-empty"><span class="big">🤍</span>
      <h3>No favourites yet</h3>
      <p>Tap 💖 on any template on the <a href="${INDEX_URL}" style="color:var(--pink)">home page</a> to save it here.</p></div>`;
    return;
  }
  c.innerHTML = `<div class="t-grid">${list.map(buildCard).join('')}</div>`;
  refreshFavBtns(); refreshCartBtns();
}

// ═══════════════════════════════════════════════════════
//  CART
// ═══════════════════════════════════════════════════════
function loadLocalCart() {
  const saved = localStorage.getItem('pw_cart');
  if (saved) {
    try { cart = JSON.parse(saved); } catch { cart = []; }
  }
  updateCartBadge();
  refreshCartBtns();
}

function saveCart() {
  localStorage.setItem('pw_cart', JSON.stringify(cart));
  updateCartBadge();
  refreshCartBtns();
  renderCartDrawer();
}

function addToCart(id, e) {
  if (e) e.stopPropagation();
  const tpl = (SITE?.templates || []).find(t => t.id === id);
  if (!tpl) return;
  if (cart.find(i => i.id === id)) { toast('Already in cart!', 'inf'); return; }
  cart.push({ id, name: tpl.name, price: tpl.price, currency: tpl.currency || '₹', emoji: tpl.emoji });
  saveCart();
  toast(`${tpl.emoji} ${tpl.name} added to cart!`, 'ok');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

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
    b.title = inCart ? 'In cart' : 'Add to cart';
    b.textContent = inCart ? '🛒' : '＋';
  });
}

function initCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  overlay?.addEventListener('click', closeCart);
}

function openCart()  { document.getElementById('cart-overlay')?.classList.add('open'); document.getElementById('cart-drawer')?.classList.add('open'); renderCartDrawer(); }
function closeCart() { document.getElementById('cart-overlay')?.classList.remove('open'); document.getElementById('cart-drawer')?.classList.remove('open'); }

function renderCartDrawer() {
  const body = document.getElementById('cart-body');
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
    const tpl = (SITE?.templates || []).find(t => t.id === item.id);
    const phClass = item.id === 'hello-kitty' ? 'hk' : 'hp';
    const imgHTML = tpl?.media?.thumbnail
      ? `<img src="${ROOT}${tpl.media.thumbnail}" alt="${item.name}" onerror="this.style.display='none';this.nextElementSibling.removeAttribute('style')">`
      : '';
    return `
      <div class="cart-item">
        <div class="cart-item-thumb">
          ${imgHTML}
          <div class="cart-item-ph ${phClass}" ${tpl?.media?.thumbnail ? 'style="display:none"' : ''}>${item.emoji}</div>
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

// ═══════════════════════════════════════════════════════
//  TEMPLATE CARDS
// ═══════════════════════════════════════════════════════
function buildCard(t) {
  const isFav    = favSet.has(t.id);
  const inCart   = cart.some(i => i.id === t.id);
  const phClass  = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const detailUrl= `${ROOT}pages/template.html?t=${t.id}`;
  const thumb    = t.media?.thumbnail;
  const search   = [t.name, ...(t.tags||[]), t.vibe||''].join(' ').toLowerCase();

  const imgHTML = thumb
    ? `<img class="t-thumb" src="${ROOT}${thumb}" alt="${t.name}" loading="lazy"
            onerror="this.style.display='none';this.nextElementSibling.removeAttribute('style')">`
    : '';
  const phHTML = `<div class="t-ph ${phClass}" ${thumb?'style="display:none"':''}>
    <span class="ph-emoji">${t.emoji}</span></div>`;

  return `
    <div class="t-card" data-id="${t.id}" data-search="${search}" onclick="location.href='${detailUrl}'">
      <div class="t-media">
        ${imgHTML}${phHTML}
        ${t.badge ? `<span class="t-badge">${t.badge}</span>` : ''}
        <div class="t-card-actions" onclick="event.stopPropagation()">
          <button class="card-icon-btn fav ${isFav?'on':''}" data-fav="${t.id}"
            onclick="toggleFav('${t.id}',event)" title="${isFav?'Remove fav':'Save fav'}">
            ${isFav?'💖':'🤍'}
          </button>
          <button class="card-icon-btn cart-add ${inCart?'in':''}" data-cart-add="${t.id}"
            onclick="addToCart('${t.id}',event)" title="${inCart?'In cart':'Add to cart'}">
            ${inCart?'🛒':'＋'}
          </button>
        </div>
      </div>
      <div class="t-body">
        <div class="t-meta">
          <span class="t-name">${t.emoji} ${t.name}</span>
          <span class="t-price">${t.currency||'₹'}${t.price}</span>
        </div>
        <div class="t-tagline">${t.tagline}</div>
        <div class="t-card-btns" onclick="event.stopPropagation()">
          <a href="${t.demoUrl}" target="_blank" rel="noopener" class="btn btn-outline">👀 Visit</a>
          <button class="btn btn-primary" onclick="openOrderModal('${t.id}')">Buy Now 🎁</button>
        </div>
      </div>
    </div>`;
}

function renderTemplateCards() {
  const g = document.getElementById('tpl-grid');
  if (!g) return;
  g.innerHTML = (SITE?.templates||[]).map(buildCard).join('');
}

function renderComingSoon() {
  const g = document.getElementById('cs-grid');
  if (!g) return;
  g.innerHTML = (SITE?.comingSoon||[]).map(c=>`
    <div class="cs-card">
      <span class="cs-em">${c.emoji}</span>
      <div class="cs-name">${c.name}</div>
      <div class="cs-tag">${c.tagline}</div>
      <span class="cs-bdg">coming soon</span>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════
//  TEMPLATE DETAIL PAGE
// ═══════════════════════════════════════════════════════
function renderDetailPage() {
  const tid = new URLSearchParams(location.search).get('t');
  const t   = (SITE?.templates||[]).find(x => x.id === tid);
  if (!t) { document.getElementById('detail-root').innerHTML = '<p style="padding:120px 48px;color:var(--muted)">Template not found.</p>'; return; }

  document.title = `${t.name} — Pookie Wishes ✨`;
  const phClass  = t.id === 'hello-kitty' ? 'hk' : 'hp';
  const vibeC    = t.id === 'hello-kitty' ? 'v-cute' : 'v-magic';
  const isFav    = favSet.has(t.id);
  const inCart   = cart.some(i => i.id === t.id);

  // Media: video or thumbnail
  const mediaHTML = t.media?.video
    ? `<div class="media-player" id="media-player">
        <video id="detail-video" src="${ROOT}${t.media.video}" poster="${ROOT}${t.media.thumbnail||''}" preload="none" loop playsinline></video>
        <div class="media-play-btn" id="play-btn" onclick="toggleVideo()">
          <div class="play-circle">▶</div>
        </div>
       </div>`
    : t.media?.thumbnail
    ? `<div class="media-player"><img src="${ROOT}${t.media.thumbnail}" alt="${t.name}"></div>`
    : `<div class="media-player"><div class="t-ph ${phClass}" style="height:100%"><span class="ph-emoji">${t.emoji}</span></div></div>`;

  const galItems = (t.media?.gallery||[]);
  const galHTML = galItems.length ? `
    <div class="gallery-thumbs" id="gallery-thumbs">
      ${t.media?.video ? `<div class="gallery-thumb active" onclick="showThumb('video',this)" title="Video preview">
        <div class="gallery-ph ${phClass}">▶</div></div>` : ''}
      ${galItems.map((img,i)=>`
        <div class="gallery-thumb ${!t.media?.video&&i===0?'active':''}" onclick="showThumb('${ROOT}${img}',this)">
          <img src="${ROOT}${img}" loading="lazy" onerror="this.parentElement.style.display='none'">
        </div>`).join('')}
    </div>` : '';

  const featsHTML = (t.features||[]).map(f=>`<div class="feat-item">${f}</div>`).join('');
  const tagsHTML  = (t.tags||[]).map(g=>`<span class="tag">#${g}</span>`).join('');

  document.getElementById('detail-root').innerHTML = `
    <div class="detail-page">
      <a href="${INDEX_URL}" class="back-link">← All Templates</a>
      <div class="detail-grid">
        <div class="detail-media">
          ${mediaHTML}
          ${galHTML}
        </div>
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
          <div class="price-row">
            <div class="price-amount">${t.currency||'₹'}${t.price}</div>
            <div class="price-note">One-time · Personalised just for you<br>We contact you after order ✨</div>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary btn-lg" onclick="openOrderModal('${t.id}')">Buy Now 🎁</button>
            <button class="card-icon-btn fav ${isFav?'on':''}" data-fav="${t.id}"
              onclick="toggleFav('${t.id}',event)" title="Save favourite" style="width:44px;height:44px;font-size:1.1rem">
              ${isFav?'💖':'🤍'}
            </button>
            <button class="card-icon-btn cart-add ${inCart?'in':''}" data-cart-add="${t.id}"
              onclick="addToCart('${t.id}',event)" title="Add to cart" style="width:44px;height:44px;font-size:1.1rem">
              ${inCart?'🛒':'＋'}
            </button>
          </div>
          <a href="${t.demoUrl}" target="_blank" rel="noopener" class="btn btn-ghost btn-full" style="margin-top:8px">
            👀 Visit Live Demo
          </a>
        </div>
      </div>
    </div>`;
}

function toggleVideo() {
  const v = document.getElementById('detail-video');
  const btn = document.getElementById('play-btn');
  if (!v) return;
  if (v.paused) { v.play(); btn.style.display = 'none'; } else { v.pause(); btn.style.display = 'flex'; }
}

function showThumb(src, el) {
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const player = document.getElementById('media-player');
  if (!player) return;
  if (src === 'video') {
    const vid = document.getElementById('detail-video');
    if (vid) { player.innerHTML = ''; player.appendChild(vid); const btn = document.createElement('div'); btn.className='media-play-btn'; btn.id='play-btn'; btn.onclick=toggleVideo; btn.innerHTML='<div class="play-circle">▶</div>'; player.appendChild(btn); }
  } else {
    player.innerHTML = `<img src="${src}" alt="preview" style="width:100%;height:100%;object-fit:cover">`;
  }
}

// ═══════════════════════════════════════════════════════
//  ORDER MODAL
// ═══════════════════════════════════════════════════════
let orderFiles = [];
let orderTemplateId = null;

function openOrderModal(tid) {
  orderTemplateId = tid;
  orderFiles = [];
  const t = (SITE?.templates||[]).find(x => x.id === tid);
  if (!t) return;

  const modal = document.getElementById('modal-order');
  if (!modal) return;

  // Reset
  document.getElementById('order-step1').style.display = '';
  document.getElementById('order-step2').style.display = 'none';
  document.getElementById('order-step3').style.display = 'none';
  setOrderStep(1);
  document.getElementById('order-tname').textContent = `${t.emoji} ${t.name}`;
  document.getElementById('order-price').textContent = `${t.currency||'₹'}${t.price}`;

  // Clear fields
  ['ord-myname','ord-myphone','ord-bname','ord-bdate','ord-msg'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('upload-previews').innerHTML = '';

  openModal('modal-order');
}

function setOrderStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById(`ord-stp${i}`);
    if (!el) return;
    el.classList.remove('active','done');
    if (i===n) el.classList.add('active');
    if (i<n)  el.classList.add('done');
  });
}

// Photo upload
function initUpload() {
  const area = document.getElementById('upload-area');
  if (!area) return;
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('dragging'); });
  area.addEventListener('dragleave', ()=> area.classList.remove('dragging'));
  area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('dragging'); handleFiles(e.dataTransfer.files); });
  area.addEventListener('click', ()=> document.getElementById('file-input')?.click());
  const fi = document.getElementById('file-input');
  if (fi) fi.addEventListener('change', e => handleFiles(e.target.files));
}

function handleFiles(files) {
  const arr = [...files].filter(f => f.type.startsWith('image/'));
  const remaining = 4 - orderFiles.length;
  const toAdd = arr.slice(0, remaining);
  if (!toAdd.length) { toast('Max 4 photos allowed', 'err'); return; }
  toAdd.forEach(f => {
    if (f.size > 100 * 1024 * 1024) { toast(`${f.name} is over 100MB`, 'err'); return; }
    orderFiles.push(f);
    const reader = new FileReader();
    reader.onload = e => addUploadPreview(e.target.result, orderFiles.indexOf(f));
    reader.readAsDataURL(f);
  });
  toast(`${toAdd.length} photo${toAdd.length>1?'s':''} added ✅`, 'ok');
}

function addUploadPreview(src, idx) {
  const wrap = document.getElementById('upload-previews');
  if (!wrap) return;
  const div = document.createElement('div');
  div.className = 'upload-prev-item'; div.dataset.idx = idx;
  div.innerHTML = `<img src="${src}" alt="photo ${idx+1}">
    <div class="upload-prev-rm" onclick="removeUploadFile(${idx})">✕</div>`;
  wrap.appendChild(div);
}

function removeUploadFile(idx) {
  orderFiles.splice(idx, 1);
  const wrap = document.getElementById('upload-previews');
  if (wrap) wrap.innerHTML = '';
  orderFiles.forEach((f, i) => {
    const reader = new FileReader();
    reader.onload = e => addUploadPreview(e.target.result, i);
    reader.readAsDataURL(f);
  });
}

function proceedToReview() {
  const myname  = val('ord-myname');
  const myphone = val('ord-myphone');
  const bname   = val('ord-bname');
  const bdate   = val('ord-bdate');
  if (!myname||!myphone||!bname||!bdate) {
    toast('Please fill all required fields', 'err');
    ['ord-myname','ord-myphone','ord-bname','ord-bdate'].forEach(id=>{
      const el=document.getElementById(id); if(el&&!el.value.trim()) el.style.borderColor='#e8829a'; else if(el) el.style.borderColor='';
    });
    return;
  }
  const t = (SITE?.templates||[]).find(x=>x.id===orderTemplateId);
  const dateStr = bdate ? new Date(bdate+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}) : '—';
  const msg = val('ord-msg');
  window._orderData = { myname, myphone, bname, bdate: dateStr, msg, template: t?.name||orderTemplateId, emoji: t?.emoji||'🎂', price: `${t?.currency||'₹'}${t?.price||99}` };

  const preview = `🎂 New Pookie Wishes Order!\n\nTemplate: ${t?.emoji} ${t?.name} (${t?.currency||'₹'}${t?.price})\n\nCustomer: ${myname}\nWhatsApp: ${myphone}\n\nBirthday Person: ${bname}\nDate: ${dateStr}\n\nMessage: ${msg||'(none)'}\n\nPhotos: ${orderFiles.length} attached`;
  document.getElementById('ord-preview').innerHTML = preview.replace(/\n/g,'<br>');

  document.getElementById('order-step1').style.display = 'none';
  document.getElementById('order-step2').style.display = '';
  setOrderStep(2);
}

function goBackToStep1() {
  document.getElementById('order-step2').style.display = 'none';
  document.getElementById('order-step1').style.display = '';
  setOrderStep(1);
}

async function submitOrder() {
  const data = window._orderData;
  if (!data) return;

  const btn = document.getElementById('submit-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

  // 1. Save order to Firestore (so you can view it)
  await saveOrderToFirestore(data);

  // 2. Send confirmation email to customer via EmailJS
  await sendConfirmationEmail(data);

  // 3. Send to WhatsApp
  const waText = `🎂 *New Pookie Wishes Order!*\n\n*Template:* ${data.emoji} ${data.template} (${data.price})\n\n*Customer:* ${data.myname}\n*WhatsApp:* ${data.myphone}\n\n*Birthday Person:* ${data.bname}\n*Date:* ${data.bdate}\n\n*Message:* ${data.msg||'(none)'}\n\n📸 ${orderFiles.length} photo(s) to follow`;
  const waNum = (SITE?.site?.whatsapp||'918700113731').replace(/\D/g,'');
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`, '_blank');

  // 4. Show success
  setTimeout(() => {
    document.getElementById('order-step2').style.display = 'none';
    document.getElementById('order-step3').classList.add('show');
    setOrderStep(3);
    // Remove ordered items from cart
    cart = cart.filter(i => i.id !== orderTemplateId);
    saveCart();
  }, 500);
}

async function saveOrderToFirestore(data) {
  if (!fbReady) return;
  try {
    await firebase.firestore().collection('orders').add({
      ...data,
      userId: currentUser?.uid || null,
      photoCount: orderFiles.length,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { console.warn('[PW] Firestore order save failed:', e.message); }
}

async function sendConfirmationEmail(data) {
  const ejs = SITE?.emailjs;
  if (!ejs?.serviceId || ejs.serviceId.startsWith('YOUR')) {
    console.warn('[PW] EmailJS not configured — skipping email');
    return;
  }
  try {
    await emailjs.send(ejs.serviceId, ejs.templateId_order_confirm, {
      to_email:     data.myphone.includes('@') ? data.myphone : data.myphone,
      customer_name: data.myname,
      template_name: data.template,
      bday_name:    data.bname,
      bday_date:    data.bdate,
      message:      data.msg || '(none)',
      price:        data.price
    });
  } catch (e) { console.warn('[PW] EmailJS send failed:', e.message); }
}

// ═══════════════════════════════════════════════════════
//  MODALS
// ═══════════════════════════════════════════════════════
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (id === 'modal-order') initUpload();
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('click', e => {
  if (e.target.classList.contains('overlay')) { e.target.classList.remove('open'); document.body.style.overflow=''; }
});
document.addEventListener('keydown', e => {
  if (e.key==='Escape') { document.querySelectorAll('.overlay.open').forEach(o=>{o.classList.remove('open');}); document.body.style.overflow=''; }
});

// ═══════════════════════════════════════════════════════
//  NAVBAR + SEARCH
// ═══════════════════════════════════════════════════════
function initNavScroll() {
  const nav = document.querySelector('.navbar');
  window.addEventListener('scroll', () => nav?.classList.toggle('scrolled', scrollY > 36), {passive:true});
}

function handleSearch(q) {
  q = q.toLowerCase().trim();
  document.getElementById('search-clear')?.classList.toggle('hidden', !q);
  const cards = document.querySelectorAll('.t-card');
  let n = 0;
  cards.forEach(c => { const m = !q||(c.dataset.search||'').includes(q); c.style.display=m?'':'none'; if(m)n++; });
  const lbl = document.getElementById('filter-label');
  const cnt = document.getElementById('filter-count');
  if (lbl) lbl.textContent = q ? 'Search Results' : 'All Templates';
  if (cnt) cnt.textContent = q ? `${n} found` : '';
}
function clearSearch() { const i=document.getElementById('search-inp'); if(i)i.value=''; handleSearch(''); }

// ═══════════════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════════════
function toast(msg, type='inf') {
  const c = document.getElementById('toasts');
  if (!c) return;
  const icons = {ok:'✅',err:'❌',inf:'💬'};
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),300); }, 3000);
}

// ── Utils ────────────────────────────────────────────
function val(id) { return (document.getElementById(id)?.value||'').trim(); }

// ═══════════════════════════════════════════════════════
//  GLOBALS
// ═══════════════════════════════════════════════════════
Object.assign(window, {
  googleLogin, emailSignIn, emailRegister, resetPassword, doLogout,
  toggleFav, addToCart, removeFromCart, openCart, closeCart,
  openOrderModal, proceedToReview, goBackToStep1, submitOrder,
  openModal, closeModal, toggleDd, closeDd,
  handleSearch, clearSearch,
});
