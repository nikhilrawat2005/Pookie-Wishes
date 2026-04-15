// ═══════════════════════════════════════════════════════════════
//  NINJA PATH — game.js
//  Phaser 3 single-scene platformer with scroll collectibles &
//  birthday ending sequence.
// ═══════════════════════════════════════════════════════════════

'use strict';

// ── CONSTANTS ────────────────────────────────────────────────────
const WORLD_WIDTH   = 6400;   // total level width (world/scrolling space)
const WORLD_HEIGHT  = 576;    // viewport & world height  (16:9 with 1024 wide)

// Dynamic width fits screen aspect perfectly: no letterboxing/blue bars!
const getDynamicWidth = () => Math.round(WORLD_HEIGHT * (window.innerWidth / window.innerHeight));

let VIEW_WIDTH      = getDynamicWidth();   // dynamically adapts to display
const VIEW_HEIGHT   = WORLD_HEIGHT;
const GRAVITY       = 900;
const PLAYER_SPEED  = 220;
const JUMP_VEL      = -520;

// Typewriter speed (ms per character)
const TYPEWRITER_MS = 50;

// Scroll messages — one per scroll item found in the level
const SCROLL_MESSAGES = [
  "I don't think you realize how easy you make things feel when you're around.",
  "Even on your worst days… you still show up.",
  "You've been the reason I smiled more times than I said.",
  "Some people exist. You leave impact."
];

// ── MAIN SCENE ───────────────────────────────────────────────────
class GameScene extends Phaser.Scene {

  constructor() {
    super({ key: 'GameScene' });
    this.coins       = 0;
    this.scrollIndex = 0;     // next message index
    this.scrollOpen  = false; // is scroll popup visible?
    this.gameOver    = false; // ending triggered?
  }

  // ── PRELOAD ─────────────────────────────────────────────────────
  preload() {
    // Animation frames
    for (let i = 1; i <= 8; i++)  this.load.image(`idle_${i}`, `frames/Idle/${String(i).padStart(2,'0')}.png`);
    for (let i = 1; i <= 8; i++)  this.load.image(`move_${i}`, `frames/Move/${String(i).padStart(2,'0')}.png`);
    for (let i = 1; i <= 12; i++) this.load.image(`jump_${i}`, `frames/Jump/${String(i).padStart(2,'0')}.png`);

    // Background layers (back → front)
    this.load.image('bg-sky',          'backs/sky.png');
    this.load.image('bg-far-clouds',   'backs/far-clouds.png');
    this.load.image('bg-far-mountains','backs/far-mountains.png');
    this.load.image('bg-mountains',    'backs/mountains.png');
    this.load.image('bg-near-clouds',  'backs/near-clouds.png');
    this.load.image('bg-trees',        'backs/trees.png');

    // Collectible scroll sprite
    this.load.image('scroll-sprite',   'backs/scroll_closed.png');

    // Final ending assets
    this.load.spritesheet('gate', 'backs/Gate.png', { frameWidth: 207, frameHeight: 284 });
    this.load.image('sign', 'backs/Sign.png');
  }

  // ── CREATE ──────────────────────────────────────────────────────
  create() {
    const W = WORLD_WIDTH;
    const H = WORLD_HEIGHT;

    // World physics bounds
    this.physics.world.setBounds(0, 0, W, H);

    // Background layers (drawn before everything else)
    this._buildBackground(W, H);

    // Platforms static group
    this.platforms = this.physics.add.staticGroup();
    this._buildLevel(W, H);

    // Define Phaser animations
    this._createAnimations();

    // Player sprite
    this.player = this._createPlayer(H);

    // Coins
    this.coinGroup = this.physics.add.staticGroup();
    this._placeCoinItems(H);

    // Scroll item collectibles
    this.scrollGroup = this.physics.add.staticGroup();
    this._placeScrollItems(H);

    // End-goal trigger zone
    this.endTrigger = this.physics.add.staticGroup();
    this._placeEndTrigger(W, H);

    // ── Physics interactions ──────────────────────────────────────
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.coinGroup,   this._collectCoin,   null, this);
    this.physics.add.overlap(this.player, this.scrollGroup, this._collectScroll, null, this);
    this.physics.add.overlap(this.player, this.endTrigger,  this._triggerEnding, null, this);

