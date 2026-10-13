const fs = require('fs');

const files = ['styles.css', 'enterprise.css', 'settings-pro.css', 'index.html'];

files.forEach(f => {
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('rs-content') || l.includes('rs-indicator-bar') || l.includes('right-sidebar')) {
            console.log(`${f}:${i+1}: ${l.slice(0, 110)}`);
        }
    });
});
