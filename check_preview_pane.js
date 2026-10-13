const fs = require('fs');

const files = ['styles.css', 'enterprise.css'];
files.forEach(f => {
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('preview-pane')) {
            console.log(`${f}:${i+1}: ${l}`);
        }
    });
});
