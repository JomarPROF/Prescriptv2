const fs = require('fs');

const txt = fs.readFileSync('script.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('cacheDOM') || l.includes('initDOM') || (l.includes('this.DOM') && l.includes('='))) {
        console.log(`script.js:${i+1}: ${l.slice(0, 100)}`);
    }
});
