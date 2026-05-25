const puppeteer = require('puppeteer');
const http = require('http');
const handler = require('serve-handler');

const server = http.createServer((request, response) => {
  return handler(request, response, { public: __dirname });
});

server.listen(8345, async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  page.on('pageerror', error => {
    console.error(`[BROWSER ERROR] ${error.message}`);
  });
  page.on('response', response => {
    const status = response.status();
    const isRedirect = status === 301 || status === 302;
    if (!response.ok() && !isRedirect) {
      console.error(`[BROWSER 404] ${response.url()}`);
    }
  });

  console.log('Testing /index.html...');
  await page.goto('http://127.0.0.1:8345/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Testing /pages/dashboard.html...');
  await page.goto('http://127.0.0.1:8345/pages/dashboard.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Testing /admin/index.html...');
  await page.goto('http://127.0.0.1:8345/admin/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  server.close();
  process.exit(0);
});
