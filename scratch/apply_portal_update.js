const fs = require('fs');

// 1. UPDATE SCRIPT.JS
const js = fs.readFileSync('script.js', 'utf8');

const v6000Header = '// =========================================================================\r\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';
const v6000HeaderUnix = '// =========================================================================\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';

let idxStart = js.indexOf(v6000Header);
if (idxStart === -1) idxStart = js.indexOf(v6000HeaderUnix);

const v4500Header = '// =========================================================================\r\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';
const v4500HeaderUnix = '// =========================================================================\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';

let idxEnd = js.indexOf(v4500Header);
if (idxEnd === -1) idxEnd = js.indexOf(v4500HeaderUnix);

console.log('script.js idxStart:', idxStart, 'idxEnd:', idxEnd);

if (idxStart === -1 || idxEnd === -1) {
    console.error('script.js markers not found!');
    process.exit(1);
}

// Load test_portal_full.js content
const portalFullContent = fs.readFileSync('scratch/test_portal_full.js', 'utf8');
// Extract the code string from test_portal_full.js
const codeStart = portalFullContent.indexOf('// =========================================================================\n// 🏥 PATCH V6000:');
const codeEnd = portalFullContent.lastIndexOf('}, 100);') + '}, 100);'.length;
const newJsBlock = portalFullContent.slice(codeStart, codeEnd) + '\n\n';

const updatedJs = js.slice(0, idxStart) + newJsBlock + js.slice(idxEnd);
fs.writeFileSync('script.js', updatedJs, 'utf8');
console.log('Successfully updated script.js!');

// 2. UPDATE SETTINGS-PRO.CSS
const css = fs.readFileSync('settings-pro.css', 'utf8');

const cssStartMarker = '/* ══════════════════════════════════════════════════════════════════════════\r\n   2. QUICK SWITCHER MODAL';
const cssStartMarkerUnix = '/* ══════════════════════════════════════════════════════════════════════════\n   2. QUICK SWITCHER MODAL';

let cssStartIdx = css.indexOf(cssStartMarker);
if (cssStartIdx === -1) cssStartIdx = css.indexOf(cssStartMarkerUnix);

const cssEndMarker = '/* ══════════════════════════════════════════════════════════════════════════\r\n   3. SETTINGS PRO: ABA UNIDADE DE SAÚDE';
const cssEndMarkerUnix = '/* ══════════════════════════════════════════════════════════════════════════\n   3. SETTINGS PRO: ABA UNIDADE DE SAÚDE';

let cssEndIdx = css.indexOf(cssEndMarker);
if (cssEndIdx === -1) cssEndIdx = css.indexOf(cssEndMarkerUnix);

console.log('settings-pro.css cssStartIdx:', cssStartIdx, 'cssEndIdx:', cssEndIdx);

if (cssStartIdx === -1 || cssEndIdx === -1) {
    console.error('settings-pro.css markers not found!');
    process.exit(1);
}

// Load portal styles
const portalStylesContent = fs.readFileSync('scratch/portal_styles.js', 'utf8');
const styleStart = portalStylesContent.indexOf('/* ══════════════════════════════════════════════════════════════════════════\n   💎 QUICK SWITCHER');
const styleEnd = portalStylesContent.lastIndexOf('.up-btn-del-unit-full:hover {') + portalStylesContent.slice(portalStylesContent.lastIndexOf('.up-btn-del-unit-full:hover {')).indexOf('}') + 1;
const newCssBlock = portalStylesContent.slice(styleStart, styleEnd) + '\n\n';

const updatedCss = css.slice(0, cssStartIdx) + newCssBlock + css.slice(cssEndIdx);
fs.writeFileSync('settings-pro.css', updatedCss, 'utf8');
console.log('Successfully updated settings-pro.css!');
