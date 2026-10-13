const fs = require('fs');

const txt = fs.readFileSync('script.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('logged-in')) {
        console.log(`script.js:${i+1}: ${l.trim().slice(0, 110)}`);
    }
});
