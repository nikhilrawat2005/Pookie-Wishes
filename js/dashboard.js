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
    // NOTE: We intentionally do NOT use .orderBy() here to avoid requiring
    // a composite Firestore index (buyerEmail + createdAt) which causes errors
    // if not manually created in Firebase Console. We sort client-side instead.
    const snap = await db.collection('orders')
      .where('buyerEmail', '==', email)
      .get();

    if (loader) loader.style.display = 'none';

    if (snap.empty) {
      if (listEl) listEl.style.display = 'none';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    // Filter trash, only include valid statuses, and sort by createdAt descending (client-side)
    const orders = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(o => !o.trash && ['paid', 'delivered', 'pending_verification'].includes(o.status))
      .sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() || 0;
        const tb = b.createdAt?.toMillis?.() || 0;
        return tb - ta;
      });

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
    // Show a more helpful error message with the actual error
    if (loader) loader.innerHTML = `<p style="color:var(--pink);font-size:0.85rem;">Could not load your orders. Check your internet connection and refresh.<br><span style="color:var(--dim);font-size:0.75rem;">${e.message}</span></p>`;
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
    const firstTemplateId = o.orders?.[0]?.templateId || 'default';
    const firstTheme = o.personalizations?.[0]?.theme || 'Default';

    // Link logic
    const successLink = `order-success.html?id=${o.id}&email=${encodeURIComponent(o.buyerEmail)}`;
    const deliveryLink = o.deliveryLink || (o.deliveryLinks ? o.deliveryLinks[0] : '#');

    return `
      <div class="order-card" id="order-card-${o.id}">
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
             <button class="btn btn-soft" style="color:var(--err);" onclick="deleteOrder('${o.id}')">Delete</button>
             <a href="${successLink}" class="btn btn-primary">Complete Details 🚀</a>
          ` : `
             <button class="btn btn-soft" onclick="copyLink('${deliveryLink}')"><i data-lucide="copy" style="width:14px;"></i> Copy Link</button>
             <a href="${deliveryLink}" target="_blank" class="btn btn-primary">View Surprise</a>
             <button class="btn btn-soft" onclick="toggleQR('${o.id}', '${deliveryLink}', '${firstTemplateId}', '${firstTheme}')" style="grid-column: span 2;"><i data-lucide="qr-code" style="width:14px;"></i> Generate QR Code</button>
          `}
        </div>
        ${!needsDetails ? `
        <div id="qr-container-${o.id}" class="qr-panel" style="display:none; margin-top:16px; background:var(--bg2); padding:16px; border-radius:var(--r); text-align:center; border:1px solid var(--bdr-pink); width:100%; position:relative; overflow:hidden;">
           <div id="qr-${o.id}" style="background:white; padding:12px; border-radius:12px; display:inline-block; margin-bottom:12px; box-shadow:var(--sh-md);"></div>
           <div style="font-size:0.85rem; color:var(--text); font-weight:700; margin-bottom:4px; position:relative; z-index:1;">Ready to Scan! ✨</div>
           <p style="font-size:0.7rem; color:var(--muted); margin-bottom:12px; position:relative; z-index:1;">Use any phone camera to scan and view the surprise.</p>
           <button class="btn btn-ghost btn-sm" style="width:100%; color:var(--pink); background:rgba(255,105,180,0.05);" onclick="window.downloadQRCode('qr-${o.id}', 'PookieSurprise-${o.id}.png')">
                <i data-lucide="download" style="width:12px; margin-right:4px;"></i> Download HQ Image
           </button>
        </div>
        ` : ''}
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

async function deleteOrder(id) {
  if (!confirm('Are you certain you want to delete this incomplete order? This cannot be undone.')) return;
  try {
    const btn = event.currentTarget;
    const oldText = btn.innerHTML;
    btn.innerHTML = 'Deleting...';
    btn.disabled = true;

    // Soft delete via update since normal users typically can't hard delete
    await db.collection('orders').doc(id).update({
      trash: true,
      status: 'deleted_by_user',
      deletedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    // Reload dashboard
    if (currentUser && currentUser.email) {
      loadOrders(currentUser.email);
    }
  } catch (e) {
    console.error(e);
    alert("Could not delete. Check internet or permissions.");
    event.currentTarget.innerHTML = 'Delete';
    event.currentTarget.disabled = false;
  }
}

// Make globally accessible
window.deleteOrder = deleteOrder;

window.toggleQR = function(id, link, templateId, themeName) {
    const panel = document.getElementById('qr-container-' + id);
    const qrDiv = document.getElementById('qr-' + id);
    if (!panel || !qrDiv) return;

    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        // Generate if not already present
        if (!qrDiv.hasChildNodes()) {
            const theme = window.getTemplateQRTheme(templateId || 'default', themeName || 'Default');
            new QRCode(qrDiv, {
                text: link,
                width: 140,
                height: 140,
                colorDark: theme.dotColor,
                colorLight: theme.bgColor,
                correctLevel: QRCode.CorrectLevel.H,
                quietZone: 10,
                dotScale: 0.8
            });
            if (window.lucide) lucide.createIcons();
        }
    } else {
        panel.style.display = 'none';
    }
};

