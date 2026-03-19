# 🎂 Pookie Wish v3 — Setup & Deploy Guide

---

## ✅ What's Fixed in This Version

- **Firebase config properly placed** — your real keys are in `js/app.js`, no more `<script>` tags inside JS files
- **Firebase loaded correctly** — using compat SDKs via CDN in `index.html`
- **Soft white/pink/blue unisex design** — clean, calming, sweet
- **Order form** — 3-step with WhatsApp redirect to +918700113731
- **`firebase.json`** included — ready to deploy instantly

---

## 📁 File Structure

```
pookie-wish/
├── index.html              ← Main landing page
├── firebase.json           ← Firebase Hosting config (ready!)
├── css/style.css           ← All styles
├── js/app.js               ← Firebase auth + logic (config already in here!)
├── data/templates.json     ← Template content (edit to add new themes)
├── images/                 ← Put screenshots here:
│   ├── hello-kitty-preview.jpg
│   └── harry-potter-preview.jpg
└── pages/
    └── order.html          ← 3-step order form
```

---

## 📸 Add Your Preview Images

Take screenshots and save in `images/` folder:

| File | From |
|---|---|
| `images/hello-kitty-preview.jpg` | https://hellokittybirthday.vercel.app |
| `images/harry-potter-preview.jpg` | https://hp-template-tau.vercel.app |

Until images are added, a nice animated emoji placeholder shows. ✅

---

## 🚀 Deploy to Firebase (Step by Step)

**On your computer terminal/command prompt:**

```bash
# 1. Install Firebase CLI (one time only)
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Go into your project folder
cd pookie-wish

# 4. Link to your Firebase project
firebase use pookie-wish

# 5. Deploy!
firebase deploy
```

You'll get a URL like: `https://pookie-wish.web.app` ✨

**After deploy — add your domain to Firebase Auth:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add: `pookie-wish.web.app`

---

## ➕ Adding a New Template Later

**Step 1** — Add to `data/templates.json` in the `"templates"` array:
```json
{
  "id": "minecraft",
  "name": "Minecraft",
  "tagline": "Block Party Incoming! ⛏️",
  "badge": "New",
  "emoji": "⛏️",
  "price": "₹99",
  "demoUrl": "https://your-template.vercel.app/",
  "tags": ["gaming", "fun", "blocks"],
  "description": "Your description...",
  "features": ["⛏️ Feature 1", "🎮 Feature 2"],
  "vibe": "Gamer Vibes",
  "image": "images/minecraft-preview.jpg"
}
```

**Step 2** — Add to `pages/order.html` in the `TEMPLATES` object:
```js
'minecraft': {
  name: 'Minecraft Template', emoji: '⛏️',
  tagline: 'Block Party!', price: '₹99',
  demoUrl: 'https://your-template.vercel.app/',
  phClass: 'hk', // use 'hk' for light bg, 'hp' for warm bg
  features: ['⛏️ Feature 1'],
  image: '../images/minecraft-preview.jpg'
}
```

**Step 3** — Move it from `"comingSoon"` to `"templates"` in the JSON. Done! 🎉

---

## 🔒 Firestore Security Rules (set before going live)

Firebase Console → Firestore → Rules tab → Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

---

Made with 💖 by Pookie Wish