    // Camera — smooth lerp, scrolls across 6400-wide world
    this.cameras.main.setBounds(0, 0, W, H);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    // No deadzone — viewport is compact enough that a small deadzone causes jitter

    // ── Input ────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.W,
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // ── DOM UI event listeners ────────────────────────────────────
    document.getElementById('scroll-close-btn').addEventListener('click', () => this._closeScroll());
    document.getElementById('open-letter-btn').addEventListener('click',  () => this._showFinalLetter());
  }

  update() {
    if (this.gameOver || this.scrollOpen) return;

    const p        = this.player;
    const mobile   = window.mobileInput || {};
    const goLeft   = this.cursors.left.isDown   || this.wasd.left.isDown   || mobile.left;
    const goRight  = this.cursors.right.isDown  || this.wasd.right.isDown  || mobile.right;
    
    let goJump     = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                     Phaser.Input.Keyboard.JustDown(this.wasd.up);
    
    // Simulate 'JustDown' for mobile jump to avoid auto-bouncing if held
    if (mobile.up && !this._mobileUpLast) goJump = true;
    this._mobileUpLast = mobile.up;

    const onGround = p.body.blocked.down;

    // Horizontal movement with smooth deceleration
    if (goLeft) {
      p.setVelocityX(-PLAYER_SPEED);
      p.setFlipX(true);
    } else if (goRight) {
      p.setVelocityX(PLAYER_SPEED);
      p.setFlipX(false);
    } else {
      p.setVelocityX(p.body.velocity.x * 0.78);
    }

    // Jump
    if (goJump && onGround) p.setVelocityY(JUMP_VEL);

    // Animation state machine
    if (!onGround) {
      this._playAnim(p, 'jump');
    } else if (Math.abs(p.body.velocity.x) > 15) {
      this._playAnim(p, 'move');
    } else {
      this._playAnim(p, 'idle');
    }
    
    // Pre-open the final gate as soon as the player steps onto the final platform
    if (!this.gateOpened && this.endGate && p.x > 6050) {
      this.gateOpened = true;
      this.endGate.setFrame(1);
    }

    // ── Parallax background scroll ────────────────────────────────
    // tilePositionX is in "source pixel" space, so we divide by tileScaleX
    // to ensure the visual scroll speed matches the intended factor regardless
    // of how much the tile is scaled up (images are upscaled ~2.4× to fill height).
    const camX = this.cameras.main.scrollX;
    this.bgLayers.forEach(({ sprite, factor }) => {
      const sx = sprite.tileScaleX || 1;
      sprite.tilePositionX = (camX * factor) / sx;
    });
  }

  // ══════════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ══════════════════════════════════════════════════════════════

  // Play anim only if not already playing (avoids restart flicker)
  _playAnim(sprite, key) {
    if (sprite.anims.currentAnim?.key !== key) sprite.play(key, true);
  }

  // ── BACKGROUND ─────────────────────────────────────────────────
  // Builds image-based parallax using TileSprites.
  // Each layer is camera-fixed (scrollFactor 0) and its tilePositionX
  // is updated every frame in update() based on camera scroll.
  _buildBackground(W, H) {
    // Layer config: [textureKey, parallaxFactor, depth]
    // factor 0 = static,  factor 1 = scrolls with world (no parallax)
    const LAYERS = [
      { key: 'bg-sky',           factor: 0.0,  depth: -10 },  // furthest — static
      { key: 'bg-far-clouds',    factor: 0.05, depth: -9  },  // very slow drift
      { key: 'bg-near-clouds',   factor: 0.15, depth: -8  },  // slightly faster clouds
      { key: 'bg-far-mountains', factor: 0.2,  depth: -7  },  // distant peaks
      { key: 'bg-mountains',     factor: 0.35, depth: -6  },  // closer mountains
      { key: 'bg-trees',         factor: 0.6,  depth: -5  },  // closest — fastest
    ];

    // Store refs so update() can shift tilePositionX each frame
    this.bgLayers = [];

    // All source images are 240px tall; we want them to fill VIEW_HEIGHT (576px).
    // Setting tileScaleY stretches the tile vertically to cover the canvas exactly,
    // eliminating the seam that appears when the image tiles more than once.
    const IMG_H     = 240;
    const scaleY    = VIEW_HEIGHT / IMG_H;   // ~2.4 → stretches image to fill height

    LAYERS.forEach(({ key, factor, depth }) => {
      const tex    = this.textures.get(key);
      const imgW   = tex.getSourceImage().width;   // native image width (varies per layer)

      // Scale X proportionally so pixels stay square after the Y-stretch
      const scaleX = scaleY;

      const sprite = this.add.tileSprite(
        0, 0,
        4000,    // extended far beyond view width so it covers ultrawide displays effortlessly
        VIEW_HEIGHT,
        key
      )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(depth)
        .setTileScale(scaleX, scaleY);   // uniform scale — image fills height exactly

      this.bgLayers.push({ sprite, factor });
    });
  }

  // ── ANIMATIONS ────────────────────────────────────────────────
  _createAnimations() {
    this.anims.create({
      key: 'idle',
      frames: Array.from({ length: 8 },  (_, i) => ({ key: `idle_${i + 1}` })),
      frameRate: 10, repeat: -1
    });
    this.anims.create({
      key: 'move',
      // Start from frame 2 — frame 01 is a near-static key pose that causes
      // a visible "pause" stutter every time the loop resets.
      frames: Array.from({ length: 7 }, (_, i) => ({ key: `move_${i + 2}` })),
      frameRate: 12, repeat: -1
    });
    this.anims.create({
      key: 'jump',
      frames: Array.from({ length: 12 }, (_, i) => ({ key: `jump_${i + 1}` })),
      frameRate: 14, repeat: 0
    });
  }

  // ── PLAYER ────────────────────────────────────────────────────
  _createPlayer(H) {
    const player = this.physics.add.sprite(120, H - 140, 'idle_1');
    player.setScale(1.8);
    player.setCollideWorldBounds(true);
    player.setGravityY(GRAVITY);
    player.setDepth(10);
    player.play('idle');

    // Tighter hitbox for fair-feeling collisions
    player.body.setSize(player.width * 0.38, player.height * 0.72, true);
    player.body.setOffset(player.width * 0.31, player.height * 0.15);

    return player;
  }

  // ── LEVEL LAYOUT ──────────────────────────────────────────────
  _buildLevel(W, H) {
    const G = H;
    const PLAT_H = 24;   // platform height in pixels

    // ── Build a 16×64 pixel-art grass tile once ──────────────────
    // Uses Graphics.generateTexture() — produces a STATIC texture.
    // Making it 64px tall ensures TileSprite won't repeat the grass
    // vertically (since our thickest platform/ground is 48px).
    if (!this.textures.exists('grass_tile')) {
      const TW = 16;
      const TH = 64;
      const g  = this.add.graphics();

      // dirt body down to the bottom
      g.fillStyle(0x7a5230, 1);
      g.fillRect(0, 6, TW, TH - 6);

      // darker dirt patches repeating downwards
      g.fillStyle(0x5e3d1a, 1);
      g.fillRect(0, 10, TW, 6);
      g.fillStyle(0x6b4520, 1);
      for (let dy = 8; dy < TH; dy += 14) {
        g.fillRect(2, dy, 3, 2);
        g.fillRect(9, dy + 3, 4, 2);
        g.fillRect(5, dy + 5, 3, 2);
      }

      // grass base
      g.fillStyle(0x4a8a28, 1);
      g.fillRect(0, 4, TW, 4);
      // mid grass
      g.fillStyle(0x5aa030, 1);
      g.fillRect(0, 2, TW, 3);
      // bright grass rows
      g.fillStyle(0x72c040, 1);
      g.fillRect(0, 1, TW, 2);
      // top highlight row + scattered pixels
      g.fillStyle(0x90e050, 1);
      g.fillRect(0,  0, TW, 1);
      g.fillRect(1,  1, 2,    1);
      g.fillRect(6,  1, 2,    1);
      g.fillRect(12, 1, 2,    1);
      // grass blade tufts
      g.fillStyle(0x3a7820, 1);
      g.fillRect(3, 0, 1, 2);
      g.fillRect(8, 0, 1, 3);
      g.fillRect(13, 0, 1, 2);
      // brick shadow lines on dirt
      g.fillStyle(0x3a2210, 0.6);
      for (let dy = 9; dy < TH; dy += 16) {
        g.fillRect(0, dy, TW, 1);
        g.fillRect(8, dy, 1,  8);
      }

      // generateTexture → static texture
      g.generateTexture('grass_tile', TW, TH);
      g.destroy();
    }

    // Helper: platform as a TileSprite tiling the 16×16 grass tile
    const addPlat = (x, y, w, h = PLAT_H) => {
      // TileSprite isn't in the static physics group by default,
      // so we generate a flat coloured texture for the physics body
      // and layer a visual TileSprite on top.
      const visW = w;
      const visH = h;

      // Visual tile layer (no physics)
      const ts = this.add.tileSprite(x, y, visW, visH, 'grass_tile')
        .setOrigin(0, 0)
        .setDepth(4);

      // Invisible physics body the same size
      const bodyGfx = this.add.graphics();
      bodyGfx.fillStyle(0xffffff, 0.001);
      bodyGfx.fillRect(0, 0, visW, visH);
      const bodyKey = `pb_${x}_${y}`;
      bodyGfx.generateTexture(bodyKey, visW, visH);
      bodyGfx.destroy();

      const p = this.platforms.create(x + visW / 2, y + visH / 2, bodyKey)
        .setAlpha(0)   // invisible — visual is the TileSprite above
        .setImmovable(true)
        .refreshBody();
    };

    // ── Ground ──
    addPlat(0, G - 48, W, 48);

    // ── Platforms [x, y, width] ──
    [
      [300,  G-160, 180], [560,  G-240, 160], [780,  G-180, 200],
      [1050, G-270, 140], [1280, G-340, 180], [1500, G-280, 150], [1720, G-200, 200],
      [2000, G-310, 130], [2200, G-260, 160], [2420, G-320, 120],
      [2620, G-220, 300],
      [3000, G-280, 150], [3220, G-360, 140], [3440, G-300, 180], [3680, G-240, 160],
      [3900, G-200, 320], [4300, G-300, 150], [4520, G-380, 140], [4720, G-300, 180],
      [5000, G-240, 200], [5280, G-310, 160], [5500, G-260, 180], [5750, G-200, 250],
      [6050, G-180, 300],
    ].forEach(([x, y, w]) => addPlat(x, y, w));
  }

  // ── COINS ─────────────────────────────────────────────────────
  _placeCoinItems(H) {
    const G = H;
    [
      [340,G-200],[380,G-200],[420,G-200],
      [600,G-280],[640,G-280],
      [820,G-220],[870,G-220],
      [1090,G-310],[1130,G-310],
      [1320,G-380],[1360,G-380],[1400,G-380],
      [1550,G-320],
      [1760,G-240],[1800,G-240],
      [2040,G-350],[2080,G-350],
      [2250,G-300],
      [2660,G-260],[2720,G-260],[2780,G-260],
      [3060,G-320],[3100,G-320],
      [3260,G-400],
      [3480,G-340],[3520,G-340],
      [3940,G-240],[4000,G-240],[4060,G-240],
      [4560,G-420],[4600,G-420],
      [4760,G-340],
      [5040,G-280],[5080,G-280],
      [5320,G-350],
      [5800,G-240],[5840,G-240]
    ].forEach(([x, y]) => {
      const c = this._makeCoin(x, y);
      this.coinGroup.add(c, true);
    });
  }

  _makeCoin(x, y) {
    // Generate coin texture once
    if (!this.textures.exists('coin_tex')) {
      const rt = this.add.renderTexture(0, 0, 20, 20).setVisible(false);
      const g  = this.add.graphics();
      g.fillStyle(0xffd700, 1); g.fillCircle(10, 10, 10);
      g.fillStyle(0xffe84a, 1); g.fillCircle(8, 8, 5);
      g.fillStyle(0xfffce0, 0.9); g.fillCircle(7, 7, 2.5);
      rt.draw(g); rt.saveTexture('coin_tex');
      g.destroy(); rt.destroy();
    }

    const coin = this.physics.add.staticImage(x, y, 'coin_tex').setDepth(5);

    // Float tween
    this.tweens.add({
      targets: coin, y: y - 9,
      duration: 850 + Math.random() * 350,
      ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });
    return coin;
  }

  _collectCoin(player, coin) {
    // Disable body immediately so it can't be collected twice
    coin.body.enable = false;

    // Pop-scale animation — NO camera shake
    this.tweens.add({
      targets: coin,
      y:      coin.y - 28,
      alpha:  0,
      scaleX: 2.0,
      scaleY: 2.0,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => coin.destroy()
    });

    // Small sparkle burst (4 tiny dots)
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const spark = this.add.graphics().setDepth(20);
      spark.fillStyle(0xffd700, 1);
      spark.fillCircle(0, 0, 3);
      spark.x = coin.x;
      spark.y = coin.y;
      this.tweens.add({
        targets: spark,
        x: coin.x + Math.cos(angle) * 22,
        y: coin.y + Math.sin(angle) * 22,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      });
    }

    this.coins++;
    document.getElementById('coin-count').textContent = this.coins;
  }

  // ── SCROLLS ───────────────────────────────────────────────────
  _placeScrollItems(H) {
    const G = H;
    [
      [920,  G-220],
      [2100, G-350],
      [3700, G-280],
      [5600, G-300],
    ].forEach(([x, y]) => {
      this.scrollGroup.add(this._makeScroll(x, y), true);
    });
  }

  _makeScroll(x, y) {
    // scroll_closed.png is 260×280 — scale to ~44px tall for clean in-world size
    const NATIVE_H = 280;
    const TARGET_H = 44;
    const sc = TARGET_H / NATIVE_H;   // ≈ 0.157 — keeps aspect ratio exact

    const s = this.physics.add.staticImage(x, y, 'scroll-sprite')
      .setDepth(6)
      .setScale(sc)
      .refreshBody();   // ← sync physics body to the scaled size (not full 260×280)

    // Gentle float (exactly matches the coin animation)
    this.tweens.add({
      targets: s,
      y: y - 9,
      duration: 850 + Math.random() * 350,
      ease: 'Sine.easeInOut', yoyo: true, repeat: -1
    });
    return s;
  }

  _collectScroll(player, scroll) {
    if (this.scrollOpen) return;

    // Safely remove the scroll and stop its scaling tween to prevent crashes
    this.tweens.killTweensOf(scroll);
    scroll.disableBody(true, true);
    scroll.destroy();

    this.scrollOpen = true;

    // Halt player immediately so they don't slide while the popup is open
    player.setVelocity(0, 0);
    this._playAnim(player, 'idle');
    this.physics.pause();

    const msg = SCROLL_MESSAGES[this.scrollIndex % SCROLL_MESSAGES.length];
    this.scrollIndex++;

    const msgEl = document.getElementById('scroll-message');
    const btn   = document.getElementById('scroll-close-btn');

    msgEl.textContent = '';
    btn.classList.remove('btn-ready');

    // Delegate open animation to the DOM-side ScrollAnimator
    window.scrollAnim.open(`"${msg}"`, () => {
      this._typewriterText(msgEl, `"${msg}"`, btn);
    });
  }

  // Typewriter: writes text char-by-char before the cursor span
  _typewriterText(el, text, btn) {
    const cursorEl = document.getElementById('scroll-cursor');
    // Clear text but keep cursor span
    el.textContent = '';
    el.appendChild(cursorEl);
    cursorEl.classList.add('blinking');

    let i = 0;
    const txtNode = document.createTextNode('');
    el.insertBefore(txtNode, cursorEl);   // text goes before cursor

    const interval = setInterval(() => {
      txtNode.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        cursorEl.classList.remove('blinking');  // stop blinking when done
        setTimeout(() => btn.classList.add('btn-ready'), 150);
      }
    }, TYPEWRITER_MS);
  }

  _closeScroll() {
    // Unfreeze the game IMMEDIATELY
    this.scrollOpen = false;
    this.physics.resume();

    // Refocus the game canvas so keyboard controls work instantly
    // without requiring the user to manually click the game.
    this.game.canvas.focus();

    // Fire-and-forget: visual close animation plays out on its own
    window.scrollAnim.close();
  }

  // ── END TRIGGER ───────────────────────────────────────────────
  _placeEndTrigger(W, H) {
    // The final platform sits at y = H - 180, top surface at H - 180.
    const PLAT_TOP = H - 180;
    
    // The image assets contain transparent bottom padding; offsetting by +12 pixels plants them slightly behind the grass tile.
    const ITEM_Y = PLAT_TOP + 12;
    
    // Gate Placement (frame 0 = closed)
    this.endGate = this.physics.add.staticSprite(W - 120, ITEM_Y, 'gate', 0)
      .setOrigin(0.5, 1)
      .setScale(0.6)
      .setDepth(3.1)          // Place BEHIND the grass platform (which is depth 4) 
      .setFlipX(true);        // Flip so the gate swings towards the left/player

    // Sign Placement (to the left of the gate)
    const sign = this.add.image(W - 280, ITEM_Y, 'sign')
      .setOrigin(0.5, 1)
      .setScale(0.26)
      .setDepth(3.2);         // Place BEHIND the grass platform

    // Invisible trigger zone the player walks into (just in front of the gate)
    const gfx = this.add.graphics();
    gfx.fillStyle(0xffd700, 0.001);
    gfx.fillRect(0, 0, 100, PLAT_TOP);
    gfx.generateTexture('end_zone', 100, PLAT_TOP);
    gfx.destroy();

    const trigger = this.physics.add.staticImage(this.endGate.x - 40, PLAT_TOP / 2, 'end_zone');
    trigger.setAlpha(0).setDepth(1);
    this.endTrigger.add(trigger, true);
  }

  // ── ENDING ────────────────────────────────────────────────────
  _triggerEnding(player, trigger) {
    if (this.gameOver) return;
    this.gameOver = true;
    player.setVelocity(0, 0);
    this.physics.pause();
    
    // Open the gate (switch to frame 1)
    if (this.endGate) this.endGate.setFrame(1);

    this.time.delayedCall(700, () => {
      document.getElementById('end-overlay').classList.add('active');
    });
  }

  _showFinalLetter() {
    document.getElementById('end-overlay').style.display = 'none';
    window.letterAnim.open();
  }
}

