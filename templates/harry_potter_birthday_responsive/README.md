# 🪄 Harry Potter Magical Birthday Project

A fully interactive, peak-level Harry Potter themed birthday experience with 8 magical stages.
All character images have transparent backgrounds — they look perfect on the dark wizarding theme.

---

## 📁 Project Structure

```
harry_potter_birthday/
├── index.html                    ← Open this in browser
├── style.css                     ← All styles & animations
├── app.js                        ← All JavaScript logic
├── README.md                     ← This file
├── images/                       ← All HP images (backgrounds removed)
│   ├── harry_broom.png           Harry Potter on broom (transparent)
│   ├── hermione.png              Hermione Granger (transparent)
│   ├── ron.png                   Ron Weasley (transparent)
│   ├── ron_owl.png               Ron with Scabbers (transparent)
│   ├── ron_sticker.png           Ron sticker version (transparent)
│   ├── draco.png                 Draco Malfoy (transparent)
│   ├── hagrid.png                Hagrid (transparent)
│   ├── hagrid2.png               Hagrid with plant (transparent)
│   ├── sorting_hat.png           Sorting Hat (transparent)
│   ├── hippogriff.png            Hippogriff (transparent)
│   ├── fawkes.png                Fawkes the Phoenix (transparent)
│   ├── niffler.png               Niffler (transparent)
│   ├── snitch.png                Golden Snitch (transparent)
│   └── cloak.png                 Invisibility Cloak (transparent)
└── user_content/                 ← CUSTOMIZE THIS FOLDER
    ├── config.json               🔧 Change name, messages, wishes here
    └── photos/
        ├── memory1.jpg           Replace with your photo
        ├── memory2.jpg           Replace with your photo
        └── memory3.jpg           Replace with your photo
```

---

## 🎂 The 8 Magical Stages

| # | Stage | Description |
|---|-------|-------------|
| 1 | **Welcome** | Cinematic intro with name, Harry on broom, Hermione, flying Snitch & Hippogriff |
| 2 | **Wish Cards** | 6 animated birthday wish cards from HP characters (Dumbledore, Harry, etc.) |
| 3 | **Your Story** | Horizontal comic-strip panels with character images, scanline effect |
| 4 | **Memories** | 3 flip cards — front shows symbol, back reveals your photos |
| 5 | **Word Hunt** | Interactive word search game — find HP character names |
| 6 | **Sorting Hat** | Click the hat, pick your Hogwarts house (Gryffindor/Slytherin/etc.) |
| 7 | **Scratch Card** | Scratch the magical parchment to reveal birthday wish message |
| 8 | **Final Letter** | Hogwarts acceptance letter style — tap envelope to open |

---

## ✏️ How to Customize

### Change the Birthday Person's Name
Open `user_content/config.json` — change the `"name"` field:
```json
{
  "name": "NIKHIL"
}
```

### Change Birthday Wish Cards
Edit the `wishCards` array in `config.json`. Each card has:
- `icon` — emoji
- `from` — who it's from
- `text` — the message (use `NAME` as placeholder, it gets replaced automatically)

### Add Your Personal Photos (Memory Cards)
Replace these 3 files with your own JPG photos:
- `user_content/photos/memory1.jpg`
- `user_content/photos/memory2.jpg`  
- `user_content/photos/memory3.jpg`

Keep the same filenames, just replace the images.

### Change the Final Letter
In `config.json` edit the `letter` section:
```json
"letter": {
  "title": "Happy Birthday, NAME! 🎂",
  "body": "Dear NAME,\n\nYour letter text here...\n\nMore paragraphs here.",
  "signature": "— With all our hearts 🪄❤️"
}
```
- Use `\n` for new line in the body text
- Use `NAME` anywhere — it auto-replaces with the person's name

### Change Scratch Card Message
Edit `scratchWish` in `config.json`:
```json
"scratchWish": "Your custom wish message here\n\nMore lines here."
```

---

## 🚀 How to Run

### Option 1 — Simple (Direct file open)
Double-click `index.html` — opens in browser directly.

> ⚠️ Note: Photos in flip cards and config.json loading require a local server (see below).

### Option 2 — Local Server (Recommended for full features)
```bash
# Python 3 (most computers have this)
cd harry_potter_birthday
python3 -m http.server 8000

# Then open in browser:
# http://localhost:8000
```

```bash
# Node.js alternative
npx serve .
```

---

## ✨ Features

- 🌟 **Animated star field** background with twinkling effect
- 🖱️ **Custom gold cursor** with sparkling wand trail
- 🦅 **Golden Snitch** flying across the entire screen continuously  
- 🎭 **14 transparent PNG character images** — Harry, Hermione, Ron, Draco, Hagrid, Sorting Hat, Hippogriff, Fawkes Phoenix, Niffler, Golden Snitch, Cloak & more
- 🎮 **Interactive word search** — find HP names, touch/mouse support
- 🎩 **Animated Sorting Hat** — pick your house with glow effects
- 🎁 **Canvas scratch card** — draw to reveal hidden message
- 🎉 **Confetti + sparkle bursts** on celebrations
- 📱 **Mobile responsive** — works on phones and tablets
- 🔧 **Fully customizable** via `config.json` — no coding needed
