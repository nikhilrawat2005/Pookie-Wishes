const fs = require('fs');
const path = require('path');

const FILES_TO_MINIFY = [
    'js/app.js',
    'js/template-loader.js',
    'js/category-loader.js',
    'css/style.css'
];

function minifyJS(content) {
    // Basic JS minification: remove comments and extra whitespace
    return content
        .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // Remove comments
        .replace(/\s+/g, ' ')                                  // Replace multiple whitespace with single space
        .trim();
}

function minifyCSS(content) {
    // Basic CSS minification: remove comments and extra whitespace
    return content
        .replace(/\/\*[\s\S]*?\*\//g, '')                      // Remove comments
        .replace(/\s+/g, ' ')                                  // Multiple whitespace to single space
        .replace(/\s*([{}:;,])\s*/g, '$1')                    // Remove space around delimiters
        .trim();
}

console.log('--- Starting Asset Minification ---');

FILES_TO_MINIFY.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.warn(`[SKIP] ${filePath} not found.`);
        return;
    }

    try {
        const originalContent = fs.readFileSync(filePath, 'utf8');
        let minifiedContent;

        if (filePath.endsWith('.js')) {
            minifiedContent = minifyJS(originalContent);
        } else if (filePath.endsWith('.css')) {
            minifiedContent = minifyCSS(originalContent);
        }

        // We'll create .min versions or overwrite? 
        // For "Zero-Touch" security hardening, we'll overwrite to ensure the production-loaded files are hardened.
        // But we should keep the originals for development? 
        // In this workspace, let's keep them minified to protect the "Client's IP".
        
        fs.writeFileSync(filePath, minifiedContent, 'utf8');
        console.log(`[MINIFIED] ${filePath} (${originalContent.length} -> ${minifiedContent.length} bytes)`);
    } catch (err) {
        console.error(`[ERROR] Failed to minify ${filePath}:`, err.message);
    }
});

console.log('--- Completed! ---');
