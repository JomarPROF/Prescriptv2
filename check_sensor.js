const fs = require('fs');

const txt = fs.readFileSync('script.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('show-action-icons')) {
        console.log(`script.js:${i+1}: ${l.trim()}`);
    }
});