// ═══════════════════════════════════════════════════════════════
//  PHASER CONFIG
// ═══════════════════════════════════════════════════════════════
const config = {
  type: Phaser.AUTO,

  // ── Scale: viewport is 1024×576 (16:9). Phaser scales THIS to fit
  // the browser window while preserving aspect ratio. The camera then
  // scrolls across the 6400-wide world. This is the correct approach.
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:      VIEW_WIDTH,    // viewport, NOT world width
    height:     VIEW_HEIGHT,   // viewport height
    parent:     'game-container',
  },

  backgroundColor: '#88c8f0',  // matches sky.png dominant colour — seamless letterbox
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug:   false
    }
  },
  scene: [GameScene],
  render: {
    pixelArt:    true,
    antialias:   false,
    roundPixels: true   // keeps pixel edges crisp when scaled
  }
};

const game = new Phaser.Game(config);

let initialPortrait = window.innerHeight > window.innerWidth;

// Keep aspect ratio perfectly aligned if the user resizes their browser window.
// On mobile, rotating the device can heavily mangle the Phaser FIT canvas, 
// so we cleanly reload the page if the orientation flips.
window.addEventListener('resize', () => {
  setTimeout(() => {
    const currentPortrait = window.innerHeight > window.innerWidth;
    if (initialPortrait !== currentPortrait) {
      // Device was rotated! Clean reload guarantees perfect fullscreen mapping.
      location.reload();
      return;
    }
    
    // For standard desktop window resizing:
    VIEW_WIDTH = getDynamicWidth();
    game.scale.setGameSize(VIEW_WIDTH, VIEW_HEIGHT);
    game.scale.refresh();
  }, 200); // Small delay lets mobile browsers settle their new innerWidth/innerHeight
});