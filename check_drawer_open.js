const fs = require('fs');

const files = ['enterprise.css', 'styles.css', 'settings-pro.css'];

files.forEach(f => {
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('prontuario-drawer') && (l.includes('open') || l.includes('transform') || l.includes('left') || l.includes('transition'))) {
            console.log(`${f}:${i+1}: ${l}`);
        }
    });
});
