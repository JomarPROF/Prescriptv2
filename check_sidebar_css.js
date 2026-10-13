const fs = require('fs');

const files = ['index.html', 'styles.css', 'enterprise.css', 'settings-pro.css'];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('scheduling-sidebar') || l.includes('right-sidebar') || l.includes('rs-indicator-bar')) {
            console.log(`${f} ${i + 1}: ${l.trim().slice(0, 100)}`);
        }
    });
});
