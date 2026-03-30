# 💜 Love Trap — Setup Guide

## Folder Structure
```
love_trap_project/
├── index.html          ← Main file (open this in browser)
├── content.json        ← Edit all text content here
├── assets/             ← All GIFs & images (already filled)
│   ├── angry.gif
│   ├── bear-love.gif
│   ├── bear-sticker.webp
│   ├── cat-blush.gif
│   ├── celebration.gif
│   ├── confetti.gif
│   ├── excited-cute.gif
│   ├── excited-dog.gif
│   ├── food.gif
│   ├── hello-kitty-love.gif
│   ├── kitty.png
│   ├── love-sticker.webp
│   ├── memory1.jpg
│   ├── memory2.jpg
│   ├── memory3.jpg
│   ├── monkey-shocked.gif
│   ├── run-cat.gif
│   └── sticker1.png
└── user_uploads/       ← Apni 3 photos yahan daalo
    ├── photo1.jpg
    ├── photo2.jpg
    └── photo3.jpg
```

## How to Personalise

### Step 1 — Apni Photos Add Karo
`user_uploads/` folder mein apni 3 photos daalo aur naam rakho:
- `photo1.jpg`
- `photo2.jpg`
- `photo3.jpg`

### Step 2 — Content Edit Karo (content.json)
`content.json` open karo aur badlo:
- `questions` — apne 3 sawaal
- `letter_lines` — apna personal letter
- `no_button_messages` — funny roast messages

**Note:** content.json ke changes directly HTML mein reflect nahi hote —
aapko index.html mein `CFG` object bhi usi hisaab se update karna hoga.

### Step 3 — Open / Deploy
- **Local:** `index.html` ko browser mein directly open karo
- **Online:** Netlify Drop use karo → https://app.netlify.com/drop
  - Poora folder drag-drop karo → free shareable link milega!

## Stages
1. 🫣 Hook screen
2. 😏 3 fun questions (one by one)
3. 🫦 Trap — YES/NO (NO button bhaag jaata hai)
4. 🥹 Acceptance
5. 🎮 Memory Match game (emoji pairs)
6. 🌸 Memory photos
7. 💌 Typewriter letter + proposal (NO button yahan bhi bhaag ta hai)
8. 🎊 Celebration + confetti

"Wanna See Again?" button poora restart karta hai from Stage 1.
