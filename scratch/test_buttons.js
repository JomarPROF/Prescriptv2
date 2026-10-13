const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const re = /<button[\s\S]*?<\/button>/gi;
let m;
while ((m = re.exec(html)) !== null) {
    const str = m[0];
    const txt = str.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    const idM = str.match(/id=['"]([^'"]+)/);
    const clsM = str.match(/class=['"]([^'"]+)/);
    console.log((idM ? idM[1] : 'no-id') + ' | ' + (clsM ? clsM[1] : 'no-class') + ' | ' + txt.substring(0, 40));
}
