const fs = require('fs');

const txt = fs.readFileSync('enterprise.css', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('.right-sidebar') || l.includes('#scheduling-sidebar') || l.includes('.rs-content')) {
        console.log(`enterprise.css:${i+1}: ${l}`);
    }
});
