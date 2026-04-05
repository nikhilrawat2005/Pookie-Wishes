// Universal zero-touch loader for Pookie Wishes templates.
// This script intercepts local user data fetches and grabs real data from Firestore.

window.getPookieData = async function(templateId) {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        // Fallback for local dev testing (loads user.json)
        return null;
    }

    try {
        // 1. Load Firebase configuration
        const siteRes = await fetch('../../data/site.json');
        if (!siteRes.ok) throw new Error('Failed to load site config');
        const siteData = await siteRes.json();

        // 2. Init Firebase logic
        if (!window.firebase) {
            console.error("Firebase SDK not loaded in template!");
            return null;
        }
        if (!firebase.apps.length) {
            firebase.initializeApp(siteData.firebase);
        }
        const db = firebase.firestore();

        // 3. Fetch Order
        const doc = await db.collection('orders').doc(orderId).get();
        if (!doc.exists) {
            showErrorSplash("Wish Not Found", "Oops! We couldn't find this Pookie Wish. Double check the link!");
            throw new Error("Order not found");
        }

        const order = doc.data();

        // 4. Check 30-Day Expiration Rule
        const createdAt = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
        const hostingExpiry = order.hostingExpiry?.toDate ? order.hostingExpiry.toDate() : new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000);
        const isLifetime = order.lifetime === true;
        
        const now = new Date();
        
        if (!isLifetime && now > hostingExpiry) {
            showExpirySplash(orderId);
            throw new Error("Expired");
        }

        // 5. Map fields per template
        const itemIdx = parseInt(urlParams.get('item') || '0');
        const pData = (order.personalizations && order.personalizations[itemIdx]) ? order.personalizations[itemIdx] : order;

        const template = templateId || pData.templateId || order.templateId;
        const recipient = pData.recipientName || order.recipientName || "Pookie";
        const sender = order.buyerName || "Your Love";
        const photos = pData.photos || order.photos || [];
        const message = pData.wishMessage || order.wishMessage || "Wishing you the best!";

        if (template === 'sorry') {
            return {
                recipientName: recipient,
                senderName: sender,
                welcomeTitle: "FOR MY " + recipient.toUpperCase() + " ✦",
                welcomeMainText: "I am really SORRY",
                welcomeSubText: "I made this specially just for you, for moments when you're mad. Take a deep breath, read slowly, and check what I made for you 🩷",
                letterTitle: "A LETTER FOR YOU ✦",
                letterBody: message,
                specialCardTitle: "Official Pookie Voucher",
                photos: photos,
                songs: [
                    {
                        title: "Dagabaaz Re",
                        artist: "Rahat Fateh Ali Khan",
                        url: "dagabaaz re.mp3",
                        cover: "hello-kitty-i-love-you.gif"
                    }
                ]
            };
        }

        if (template === 'hello-kitty') {
            return {
                name: recipient,
                letterGreeting: `My dearest ${recipient},`,
                letterBody: message,
                letterSign: `Forever yours, ${sender} 💝`,
                finalLetterGreeting: `My dearest ${recipient},`,
                finalLetterBody: "May this new year bring you everything your heart desires.",
                finalLetterPink: `Happy Birthday, my love. You deserve the world and so much more. 🎂✨`,
                wishes: [
                    { message: "Happy Birthday to you! 🎊💕", sticker: "assets/hello-kitty-i-love-you.gif", memory: photos[0] || "assets/kitty.png" },
                    { message: "You're perfect just the way you are! ✨🌸", sticker: "assets/hello-kitty-i-love-you.gif", memory: photos[1] || "assets/kitty_love_card.png" },
                    { message: "Endless joy and love! 💝🌟", sticker: "assets/giphy.gif", memory: photos[2] || "assets/cat_couple.png" }
                ]
            };
        }

        if (template === 'harry-potter') {
            return {
                name: recipient,
                intro: { badge: "✦ A Magical Birthday Experience ✦", tagline: "The wizarding world has been waiting to celebrate you..." },
                wishCards: [
                    { icon: "🧙‍♂️", from: "From Albus Dumbledore", text: "Happiness can be found even in the darkest of times — but today is made entirely of light." },
                    { icon: "⚡", from: "From Harry Potter", text: `You've got that rare kind of magic, ${recipient}. Happy Birthday! 🪄` },
                    { icon: "📚", from: "From Hermione Granger", text: "In every timeline, there's one person who makes the journey worth it. That's you. ✨" }
                ],
                flipCards: [
                    { frontSymbol: "🔮", caption: "The Day We Met ✨", photo: photos[0] || "assets/hedwig-cute.gif" },
                    { frontSymbol: "⚡", caption: "Our Best Adventure 🌟", photo: photos[1] || "assets/sorting-hat.png" },
                    { frontSymbol: "🦉", caption: "Always & Forever 💛", photo: photos[2] || "assets/snitch.gif" }
                ],
                scratchWish: `May this year bring you adventures that thrill you, love that holds you, and every dream you've dared to dream.\n\nHappy Birthday, ${recipient}! ❤️✨`,
                letter: {
                    title: `Happy Birthday, ${recipient}! 🎂`,
                    body: message,
                    signature: `— With all our hearts & magic, ${sender} 🪄❤️`
                }
            };
        }

        if (template === 'among-us') {
            return { targetName: recipient };
        }

        if (template === 'love-trap') {
            return {
                questions: ["Tum mujhe ignore toh nahi karte na? 🥺", "Sach sach — mujhe dekh ke smile aata hai na?", "Agar main ghayab ho jaau toh miss karoge? 💭"],
                letter_lines: ["Hey 💜", "", message, "", `Will you be mine? 💜`, "", `— ${sender}`],
                no_button_messages: ["Nahi?? 😤", "Pakdo isko!! 😡", "Galat answer bestie 💀", "Button bhaag raha hai 😅"],
                photos: [photos[0] || "assets/love-sticker.webp", photos[1] || "assets/kittyheart.webp", photos[2] || "assets/hello-kitty-love.gif"]
            };
        }

        if (template === 'celestial') {
            return {
                recipientName: recipient.toUpperCase(),
                senderName: sender,
                wishMessage: message
            };
        }

        return order;

    } catch (err) {
        console.error("Loader Error:", err);
        // Do not fail silently if they explicitly provided an ID but an error happened!
        showErrorSplash("Access Denied or Error 🚨", "We hit a snag loading your surprise. Please check your data connection or ensure the link hasn't expired. <br><br><small style='opacity:0.6'>" + err.message + "</small>");
        throw err; // Stop execution
    }
};

