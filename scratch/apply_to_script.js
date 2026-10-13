const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');
const cleanBlock = fs.readFileSync('scratch/clean_block.js', 'utf8');

const v6000Header = '// =========================================================================\r\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';
const v6000HeaderUnix = '// =========================================================================\n// 🏥 PATCH V6000: SISTEMA AVANÇADO DE UNIDADES & CABEÇALHOS ADAPTATIVOS';

let idxStart = js.indexOf(v6000Header);
if (idxStart === -1) idxStart = js.indexOf(v6000HeaderUnix);

const v4500Header = '// =========================================================================\r\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';
const v4500HeaderUnix = '// =========================================================================\n// 💎 PATCH V4500: ESTÚDIO PREMIUM DE UNIDADES (DESIGN E CROPPER INTEGRADO)';

let idxEnd = js.indexOf(v4500Header);
if (idxEnd === -1) idxEnd = js.indexOf(v4500HeaderUnix);

console.log('cleanBlock splice: idxStart =', idxStart, 'idxEnd =', idxEnd);

if (idxStart === -1 || idxEnd === -1) {
    console.error('Could not find Patch V6000 or V4500 header markers in script.js!');
    process.exit(1);
}

// Splicing cleanBlock
js = js.slice(0, idxStart) + cleanBlock + '\n\n' + js.slice(idxEnd);
console.log('Successfully spliced cleanBlock into script.js');

// Now update Patch V5000 logo-proportions-css so it does not affect modals or break simulator slots
const oldPropCss = `.header-mini img, img[src*="prefeitura"], img[src*="farmacia"] {
                object-fit: contain !important;
                max-width: 140px !important;
                max-height: 55px !important;
                transition: opacity 0.3s ease;
            }`;

const newPropCss = `#preview-container .header-mini img,
            #preview-container img[src*="prefeitura"],
            #preview-container img[src*="farmacia"],
            .rx-paper .header-mini img {
                object-fit: contain !important;
                max-width: 140px !important;
                max-height: 55px !important;
                transition: opacity 0.3s ease;
            }`;

if (js.includes(oldPropCss)) {
    js = js.replace(oldPropCss, newPropCss);
    console.log('Successfully updated logo proportions CSS in Patch V5000');
} else {
    console.warn('oldPropCss not found in exact format, checking normalized...');
}

// Scoping radar interval querySelectors so it only touches the preview recipe, not modal inputs/previews
const oldRadarPref = `document.querySelectorAll('img[src*="prefeitura"]').forEach(img => {`;
const newRadarPref = `document.querySelectorAll('#preview-container img[src*="prefeitura"], .rx-paper img[src*="prefeitura"]').forEach(img => {`;

const oldRadarFarm = `document.querySelectorAll('img[src*="farmacia"]').forEach(img => {`;
const newRadarFarm = `document.querySelectorAll('#preview-container img[src*="farmacia"], .rx-paper img[src*="farmacia"]').forEach(img => {`;

if (js.includes(oldRadarPref)) {
    js = js.replace(oldRadarPref, newRadarPref);
    console.log('Successfully scoped radar pref queries');
}

if (js.includes(oldRadarFarm)) {
    js = js.replace(oldRadarFarm, newRadarFarm);
    console.log('Successfully scoped radar farm queries');
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('Finished updating script.js');
