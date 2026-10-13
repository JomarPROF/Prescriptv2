const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

// Check unclosed tags in index.html
const stack = [];
const tagRegex = /<\/?([a-zA-Z0-9\-]+)(?:\s+[^>]*)?>/g;
let match;

let openDivs = 0;
let closeDivs = 0;

while ((match = tagRegex.exec(html)) !== null) {
    const isClosing = match[0].startsWith('</');
    const isSelfClosing = match[0].endsWith('/>') || ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(match[1].toLowerCase());
    const tagName = match[1].toLowerCase();

    if (tagName === 'div') {
        if (isClosing) closeDivs++;
        else openDivs++;
    }
}

console.log(`Divs opened: ${openDivs}, Divs closed: ${closeDivs}, Diff: ${openDivs - closeDivs}`);