function showExpirySplash(orderId) {
    document.body.innerHTML = `
        <div style="height:100vh; width:100vw; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#09090b; color:#fff; text-align:center; padding:20px; font-family:'Outfit', sans-serif;">
            <div style="font-size:4rem; margin-bottom:20px; animation:float 3s ease-in-out infinite;">✨⏳</div>
            <h1 style="background:linear-gradient(135deg, #ff2a85 0%, #ff7ea5 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; font-weight:900; font-size:2.5rem; margin-bottom:15px;">Memories Locked</h1>
            <p style="color:#a1a1aa; max-width:400px; line-height:1.6; margin-bottom:30px; font-size:1.1rem;">
                This Pookie Wish has completed its 30-day standard journey. To unlock it forever, upgrade to Lifetime Hosting.
            </p>
            <a href="https://wa.me/918700113731?text=Hi! I want to upgrade my order ${orderId} to Lifetime Hosting 💎" 
               style="background:#ff2a85; color:#fff; text-decoration:none; padding:16px 32px; border-radius:12px; font-weight:700; box-shadow:0 10px 20px rgba(255,42,133,0.3); transition:all 0.3s;"
               onmouseover="this.style.transform='translateY(-2px) scale(1.02)'"
               onmouseout="this.style.transform='none'">
               Unlock Lifetime ✨ (₹100)
            </a>
            <style>
                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                body { margin:0; }
            </style>
        </div>
    `;
}

function showErrorSplash(title, subtext="") {
    // Halts template execution and shows a beautiful error screen
    document.body.innerHTML = `
        <div style="height:100vh; width:100vw; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#FFF5F7; text-align:center; padding:20px; font-family:sans-serif;">
            <div style="font-size:3rem; margin-bottom:10px;">✨</div>
            <h1 style="color:#FF6B81; font-weight:800; font-size:2rem; margin-bottom:10px;">${title}</h1>
            <p style="color:#4A1C24; opacity:0.7; max-width:400px; line-height:1.5;">${subtext}</p>
        </div>
    `;
    throw new Error(title);
}
