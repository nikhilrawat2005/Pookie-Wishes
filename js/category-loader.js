/**
 * Category Page Loader
 * Handles filtering and rendering templates for a specific category.
 */

function renderCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('c');
  const grid = document.getElementById('cat-grid');
  const title = document.getElementById('cat-title');
  const sub = document.getElementById('cat-sub');
  const chip = document.getElementById('cat-chip');

  if (!grid || !cat) {
    if (grid) grid.innerHTML = '<div class="load-msg"><span>🌸</span>Category not found.</div>';
    return;
  }

  // Ensure site data is available
  if (!window.SITE) {
    // Retry in a bit if data isn't ready
    setTimeout(renderCategoryPage, 100);
    return;
  }

  const all = SITE?.templates || [];
  const SPECIAL_IDS = ['love-trap', 'sorry'];
  
  let list = [];
  let name = '';
  let tagline = '';
  let emojiCode = '';

  if (cat === 'birthday') {
    list = all.filter(t => !t.special && !SPECIAL_IDS.includes(t.id));
    name = 'Birthday';
    emojiCode = 'Wishes';
    tagline = 'Magic for their special day. Each comes with interactive games and surprises.';
  } else if (cat === 'love' || cat === 'special') {
    list = all.filter(t => SPECIAL_IDS.includes(t.id));
    name = 'Special';
    emojiCode = 'Moments';
    tagline = 'Deeply personal experiences for proposals, anniversaries, or just because.';
  } else {
    list = all.filter(t => !t.special);
    name = 'Explore';
    emojiCode = 'Designs';
    tagline = 'Choose a design that fits their vibe.';
  }

  // Update header
  if (title) title.innerHTML = `${name} <em>${emojiCode}</em>`;
  if (sub) sub.textContent = tagline;
  if (chip) chip.textContent = `${list.length} Designs Available`;
  
  if (list.length === 0) {
    grid.innerHTML = '<div class="load-msg"><span>🌸</span>No templates found in this category.</div>';
    return;
  }

  // Render cards
  grid.innerHTML = list.map(buildCard).join('');
  
  // Refresh UI states (for favs and cart badges)
  if (typeof refreshFavBtns === 'function') refreshFavBtns();
  if (typeof refreshCartBtns === 'function') refreshCartBtns();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
