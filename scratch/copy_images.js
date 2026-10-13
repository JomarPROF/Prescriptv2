const fs = require('fs');
const path = require('path');

// Ensure normalized copies exist alongside original files
const prefSrc = path.join(__dirname, '..', 'Prefeitura Olindina.jpeg');
const prefDst = path.join(__dirname, '..', 'prefeitura_olindina.jpeg');

const uniSrc = path.join(__dirname, '..', 'UniBrasil.jpeg');
const uniDst = path.join(__dirname, '..', 'unibrasil_saude.jpeg');

if (fs.existsSync(prefSrc)) {
    fs.copyFileSync(prefSrc, prefDst);
    console.log('Copied prefeitura_olindina.jpeg');
} else {
    console.warn('prefSrc not found:', prefSrc);
}

if (fs.existsSync(uniSrc)) {
    fs.copyFileSync(uniSrc, uniDst);
    console.log('Copied unibrasil_saude.jpeg');
} else {
    console.warn('uniSrc not found:', uniSrc);
}
