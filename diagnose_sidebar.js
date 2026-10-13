const fs = require('fs');

console.log("=== DIAGNOSING SIDEBAR ISSUES ===");

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');
const styles = fs.readFileSync('styles.css', 'utf8');
const enterprise = fs.readFileSync('enterprise.css', 'utf8');
const settingsPro = fs.readFileSync('settings-pro.js', 'utf8');

// 1. Check if unclosed chatWindow affects DOM
console.log("1. Checking HTML structure around chatWindow and floating-actions-container:");
const chatPos = html.indexOf('id="chatWindow"');
const floatPos = html.indexOf('id="floating-actions-container"');
const scriptPos = html.indexOf('src="script.js');

console.log(`chatWindow pos: ${chatPos}, floating-actions pos: ${floatPos}, script pos: ${scriptPos}`);

// 2. Look for all event listeners on #scheduling-sidebar or .rs-indicator-bar
console.log("\n2. Checking click / hover on scheduling-sidebar in scripts:");
const scriptLines = script.split('\n');
scriptLines.forEach((l, i) => {
    if (l.includes('toggleScheduling') || l.includes('rs-indicator-bar') || (l.includes('schedulingSidebar') && l.includes('open'))) {
        console.log(`script.js:${i+1}: ${l.trim()}`);
    }
});

// 3. Check CSS z-indexes
console.log("\n3. Checking z-indexes:");
const findZ = (str, label) => {
    const m = str.match(/([^\n{}]+)\s*\{[^}]*z-index\s*:\s*([^;!]+)[^}]*\}/g) || [];
    m.filter(r => r.includes('sidebar') || r.includes('indicator') || r.includes('float') || r.includes('drawer')).forEach(r => {
        console.log(`[${label}] ${r.replace(/\s+/g, ' ').trim()}`);
    });
};
findZ(styles, 'styles.css');
findZ(enterprise, 'enterprise.css');
