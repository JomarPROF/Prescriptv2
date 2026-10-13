const fs = require('fs');

const script = fs.readFileSync('script.js', 'utf8');

const lines = script.split('\n');
lines.forEach((l, i) => {
    if (l.includes('toggleScheduling') || l.includes('openScheduling') || l.includes('scheduling-sidebar')) {
        console.log(`script.js ${i + 1}: ${l.trim().slice(0, 120)}`);
    }
});
