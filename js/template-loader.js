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
        const now = new Date();
        const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
        
        if (diffDays > 30) {
            showErrorSplash(
                "Time's Up! ⏳", 
                "This Pookie Wish has beautifully expired after 30 days to save space in the stars. ✨"
            );
            throw new Error("Expired");
        }

        // 5. Map fields per template
        const template = templateId || order.templateId;
        const recipient = order.recipientName || "Pookie";
        const sender = order.buyerName || "Your Love";
        const photos = order.photos || [];
        const message = order.wishMessage || "Wishing you the best!";

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
                    { message: "Happy Birthday to you! 🎊💕", sticker: "assets/hello-kitty-i-love-you.gif", memory: photos[0] || "assets/memory1.jpg" },
                    { message: "You're perfect just the way you are! ✨🌸", sticker: "assets/eyes.gif", memory: photos[1] || "assets/memory2.jpg" },
                    { message: "Endless joy and love! 💝🌟", sticker: "assets/giphy.gif", memory: photos[2] || "assets/memory3.jpg" }
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
                    { frontSymbol: "🔮", caption: "The Day We Met ✨", photo: photos[0] || "user_content/photos/memory1.jpg" },
                    { frontSymbol: "⚡", caption: "Our Best Adventure 🌟", photo: photos[1] || "user_content/photos/memory2.jpg" },
                    { frontSymbol: "🦉", caption: "Always & Forever 💛", photo: photos[2] || "user_content/photos/memory3.jpg" }
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
                photos: [photos[0] || "user_uploads/photo1.jpg", photos[1] || "user_uploads/photo2.jpg", photos[2] || "user_uploads/photo3.jpg"]
            };
        }

        if (template === 'celestial') {
            return {
                recipientName: recipient.toUpperCase(),
                senderName: sender,
                wishMessage: message,
                memoryPhotos: [
                    photos[0] || "./assets/405498876_d151cba1-8cd1-4512-9b0e-8ee86c0394b2-removebg-preview.png",
                    photos[1] || "./assets/406447035_17ac2c68-efd2-44d1-a0f2-72f5e3367264-removebg-preview.png",
                    photos[2] || "./assets/407747963_d3743ace-5292-4567-93ca-1b01a01b16e2-removebg-preview.png",
                    photos[0] || "./assets/images__4_-removebg-preview.png",
                    photos[1] || "./assets/images__5_-removebg-preview.png"
                ]
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
