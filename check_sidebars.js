const fs = require('fs');

console.log("=== CHECKING SIDEBARS & DRAWERS ===");

const html = fs.readFileSync('index.html', 'utf8');
const script = fs.readFileSync('script.js', 'utf8');

// Find all elements with class or id containing sidebar, drawer, agenda, prontuario
const htmlMatches = html.match(/(?:id|class)=["'][^"']*(?:sidebar|drawer|lateral|agenda|prontuario)[^"']*["']/gi) || [];
console.log("HTML matches:", [...new Set(htmlMatches)]);

// Find all toggleDrawer or toggleScheduling
const scriptMatches = script.match(/(?:toggleDrawer|toggleScheduling|toggleSidebar|openDrawer|openScheduling)[a-zA-Z0-9_]*/g) || [];
console.log("Script functions:", [...new Set(scriptMatches)]);
