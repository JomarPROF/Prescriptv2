const fs = require('fs');

const txt = fs.readFileSync('script.js', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('prontuario-drawer')) {
        console.log(`${i+1}: ${l.slice(0, 110)}`);
    }
});
