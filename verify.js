const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3456' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function test() {
  try {
    // Test 1: index.html loads
    const home = await get('/');
    const homeOk = home.status === 200;
    const hasMarquee = home.body.includes('tpl-marquee-track');
    const hasMegaBtn = home.body.includes('btn-mega-glow');
    const hasModal = home.body.includes('modal-template-selector');
    const hasBirthday = home.body.includes("selectCategory('birthday')");
    const hasLove = home.body.includes("selectCategory('love')");
    const hasWishes = home.body.includes("selectCategory('wishes')");

    console.log('=== HOME PAGE ===');
    console.log('Loads OK:', homeOk);
    console.log('Has marquee track:', hasMarquee);
    console.log('Has mega button:', hasMegaBtn);
    console.log('Has selector modal:', hasModal);
    console.log('Has Birthday option:', hasBirthday);
    console.log('Has Love option:', hasLove);
    console.log('Has Wishes option:', hasWishes);

    // Test 2: app.js loads
    const appJs = await get('/js/app.js');
    const appOk = appJs.status === 200;
    const hasOpenModal = appJs.body.includes('function openModal');
    const hasSelectCat = appJs.body.includes('function selectCategory');
    const hasWindowAssign = appJs.body.includes('Object.assign(window');

    console.log('\n=== APP.JS ===');
    console.log('Loads OK:', appOk);
    console.log('Has openModal:', hasOpenModal);
    console.log('Has selectCategory:', hasSelectCat);
    console.log('Exposed on window:', hasWindowAssign);

    // Test 3: category.html loads (serve redirects .html -> no extension, follow redirect)
    const catRedir = await get('/pages/category.html');
    const cat = catRedir.status === 301
      ? await get('/pages/category')
      : catRedir;
    const catOk = cat.status === 200;
    const hasCatGrid = cat.body.includes('cat-grid');
    const hasCatLoader = cat.body.includes('category-loader.js');

    console.log('\n=== CATEGORY PAGE ===');
    console.log('Loads OK:', catOk);
    console.log('Has cat-grid:', hasCatGrid);
    console.log('Has category-loader.js:', hasCatLoader);

    // Test 4: CSS loads
    const css = await get('/css/style.css');
    const cssOk = css.status === 200;
    const hasMarqueeCss = css.body.includes('marquee-scroll');
    const hasMegaBtnCss = css.body.includes('btn-mega-glow');
    const hasSelectorCss = css.body.includes('template-selector-modal');

    console.log('\n=== CSS ===');
    console.log('Loads OK:', cssOk);
    console.log('Has marquee animation:', hasMarqueeCss);
    console.log('Has mega button styles:', hasMegaBtnCss);
    console.log('Has selector modal styles:', hasSelectorCss);

    // Test 5: data/site.json loads
    const data = await get('/data/site.json');
    const dataOk = data.status === 200;
    let templateCount = 0;
    try {
      const json = JSON.parse(data.body);
      templateCount = (json.templates || []).filter(t => !t.testing && !t.special).length;
    } catch(e) {}

    console.log('\n=== DATA ===');
    console.log('site.json loads OK:', dataOk);
    console.log('Non-special templates:', templateCount);

    console.log('\n=== OVERALL ===');
    const allPass = homeOk && hasMarquee && hasMegaBtn && hasModal && hasBirthday && hasLove && hasWishes
      && appOk && hasOpenModal && hasSelectCat && hasWindowAssign
      && catOk && hasCatGrid
      && cssOk && hasMarqueeCss && hasMegaBtnCss && hasSelectorCss
      && dataOk && templateCount > 0;
    console.log('All checks pass:', allPass);
    if (!allPass) process.exit(1);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}
test();
