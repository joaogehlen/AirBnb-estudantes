#!/usr/bin/env node
/**
 * Troca o ícone do app copiando qualquer PNG para assets/icon.png.
 *
 * Uso:
 *   npm run icon -- caminho/para/meu-icone.png
 *
 * Requisitos do PNG de origem:
 *   - Formato PNG (obrigatório)
 *   - Resolução recomendada: 1024×1024 px
 *   - Fundo pode ser transparente ou sólido
 *
 * Após rodar este script:
 *   - Para testar: npm start  → escaneie o QR com o Expo Go
 *   - Para gerar APK: npm run build:android
 */

const fs = require('fs');
const path = require('path');

const src = process.argv[2];

if (!src) {
  console.error('\n❌  Informe o caminho da imagem.');
  console.error('    Exemplo: npm run icon -- caminho/para/icone.png\n');
  process.exit(1);
}

const srcPath = path.resolve(src);

if (!fs.existsSync(srcPath)) {
  console.error(`\n❌  Arquivo não encontrado: ${srcPath}\n`);
  process.exit(1);
}

if (!srcPath.toLowerCase().endsWith('.png')) {
  console.error('\n❌  O arquivo precisa ser um PNG.\n');
  process.exit(1);
}

const assetsDir = path.join(__dirname, '..', 'assets');
const dest = path.join(assetsDir, 'icon.png');

fs.copyFileSync(srcPath, dest);

const sizeKB = Math.round(fs.statSync(dest).size / 1024);
console.log(`\n✅  Ícone atualizado! (${sizeKB} KB → assets/icon.png)`);
console.log('');
console.log('   Próximos passos:');
console.log('   • Testar no celular : npm start');
console.log('   • Gerar APK         : npm run build:android');
console.log('');
