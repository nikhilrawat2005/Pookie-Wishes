# 🎂 Pookie Wishes — Setup Guide

---

## The Full Flow

```
Customer submits order + payment screenshot
        ↓
Email 1 → Customer: "Order received, verifying in 1-2 hrs"  [Account 1, Template 1]
Email 2 → You (nikhil2005114@gmail.com): "Verify this payment" [Account 2, Template 2]
        ↓
You verify payment → Admin Panel → "Send Form Link" button
        ↓
Email 3 → Customer: Google Form link + how to fill it  [Account 2, Template 3]
        ↓
Customer fills Google Form → Sheet updates → You get notification email
        ↓
You build website → Admin Panel → Enter link → "Send Delivery"
        ↓
Email 4 → Customer: website link only  [Account 1, Template 4]
```

---

## ⭐ ONLY THING REMAINING — Add EmailJS Public Keys

You've set up everything already! Just add the **Public Keys** for both EmailJS accounts to `data/site.json`.

### Where to find Public Keys:
- EmailJS Dashboard → Account → **General** → **Public Key** (it looks like `user_xxxxxxxxxx`)

### Update `data/site.json`:

```json
"emailjs": {
  "account1": {
    "publicKey": "PASTE_ACCOUNT1_PUBLIC_KEY_HERE",
    "serviceId": "service_xzo6x1l",
    "templateId_user_ack": "template_1aqnbiw",
    "templateId_delivery": "template_grv7vrj"
  },
  "account2": {
    "publicKey": "PASTE_ACCOUNT2_PUBLIC_KEY_HERE",
    "serviceId": "service_vbt862s",
    "templateId_admin_verify": "template_5msdu99",
    "templateId_form_link":    "template_5y8tzru"
  }
}
```

---

## Template Variables Reference

### Template 1 (Account 1 — `template_1aqnbiw`) — User Acknowledgement
Variables to add in EmailJS template:
```
{{to_name}}           → Customer's name
{{to_email}}          → Customer's email
{{order_id}}          → e.g. PW-1774123456
{{template_name}}     → e.g. 🎀 Hello Kitty
{{total_amount}}      → e.g. ₹99
{{bday_person_name}}  → Birthday person's name
{{bday_date}}         → Birthday date
{{needed_by}}         → Needed by date
{{order_lines}}       → Full order summary
```

### Template 2 (Account 2 — `template_5msdu99`) — Admin Verify
Variables:
```
{{to_email}}          → nikhil2005114@gmail.com (hardcoded)
{{order_id}}
{{buyer_name}}
{{buyer_email}}
{{buyer_phone}}
{{template_name}}
{{total_amount}}
{{bday_person_name}}
{{bday_date}}
{{needed_by}}
{{order_lines}}
{{screenshot_url}}    → Link to payment screenshot in Firebase Storage
{{submitted_at}}      → Timestamp
```

### Template 3 (Account 2 — `template_5y8tzru`) — Google Form Link
Variables:
```
{{to_name}}
{{to_email}}
{{order_id}}
{{template_name}}
{{bday_person_name}}
{{bday_date}}
{{needed_by}}
{{order_lines}}
{{google_form_link}}  → https://forms.gle/F2t9kw5QoGVhVxwr5
```

### Template 4 (Account 1 — `template_grv7vrj`) — Delivery
Variables:
```
{{to_name}}
{{to_email}}
{{order_id}}
{{template_name}}
{{bday_person_name}}
{{order_summary}}
{{website_link}}      → URL you enter in admin panel
// (QR removed from delivery email)
```

---

## Firebase Setup

### Already configured in site.json:
```json
"firebase": {
  "apiKey": "AIzaSyDSwNeLEDIuSOMeT-8vnPYifxax9NKj484",
  "authDomain": "pookie-wish.firebaseapp.com",
  "projectId": "pookie-wish",
  "storageBucket": "pookie-wish.firebasestorage.app",
  "messagingSenderId": "741136764035",
  "appId": "1:741136764035:web:ee7453e7b0dd2b489a9fb6"
}
```

### Enable in Firebase Console:
1. **Authentication** → Sign-in method → Enable: Google + Email/Password
2. **Firestore Database** → Create (test mode)
3. **Storage** → Enable (for screenshots + QR uploads)
4. **Authentication → Settings → Authorized domains** → Add:
   `pookie-wishes.vercel.app`

### Firestore Rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null
        && (request.auth.token.email == 'teamcipher.work@gmail.com'
         || request.auth.token.email == 'nikhil2005114@gmail.com');
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /screenshots/{f} {
      allow write: if true;
      allow read:  if request.auth != null;
    }
    match /qr-codes/{f} {
      allow read:  if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Google Form + Sheet

Already set in `site.json`:
- Form: `https://forms.gle/F2t9kw5QoGVhVxwr5`
- Sheet: `https://docs.google.com/spreadsheets/d/1txBWJqKVMilNRIUJitL2wiIYpZCOoCOLuSFOS91JonM`

**Enable email notifications on the form:**
Form → Responses tab → 3 dots → "Get email notifications for new responses" ✅

---

## Admin Panel

URL: `/admin/`

Authorised emails (set in `admin/index.html`):
- `teamcipher.work@gmail.com`
- `nikhil2005114@gmail.com`

**Workflow:**
1. New order → you get Email 2
2. Verify screenshot → Admin Panel → find order → **"Send Form Link Email"**
3. Customer fills form → you get Google Form notification
4. Build website → Admin Panel → enter link + upload QR → **"Send Delivery Email"**

---

## Deploy

```bash
# Option 1: Firebase Hosting
firebase deploy

# Option 2: Vercel (drag & drop)
# Go to vercel.com/new → drag the pookie-wishes folder
```

After deploy, add your domain to Firebase Authorized Domains.

---

## Adding New Templates

1. Upload video to Cloudinary → copy URL
2. Edit `data/site.json` → add to `"templates"` array
3. Add thumbnail to `media/your-template/thumbnail.jpg`
4. Redeploy

Made with 💖 — Pookie Wishes
