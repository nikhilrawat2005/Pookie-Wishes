const fs = require('fs');
const path = require('path');

const HTML_FILE = 'templates/hoppers-template/index.html';
const ASSETS_DIR = 'assets/hoppers';
const RELATIVE_ASSETS_PATH = '../../assets/hoppers';

if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

let content = fs.readFileSync(HTML_FILE, 'utf8');
let assetCount = 0;

// Regex for data URIs
// Captures the extension and the base64 content
const dataUriRegex = /"data:image\/(png|jpeg|gif|webp|svg\+xml);base64,([^"]+)"/g;

content = content.replace(dataUriRegex, (match, mimeType, base64) => {
    assetCount++;
    let ext = mimeType === 'svg+xml' ? 'svg' : mimeType;
    if (ext === 'jpeg') ext = 'jpg';
    
    const fileName = `asset_${assetCount}.${ext}`;
    const filePath = path.join(ASSETS_DIR, fileName);
    
    // Convert base64 to buffer and save
    try {
        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(filePath, buffer);
        console.log(`[SAVED] ${filePath} (${buffer.length} bytes)`);
        
        // Return replacement path
        return `"${RELATIVE_ASSETS_PATH}/${fileName}"`;
    } catch (err) {
        console.error(`[ERROR] Failed to save asset ${assetCount}:`, err.message);
        return match; // Keep original if failed
    }
});

// Also handle url('data:image...') in CSS
const cssDataUriRegex = /url\(['"]?data:image\/(png|jpeg|gif|webp|svg\+xml);base64,([^'"]+)['"]?\)/g;

content = content.replace(cssDataUriRegex, (match, mimeType, base64) => {
    assetCount++;
    let ext = mimeType === 'svg+xml' ? 'svg' : mimeType;
    if (ext === 'jpeg') ext = 'jpg';
    
    const fileName = `asset_${assetCount}.${ext}`;
    const filePath = path.join(ASSETS_DIR, fileName);
    
    try {
        const buffer = Buffer.from(base64, 'base64');
        fs.writeFileSync(filePath, buffer);
        console.log(`[SAVED] ${filePath} (${buffer.length} bytes)`);
        
        return `url('${RELATIVE_ASSETS_PATH}/${fileName}')`;
    } catch (err) {
        console.error(`[ERROR] Failed to save asset ${assetCount}:`, err.message);
        return match;
    }
});

fs.writeFileSync(HTML_FILE, content, 'utf8');
console.log(`--- Finished Extraction ---`);
console.log(`Total Assets Extracted: ${assetCount}`);
console.log(`Optimized File Saved: ${HTML_FILE}`);
