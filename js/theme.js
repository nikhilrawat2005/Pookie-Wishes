// ─── Pookie Wishes · Theme System ──────────────────────────────────────────
// Runs inline (before DOMContentLoaded) to prevent flash of wrong theme.
(function () {
  var saved   = localStorage.getItem('pw_theme');
  var prefers = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  var theme   = saved || prefers;
  document.documentElement.setAttribute('data-theme', theme);
  applyTheme(theme);
})();

// ── Apply theme helper ───────────────────────────────────────────────────────
function applyTheme(theme) {
  // Set meta theme-color for mobile browsers
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  // Choose a suitable color based on the theme
  var color = theme === 'dark' ? '#0d0f1e' : '#fafbff';
  meta.setAttribute('content', color);
}

// ── Toggle ──────────────────────────────────────────────────────────────────
function toggleTheme() {
  var cur  = document.documentElement.getAttribute('data-theme') || 'light';
  var next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('pw_theme', next);
  _syncThemeIcons();
  applyTheme(next);
}

function _syncThemeIcons() {
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('.theme-icon').forEach(function (el) {
    el.textContent = isDark ? '☀️' : '🌙';
  });
  document.querySelectorAll('.theme-toggle-btn').forEach(function (btn) {
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title',      isDark ? 'Light Mode' : 'Dark Mode');
  });
}

// Sync icons on load
document.addEventListener('DOMContentLoaded', _syncThemeIcons);

// Auto-follow system preference only when user has NOT overridden manually
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('pw_theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      _syncThemeIcons();
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

window.toggleTheme = toggleTheme;
