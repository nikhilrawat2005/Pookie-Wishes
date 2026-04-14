// Pookie Wishes Dashboard Logic ✨
let db = null;

window.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to be ready (initialized in app.js)
  const waitFb = setInterval(() => {
    if (window.fbReady && window.firebase) {
      clearInterval(waitFb);
      db = firebase.firestore();
      initDashboard();
    }
  }, 100);
  setTimeout(() => clearInterval(waitFb), 5000);
});

async function initDashboard() {
  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      // Not logged in, redirect to home or show login?
      // For now, let's redirect to home with a toast
      location.href = '../index.html?auth=required';
      return;
    }

    // Update Profile UI
    document.getElementById('dash-av').src = user.photoURL || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.uid}`;
    document.getElementById('dash-name').textContent = user.displayName || 'Pookie ✨';
    document.getElementById('dash-email').textContent = user.email;
    document.getElementById('welcome-name').textContent = user.displayName?.split(' ')[0] || 'Pookie';

    // Load Data
    loadOrders(user.email);
    updateQuotaUI();
  });
}

async function loadOrders(email) {
  const loader = document.getElementById('orders-loader');
  const listEl = document.getElementById('orders-list');
  const emptyEl = document.getElementById('orders-empty');

  try {
    // We search both buyerEmail and user.email (just in case)
    // Firestore doesn't support OR queries easily without separate queries or collection group
    // So we'll fetch where buyerEmail matches.
    const snap = await db.collection('orders')
      .where('buyerEmail', '==', email)
      .orderBy('createdAt', 'desc')
      .get();

    if (loader) loader.style.display = 'none';

    if (snap.empty) {
      if (listEl) listEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    const orders = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(o => !o.trash);

    if (orders.length === 0) {
      if (listEl) listEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    renderOrders(orders);

    if (listEl) listEl.style.display = 'grid';
    if (emptyEl) emptyEl.style.display = 'none';

  } catch (e) {
    console.error("Dashboard Load Error:", e);
    if (loader) loader.innerHTML = `<p style="color:var(--pink)">Error loading surprises. Please refresh.</p>`;
  }
}

function renderOrders(orders) {
  const container = document.getElementById('orders-list');
  if (!container) return;

  container.innerHTML = orders.map(o => {
    const isPaid = o.status === 'paid' || o.status === 'delivered' || o.status === 'pending_verification';
    const isDelivered = o.deliveryStatus === 'delivered';
    const needsDetails = o.status === 'paid' && !o.detailsSubmitted;
    
    let statusCls = 'status-pending', statusTxt = 'Pending';
    if (isDelivered) { statusCls = 'status-ready'; statusTxt = 'Ready ✨'; }
    else if (needsDetails) { statusCls = 'status-action'; statusTxt = 'Details Needed ✏️'; }
    else if (isPaid) { statusCls = 'status-pending'; statusTxt = 'Processing...'; }

    // Multi-item support: if it's a multi-order, show count
    const itemCount = o.orders ? o.orders.length : (o.items ? o.items.length : 1);
    const templateName = o.templateName || (o.orders?.[0]?.templateName) || (o.items?.[0]?.name) || 'Pookie Surprise';
    const emoji = o.emoji || (o.orders?.[0]?.templateEmoji) || (o.items?.[0]?.emoji) || '🎁';
    const recipient = o.recipientName || (o.personalizations?.[0]?.recipientName) || 'Someone Special';

    // Link logic
    const successLink = `order-success.html?id=${o.id}&email=${encodeURIComponent(o.buyerEmail)}`;
    const deliveryLink = o.deliveryLink || (o.deliveryLinks ? o.deliveryLinks[0] : '#');

    return `
      <div class="order-card">
        <div class="order-status ${statusCls}">${statusTxt}</div>
        <div class="order-id">ID: ${o.id}</div>
        <div class="order-body">
          <div class="order-thumb">${emoji}</div>
          <div class="order-info">
            <div class="order-name">${templateName} ${itemCount > 1 ? `(+${itemCount-1})` : ''}</div>
            <div class="order-for">For: ${recipient}</div>
          </div>
        </div>
        <div class="order-actions">
          ${needsDetails ? `
            <a href="${successLink}" class="btn btn-primary btn-full" style="grid-column: span 2;">Complete Details 🚀</a>
          ` : `
            <button class="btn btn-soft" onclick="copyLink('${deliveryLink}')"><i data-lucide="copy" style="width:14px;"></i> Copy Link</button>
            <a href="${deliveryLink}" target="_blank" class="btn btn-primary">View Surprise</a>
          `}
        </div>
      </div>
    `;
  }).join('');
  
  if (window.lucide) lucide.createIcons();
}

async function updateQuotaUI() {
  const panel = document.getElementById('quota-panel');
  const countEl = document.getElementById('quota-count');
  if (!panel || !countEl) return;

  const waitQuota = setInterval(() => {
    if (window.USER_QUOTA_FETCHED) {
      clearInterval(waitQuota);
      const limit = (window.USER_MAX_QUOTA !== undefined) ? window.USER_MAX_QUOTA : (window.ACTIVE_OFFER_LIMIT || 0);
      if (limit > 0) {
        panel.style.display = 'flex';
        // count = delivered items
        countEl.textContent = `${window.USER_DELIVERED_COUNT}/${limit}`;
      }
    }
  }, 500);
}

function copyLink(link) {
  if (link === '#' || !link) {
    toast("Link not ready yet! 🪄", "inf");
    return;
  }
  navigator.clipboard.writeText(link);
  toast("Secret Link Copied! 💖", "ok");
}

function toast(msg, type = 'inf') {
  if (window.toast) {
    window.toast(msg, type);
  } else {
    alert(msg);
  }
}
