const fs = require('fs');

const txt = fs.readFileSync('script.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('hide-floating-menu')) {
        console.log(`script.js:${i+1}: ${l.trim()}`);
    }
});
