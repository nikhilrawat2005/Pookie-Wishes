const fs = require('fs');
const path = require('path');

const COPYRIGHT_HEADER = `/*
 * ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
 *   Copyright (c) 2026 Cipher - Team Pookie Wishes
 *   Unauthorized copying of this file, via any medium is strictly prohibited.
 *   Proprietary and confidential.
 * ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
 */
`;

const HTML_COPYRIGHT_HEADER = `<!--
    ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
    Copyright (c) 2026 Cipher - Team Pookie Wishes
    Unauthorized copying of this file, via any medium is strictly prohibited.
    Proprietary and confidential.
    ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ?
-->
`;

const TARGET_DIRECTORIES = ['./js', './css', './templates'];
const EXTENSIONS = ['.js', '.css', '.html'];

function addHeader(filePath) {
    const ext = path.extname(filePath);
    const header = ext === '.html' ? HTML_COPYRIGHT_HEADER : COPYRIGHT_HEADER;
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if header already exists
        if (content.includes('Copyright (c) 2026 Cipher')) {
            console.log(`[SKIP] ${filePath} already has copyright header.`);
            return;
        }
        
        // Prepend header
        const newContent = header + content;
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`[ADDED] ${filePath}`);
    } catch (err) {
        console.error(`[ERROR] Failed to process ${filePath}:`, err.message);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (EXTENSIONS.includes(path.extname(fullPath))) {
            addHeader(fullPath);
        }
    }
}

console.log('--- Starting Copyright Header Injection ---');
// Adding to root app.js and style.css too
['./js/app.js', './css/style.css'].forEach(f => {
    if (fs.existsSync(f)) addHeader(f);
});

TARGET_DIRECTORIES.forEach(dir => {
    const fullDir = path.resolve(dir);
    if (fs.existsSync(fullDir)) {
        walkDir(fullDir);
    }
});
console.log('--- Completed! ---');
