# 🎀 Pookie Wishes — Premium Digital Surprises 🎀

Catch their heart with a personalized digital journey. **Pookie Wishes** is an all-in-one ecosystem for creating, selling, and delivering interactive, high-end surprise websites for birthdays, proposals, anniversaries, and more.

[![Live Demo](https://img.shields.io/badge/Live-Site-ff0f7b?style=for-the-badge&logo=vercel)](https://pookie-wishes.vercel.app)

---

## ✨ Why Pookie Wishes?

In a world of boring greeting cards, **Pookie Wishes** offers an immersive experience. Each template is a mini-game or story that leads to a heartfelt final message.

### 🌟 Key Features
- **Premium Templates**: Hello Kitty, Harry Potter, Celestial Universe, Among Us, and more.
- **Zero-Touch Automation**: Order confirmation, payment verification, and delivery are fully automated.
- **Admin Command Center**: Manage orders, track photos, and resend delivery emails with one click.
- **Personalisation Engine**: Buyers upload photos and write messages immediately after purchase.
- **Modern Aesthetics**: Glassmorphism, smooth GSAP animations, and responsive design for all devices.

---
---

## 🛠️ Tech Stack & Integrations

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+).
- **Backend/DB**: Firebase Firestore, Firebase Auth.
- **Payment Gateway**: Razorpay (Integrated via Python Vercel Functions).
- **Communication**: EmailJS (Automated delivery & admin alerts).
- **Asset Hosting**: Cloudinary (Automatic unsigned uploads).

---

## 🚀 Production Setup (Owner Guide)

To go live, follow these steps to configure your external services:

### 1️⃣ Firebase Configuration
- Create a project on [Firebase Console](https://console.firebase.google.com/).
- Enable **Firestore Database** and **Authentication** (Google Login).
- Update your keys in `data/site.json` under the `firebase` object.
- **Security Rules**: Paste the rules provided in Step 6 below.

### 2️⃣ Razorpay Gateway (Payments)
- Create a **Razorpay** account.
- Generate your **API Keys** (Key ID and Secret).
- **Environment Variables**: Add these to your Vercel/Hosting dashboard:
  - `RAZORPAY_KEY_ID`
  - `RAZORPAY_KEY_SECRET`

### 3️⃣ EmailJS Automation
- Set up two templates on [EmailJS](https://www.emailjs.com/):
  - **Delivery Template**: Sends the personalized link to the buyer.
  - **Admin Template**: Notifies you of new orders.
- Use variables like `{{order_id}}`, `{{customer_email}}`, and `{{wish_message}}`.

### 4️⃣ Cloudinary (Photos)
- Create a [Cloudinary](https://cloudinary.com/) account.
- Create an **Unsigned Upload Preset** named `pookie_unsigned`.
- Set the folder to `orders`.

### 5️⃣ Firestore Security Rules (Critical)
Paste this into your Firebase Rules tab:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow create, update: if true;
      allow read, delete: if request.auth != null && 
        request.auth.token.email in ['nikhil2005114@gmail.com', 'your-email@gmail.com'];
    }
    match /counters/{doc} {
      allow read, write: if true;
    }
  }
}
```

### 6️⃣ Email Marketing Setup (Broadcast)
To use the **Broadcast / Email Center** in the Admin Panel, you must configure Gmail SMTP:
1.  Go to your [Google Account Settings](https://myaccount.google.com/).
2.  Enable **2-Step Verification**.
3.  Search for **App Passwords**.
4.  Generate a new app password (e.g., named "Pookie Marketing").
5.  Add these to your **Vercel Environment Variables**:
    - `GMAIL_USER`: `teamcipher.work@gmail.com`
    - `GMAIL_APP_PASS`: Paste the 16-character code you generated.

---

---

## 💻 Local Development

1. Clone the repository.
2. Run `npx serve .` to preview.
3. Pricing and site details are managed in `data/site.json`.

---

## 📬 Contact & Support

Maintainer: **Team Cipher**
Instagram: [@pookiewish](https://www.instagram.com/pookiewish/)
Email: [teamcipher.work@gmail.com](mailto:teamcipher.work@gmail.com)

---

> "Don't just wish it. Pookie Wish it." 🎀
