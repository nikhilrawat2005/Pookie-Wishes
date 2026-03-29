# Pookie Wishes 🎀 — Complete Setup Guide

> Personalised digital surprises — birthdays, proposals, anniversaries & more.

---

## 🚨 Action Required (External Steps You Must Do)

These are things that **cannot be done from code**. You must do these yourself on the external dashboards.

### ✅ Step A — Firestore Security Rules (MOST IMPORTANT)

> **Why?** Without this, the Admin Panel cannot read orders even if they are saved in Firebase.

1. Go to **[Firebase Console](https://console.firebase.google.com/)** → Your Project
2. Click **Firestore Database** in the left sidebar
3. Click the **Rules** tab at the top
4. **Delete everything** and paste this exactly:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Orders: anyone can create/update (for checkout & personalization form)
    // Only admins can read/delete
    match /orders/{orderId} {
      allow create, update: if true;
      allow read, delete: if request.auth != null &&
        request.auth.token.email in ['teamcipher.work@gmail.com', 'nikhil2005114@gmail.com'];
    }

    // Counters: public read/write needed for sequential order IDs (order1, order2...)
    match /counters/{doc} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

> ⚠️ If you skip this step, the Admin Panel will show blank even if orders exist in Firestore.

---

### ✅ Step B — Cloudinary Unsigned Upload Preset

> **Why?** Without this, photo uploads will silently fail.

1. Go to **[Cloudinary Console](https://console.cloudinary.com/)**
2. Click **Settings** (gear icon) → **Upload** tab
3. Scroll to **Upload Presets** → Click **Add upload preset**
4. Set:
   - **Preset name**: `pookie_unsigned` ← must be exactly this
   - **Signing Mode**: `Unsigned`
   - **Folder**: `orders` (optional but recommended)
5. Click **Save**

---

### ✅ Step C — EmailJS Template Variables

> **Why?** Admin notification emails won't send if template variables don't match.

1. Go to **[EmailJS Dashboard](https://www.emailjs.com/)** → **Email Templates**
2. Open your admin notification template (ID is in `site.json` → `templateId_admin`)
3. Make sure **all these variables** are used somewhere in the template body:

| Variable | What it contains |
|---|---|
| `{{order_id}}` | The order ID (e.g. `order1`) |
| `{{customer_email}}` | Buyer's email |
| `{{recipient_name}}` | Who the surprise is for |
| `{{wish_message}}` | The heartfelt message |
| `{{event_date}}` | Date of the event |
| `{{extra_instructions}}` | Any special notes |
| `{{photo_links}}` | Links to uploaded photos |
| `{{admin_link}}` | Direct link to Admin Panel |

4. Set **To Email** field to your admin email address
5. Click **Save**

---

### ✅ Step D — Verify `data/site.json` Keys

Open `data/site.json` and confirm all fields are filled:

```json
"emailjs": {
  "account1": {
    "publicKey": "YOUR_EMAILJS_PUBLIC_KEY",
    "serviceId": "YOUR_SERVICE_ID",
    "templateId_delivery": "YOUR_DELIVERY_TEMPLATE_ID",
    "templateId_admin": "YOUR_ADMIN_NOTIFICATION_TEMPLATE_ID"
  }
},
"firebase": {
  "apiKey": "...",
  "authDomain": "...",
  "projectId": "...",
  ...
}
```

---

## 🧪 How to Test (After All Steps Above)

1. Open your site → Add **Testing Pookie (₹0)** to cart
2. Go to Checkout → Enter name & email → Click **Submit**
3. You will land on the **Success Page** — fill recipient details + upload photos
4. Click **Complete Order**
5. **Admin Panel check**: Go to `/admin/index.html` → Login with `nikhil2005114@gmail.com`
   - Orders must appear in the table ✅
6. **Email check**: You should receive a notification email within seconds ✅

---

## ⚙️ Admin Panel Access

The Admin Panel only works for specific emails. They are hardcoded in `admin/index.html`:

```javascript
const ADMIN_EMAILS = ['teamcipher.work@gmail.com', 'nikhil2005114@gmail.com'];
```

If you need to add another email, add it to this array **and also** to the Firestore Rules in Step A.

---

## 🐛 Troubleshooting

| Problem | Most Likely Cause | Fix |
|---|---|---|
| **Admin Panel is blank/empty** | Firestore Rules not updated | Do **Step A** above — paste the new rules and publish |
| **Orders not saving** | Firestore Rules blocking writes | Check browser Console (F12) for red errors |
| **No admin email received** | Wrong template ID or missing variables | Do **Step C** — verify all `{{variables}}` in your template |
| **Photos not uploading** | Cloudinary preset wrong/missing | Do **Step B** — preset must be named `pookie_unsigned` and Unsigned |
| **"Access Denied" in Admin Panel** | Logged in with wrong Google account | Sign out and sign in with `nikhil2005114@gmail.com` |
| **Price shows ₹0 at checkout** | `site.json` loaded slowly | Refresh the page and try again |
