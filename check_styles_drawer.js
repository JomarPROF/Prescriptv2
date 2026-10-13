const fs = require('fs');

const txt = fs.readFileSync('styles.css', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('prontuario-drawer')) {
        console.log(`${i+1}: ${l}`);
    }
});
