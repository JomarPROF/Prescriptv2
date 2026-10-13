const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');

// Find scheduling-sidebar in index.html
const lines = html.split('\n');
lines.forEach((l, i) => {
    if (l.includes('scheduling-sidebar') || l.includes('AGENDA') || l.includes('toggleScheduling')) {
        console.log(`HTML ${i + 1}: ${l.trim().slice(0, 120)}`);
    }
});
