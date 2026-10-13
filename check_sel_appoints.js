const fs = require('fs');

const txt = fs.readFileSync('script.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('selectedAppoints')) {
        console.log(`script.js:${i+1}: ${l.slice(0, 100)}`);
    }
});
