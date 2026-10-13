const fs = require('fs');

const cssFiles = ['enterprise.css', 'styles.css', 'settings-pro.css', 'preview-zoom.css'];

cssFiles.forEach(f => {
    if (!fs.existsSync(f)) return;
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('scheduling-sidebar') || l.includes('right-sidebar') || l.includes('prontuario-drawer') || l.includes('.drawer')) {
            console.log(`${f}:${i+1}: ${l.trim().slice(0, 110)}`);
        }
    });
});
