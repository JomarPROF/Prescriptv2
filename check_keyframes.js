const fs = require('fs');

const txt = fs.readFileSync('enterprise.css', 'utf8');
const lines = txt.split('\n');
lines.forEach((l, i) => {
    if (l.includes('proCinematicSideRight') || l.includes('proCinematicSide')) {
        console.log(`${i+1}: ${l}`);
    }
});
