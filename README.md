# Pookie Wishes 🎀 — Complete Setup Guide

> Personalised digital surprises — birthdays, proposals, anniversaries & more. 

This guide contains the **complete** steps to set up your Firestore, Cloudinary, and EmailJS accounts to ensure the platform works perfectly.

---

## 🛠️ 1. Google Firebase Setup (Auth & Database)

Firebase handles your user logins and stores all order data.

### **A. Project Initialization**
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project named `Pookie Wishes`.
3. Enable **Authentication**: Go to *Build > Authentication > Get Started*. Enable **Google** and **Email/Password**.
4. Enable **Firestore Database**: Go to *Build > Firestore Database > Create Database*. Start in **Test Mode** (you will update rules later).

### **B. Configuration**
1. Go to **Project Settings** (Gear icon) > **Your Apps** > **Web App** (</> icon).
2. Register the app and copy the `firebaseConfig` object.
3. Open `data/site.json` in your code and paste these values into the `"firebase"` section.

### **C. Security Rules (CRITICAL)**
Go to the **Rules** tab in Firestore and paste these rules. These allow you to see orders in the Admin Panel:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      // Allow anybody to create an order or update it (for the personalization form)
      allow create, update: if true;
      // ONLY allow Admins to read or delete orders
      allow read, delete: if request.auth != null && 
        request.auth.token.email in ['teamcipher.work@gmail.com', 'nikhil2005114@gmail.com'];
    }
  }
}
```

---

## 📸 2. Cloudinary Setup (Photo Uploads)

Cloudinary stores the photos your customers upload.

1. Create a free account at [Cloudinary](https://cloudinary.com/).
2. Copy your **Cloud Name** from the dashboard.
3. Open `pages/order-success.html`, find `CLOUDINARY_CLOUD_NAME` and paste your name.
4. **Create Unsigned Preset**:
   - Go to **Settings** (Gear icon) > **Upload**.
   - Scroll to **Upload presets** > **Add upload preset**.
   - Name: `pookie_unsigned` (Must be exactly this).
   - Signing Mode: **Unsigned**.
   - Folder: `orders` (Optional but recommended).
   - Click **Save**.

---

## 📧 3. EmailJS Setup (Notifications & Delivery)

EmailJS sends the emails when a new order arrives and when you deliver the site.

### **A. Configuration**
1. Create an account at [EmailJS](https://www.emailjs.com/).
2. Add a **Service** (GMAIL) and call it `service_pookie`.
3. In `data/site.json`, fill in the `emailjs` section:
   - `publicKey`: Found in *Account > API Keys*.
   - `serviceId`: Found in *Email Services* (e.g., `service_pookie`).

### **B. Admin Notification Template (`template_new_order`)**
1. Create a "New Order" template.
2. In `site.json`, set `templateId_admin` to this ID.
3. **Variables** you must use in the email body:
   - `{{order_id}}`
   - `{{customer_email}}`
   - `{{recipient_name}}`
   - `{{wish_message}}`
   - `{{event_date}}`
   - `{{extra_instructions}}`
   - `{{photo_links}}`
   - `{{admin_link}}`

### **C. Customer Delivery Template**
1. Create a "Delivery" template.
2. In `site.json`, set `templateId_delivery` to this ID.
3. **Variables**: `{{to_name}}`, `{{to_email}}`, `{{website_link}}`.

---

## ⚙️ 4. Admin Panel Access

The Admin Panel is protected. Only specific emails can see the orders.

1. Open `admin/index.html` and `js/app.js`.
2. Find the constant `ADMIN_EMAILS`.
3. Ensure **your Google Email** is included in this list:
   ```javascript
   const ADMIN_EMAILS = ['your-email@gmail.com', 'teamcipher.work@gmail.com'];
   ```

---

## 🧪 5. How to Test (Step-by-Step)

1. Open your site and add the **Testing Pookie** (₹0) to your cart.
2. Go to Checkout, enter your details, and click "Submit".
3. You will go straight to the **Success Page**.
4. Fill out the personalization form (Message, Date, Photos) and click "Complete Order".
5. **Check Admin Panel**: Go to `/admin/index.html` and login with your Admin Email. The order should appear!
6. **Check Email**: You should receive a notification email immediately.

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| **Admin Panel is Empty** | 1. Check if you are logged in with the *exact* email listed in `ADMIN_EMAILS`. 2. Check Firestore Rules (Step 1-C). |
| **No Admin Email Received** | 1. Check `site.json` for correct `serviceId` and `publicKey`. 2. Ensure your EmailJS Template ID matches `templateId_admin`. 3. Check your EmailJS "Email History" for errors. |
| **Photos Not Showing** | Ensure the Cloudinary preset is named `pookie_unsigned` and set to **Unsigned**. |
| **Price shows ₹0 wrongly** | This happens if `site.json` takes long to load. Wait 1 second before clicking "Checkout". |
