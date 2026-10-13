const fs = require('fs');

const cssFiles = ['styles.css', 'enterprise.css', 'settings-pro.css', 'index.html'];

cssFiles.forEach(f => {
    const txt = fs.readFileSync(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((l, i) => {
        if (l.includes('#prontuario-drawer') || (l.includes('drawer') && l.includes('open'))) {
            console.log(`${f}:${i+1}: ${l.slice(0, 100)}`);
        }
    });
});
