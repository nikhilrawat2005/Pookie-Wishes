# Pookie Wishes 🎀

> Personalised digital surprises — birthdays, proposals, anniversaries & more. Starting at ₹29.

---

## ✨ Features

- **Static Frontend**: Blazing fast HTML/CSS/JS architecture with zero backend maintenance.
- **Firebase Integration**: User authentication (Google/Email) and order saving via Firebase Firestore.
- **Razorpay Payments**: Secure and seamless payment checkout using the Razorpay Integration.
- **Automated Personalisation Collection**: Directly on the site post-payment. Photos are securely uploaded to **Cloudinary**, and text details directly map to Firebase.
- **EmailJS Integration**: Automated admin notifications for new orders and one-click delivery emails from the Admin Panel.

---

## 🎨 Template Gallery

| Template Name | Preview Image | Video Demo | Price |
|---|---|---|---|
| **Celestial Universe** ✨ | ![Celestial Placeholder](https://placehold.co/600x400/0b0b2e/white?text=Celestial+Universe+Preview) | [Watch Demo](https://res.cloudinary.com/dktx4woql/video/upload/v1774623999/gallexy_rvnjkc.mov) | ₹29 |
| **Love Trap** 💘 | ![Love Trap Placeholder](https://placehold.co/600x400/ff7eb3/white?text=Love+Trap+Preview) | [Watch Demo](https://res.cloudinary.com/dktx4woql/video/upload/v1774376488/Untitled_design_jdl9sl.mp4) | ₹39 |
| **Hello Kitty** 🎀 | ![Hello Kitty Placeholder](https://placehold.co/600x400/fff0f4/black?text=Hello+Kitty+Preview) | [Watch Demo](https://res.cloudinary.com/dktx4woql/video/upload/v1774022269/preview_z3mcd8.mp4) | ₹69 |
| **Harry Potter** ⚡ | ![Harry Potter Placeholder](https://placehold.co/600x400/1a1a1a/white?text=Harry+Potter+Preview) | [Watch Demo](https://res.cloudinary.com/dktx4woql/video/upload/v1774022365/preview_yvsyhy.mp4) | ₹69 |

---

## 🏗️ Project Structure

```
pookie-v3/
├── css/                ← Stylesheets
├── data/
│   └── site.json       ← Main configuration (Firebase config, templates, EmailJS keys)
├── js/
│   └── app.js          ← Frontend JS (Firebase auth, cart, UI logic)
├── pages/
│   ├── checkout.html   ← Checkout form (Pre-Payment - Name & Email)
│   ├── order-success.html ← Post-Payment form (recipient name, text, and Cloudinary photo upload)
│   └── ...other pages
├── admin/              ← Comprehensive order management Admin Panel
├── api/                ← Vercel serverless Python backend for Razorpay order generation
└── media/              ← Images and videos
```

---

## 🚀 Setup Guide

### Step 1 — Clone the repo

```bash
git clone https://github.com/nikhilrawat2005/Pookie-Wishes.git
cd pookie-v3
```

---

### Step 2 — Firebase Setup (Auth & Database)

> **Required for**: User authentication and saving complete order details, photos, and status tracking.

1. Go to: https://console.firebase.google.com
2. Create a project.
3. Enable **Authentication** (Google + Email/Password).
4. Enable **Firestore Database** (Start in test mode).
5. Go to **Project Settings → Your Apps → Web App**, copy the `firebaseConfig`.
6. Open `data/site.json` and paste your Firebase keys under the `"firebase"` section.

---

### Step 3 — Cloudinary Setup (For User Photo Uploads)

> **Required for**: Storing user-submitted photos directly from the frontend securely without needing a backend server.

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name** from the dashboard.
3. Open `pages/order-success.html`, scroll to the bottom, and replace `"YOUR_CLOUD_NAME"` with your actual Cloud Name.
4. Go to **Settings (Gear Icon) → Upload** in Cloudinary.
5. Scroll down to **Upload presets** and click **Add upload preset**.
6. Set the Name to `pookie_unsigned` and switch the Signing Mode to **Unsigned**.
7. Save the preset.

---

### Step 4 — EmailJS Setup (For Notifications & Delivery)

> **Required for**: Sending Team Cipher notification emails and customer delivery emails natively.

1. Create an account at [EmailJS](https://www.emailjs.com/).
2. Add an Email Service (e.g., Gmail) and name it `service_pookie`.
3. In `data/site.json`, under `"emailjs" : { "account1": { ... } }` fill in:
   - `"publicKey"`: Your EmailJS Public Key.
   - `"serviceId"`: Your Service ID (e.g. `service_pookie`).

**Template 1: Team Notification (New Order)**
1. Create a template named `template_new_order`.
2. Ensure the "To Email" is set to Team Cipher's email.
3. Include these variables in the template body: `{{order_id}}`, `{{customer_email}}`, `{{recipient_name}}`, `{{admin_link}}`.
4. Open `pages/order-success.html` and replace `"YOUR_EMAILJS_PUBLIC_KEY"` with your EmailJS Public Key. Ensure the service name matches.

**Template 2: Delivery Email (Admin Panel to Customer)**
1. Create a template for finalizing the order.
2. In `data/site.json`, set the `"templateId_delivery"` field under `emailjs.account1` to this Template's ID.
3. Use these variables in the template: `{{to_name}}`, `{{to_email}}`, `{{order_id}}`, `{{template_name}}`, `{{bday_person_name}}`, `{{order_summary}}`, `{{website_link}}`.

---

### Step 5 — Razorpay Payment Setup (Vercel Serverless)

1. Go to your Razorpay Dashboard and get your **Key ID** and **Key Secret**.
2. Add these to your Vercel Environment Variables:
   - `RAZORPAY_KEY_ID`: Your Key ID
   - `RAZORPAY_KEY_SECRET`: Your Key Secret

---

## 🌐 Deploy to Production

Deploy the repo to **Vercel** with the above environment variables. Vercel automatically deploys the `api/` folder as a serverless backend for Razorpay, ensuring seamless API integrations.

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| Photos not uploading to Cloudinary | Ensure the Upload Preset is strictly named `pookie_unsigned` and is set to **Unsigned** mode in Cloudinary Settings. |
| Firebase auth not working | Check Firebase console → Authentication is enabled and web app credentials are in `data/site.json` |
| Email notifications not firing | Check your EmailJS Dashboard logs. Verify that the correct Public Key and Service IDs match the scripts in `order-success.html` and `site.json`. |
