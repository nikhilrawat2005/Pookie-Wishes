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
        if (templateId === 'sorry-template' || order.templateId === 'sorry-template') {
            return {
                recipientName: order.recipientName || "Pookie",
                senderName: order.buyerName || "Your Love",
                welcomeTitle: "FOR MY " + (order.recipientName || "POOKIE").toUpperCase() + " ✦",
                welcomeMainText: "I am really SORRY",
                welcomeSubText: "I made this specially just for you, for moments when you're mad. Take a deep breath, read slowly, and check what I made for you 🩷",
                letterTitle: "A LETTER FOR YOU ✦",
                letterBody: order.wishMessage || "I'm sorry for the moments I hurt you. You mean everything to me — and I just want your smile back. 🩷",
                specialCardTitle: "Official Pookie Voucher",
                songs: [
                    {
                        title: "Dagabaaz Re",
                        artist: "Rahat Fateh Ali Khan",
                        url: "dagabaaz re.mp3",
                        cover: "hello-kitty-i-love-you.gif" // Local fallback
                    }
                ]
            };
        }

        return order;

    } catch (err) {
        console.error("Loader Error:", err);
        return null; 
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
