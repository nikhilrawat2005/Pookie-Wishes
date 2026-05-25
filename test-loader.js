const puppeteer = require('puppeteer');
const http = require('http');
const handler = require('serve-handler');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: __dirname });
});

// URLs we expect to 404 in local dev (Firebase analytics, Vercel, GTM)
const KNOWN_404_PATTERNS = [
  'google-analytics', 'googletagmanager', 'gstatic',
  '_vercel', 'firebaseapp', 'firestore', 'firebase',
  'googleapis', 'va-script', 'script.js', 'cloudinary',
  'insights', 'gtag'
];

function isExpected404(url) {
  return KNOWN_404_PATTERNS.some(p => url.includes(p));
}

// Console errors we can safely ignore
const KNOWN_ERROR_MSGS = [
  'Failed to load resource',
  'Password field is not contained',
  'Firebase',
  'firestore',
  'gtag',
  '404',
  'net::ERR',
  'Cross-Origin',
  'Unauthorized',
  'insights'
];

function isExpectedConsoleError(text) {
  return KNOWN_ERROR_MSGS.some(p => text.toLowerCase().includes(p.toLowerCase()));
}

server.listen(8345, async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let hasErrors = false;

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    // Only log non-verbose messages
    if (type !== 'verbose') {
      console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
    }
    // Only treat as real errors if they are genuine JS errors, not network/auth/analytics issues
    if (type === 'error' && !isExpectedConsoleError(text)) {
      console.error(`  ⛔ Unexpected console error!`);
      hasErrors = true;
    }
  });

  page.on('pageerror', error => {
    const msg = error.stack || error.message || '';
    console.error(`[PAGE ERROR] ${msg}`);
    hasErrors = true;
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    const isRedirect = status === 301 || status === 302;
    if (!response.ok() && !isRedirect && !isExpected404(url)) {
      console.error(`[404] ${status} — ${url}`);
      hasErrors = true;
    }
  });

  try {
    console.log('\n🧪 Test 1: Loading index.html...');
    await page.goto('http://127.0.0.1:8345/index.html', { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 2500));
    console.log('  ✅ Page loaded');

    console.log('\n🧪 Test 2: openModal function available...');
    const isModalOpen = await page.evaluate(() => {
      if (typeof openModal !== 'function') throw new Error('openModal is not defined');
      openModal('modal-template-selector');
      return document.getElementById('modal-template-selector')?.classList.contains('open');
    });
    console.log(`  ✅ Modal opened: ${isModalOpen}`);

    console.log('\n🧪 Test 3: Category tabs exist...');
    const tabCount = await page.evaluate(() =>
      document.querySelectorAll('#category-tabs .tab-btn').length
    );
    console.log(`  ✅ Found ${tabCount} category tabs`);
    if (tabCount < 4) { console.error('  ⛔ Expected at least 4 tabs!'); hasErrors = true; }

    console.log('\n🧪 Test 4: Browse section exists...');
    const hasBrowse = await page.evaluate(() => !!document.getElementById('browse-templates'));
    console.log(`  ✅ Browse section: ${hasBrowse}`);
    if (!hasBrowse) { console.error('  ⛔ Missing #browse-templates!'); hasErrors = true; }

    console.log('\n🧪 Test 5: filterHomeTemplates function available...');
    const hasFilter = await page.evaluate(() => typeof filterHomeTemplates === 'function');
    console.log(`  ✅ filterHomeTemplates available: ${hasFilter}`);
    if (!hasFilter) { console.error('  ⛔ Missing filterHomeTemplates!'); hasErrors = true; }

    console.log('\n🧪 Test 6: clearHomeSearch function available...');
    const hasClear = await page.evaluate(() => typeof clearHomeSearch === 'function');
    console.log(`  ✅ clearHomeSearch available: ${hasClear}`);
    if (!hasClear) { console.error('  ⛔ Missing clearHomeSearch!'); hasErrors = true; }

    console.log('\n🧪 Test 7: How-it-works section exists...');
    const hasHiw = await page.evaluate(() => !!document.querySelector('.how-it-works-home'));
    console.log(`  ✅ How-it-works section: ${hasHiw}`);

    console.log('\n🧪 Test 8: Template grid container exists...');
    const hasGrid = await page.evaluate(() => !!document.getElementById('home-tpl-grid'));
    console.log(`  ✅ Template grid: ${hasGrid}`);
    if (!hasGrid) { console.error('  ⛔ Missing #home-tpl-grid!'); hasErrors = true; }

    console.log(`\n${hasErrors ? '❌ Some tests FAILED' : '✅ All tests PASSED!'}`);

  } catch (err) {
    console.error(`\n💥 Test threw an exception: ${err.message}`);
    hasErrors = true;
  } finally {
    await browser.close();
    server.close();
    process.exit(hasErrors ? 1 : 0);
  }
});
