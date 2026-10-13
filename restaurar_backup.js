const fs = require('fs');
const path = require('path');

const srcDir = __dirname;
const backupDir = path.join(srcDir, 'backup_sistema_estavel');

if (!fs.existsSync(backupDir)) {
    console.error('Pasta de backup não encontrada:', backupDir);
    process.exit(1);
}

const files = fs.readdirSync(backupDir);
files.forEach(f => {
    const backupFile = path.join(backupDir, f);
    const destFile = path.join(srcDir, f);
    fs.copyFileSync(backupFile, destFile);
    console.log('Restaurado:', f);
});

console.log('========================================================');
console.log('BACKUP RESTAURADO COM SUCESSO!');
console.log('========================================================');
