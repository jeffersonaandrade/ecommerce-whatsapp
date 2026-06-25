// Simular exatamente o que uploadHeroImageAction faz
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcFile = './test-hero.jpg';
const brandingDir = './storage/branding';
const settingsFile = './storage/store-settings.json';

// Garantir diretório
if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}

// Ler arquivo de teste
const fileBuffer = fs.readFileSync(srcFile);

// Chamar saveHeroImage (convert para webp)
async function saveHeroImage(buffer) {
  const heroPath = 'hero.webp';
  const dir = brandingDir;
  await sharp(buffer)
    .rotate()
    .resize(1920, 1080, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85 })
    .toFile(path.join(dir, heroPath));
  return heroPath;
}

// Atualizar settings
async function updateSettings(heroPath) {
  const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  settings.heroImagePath = heroPath;
  settings.updatedAt = new Date().toISOString();
  fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
  return settings.updatedAt;
}

// Executar
(async () => {
  try {
    console.log('Starting hero upload simulation...');
    const heroPath = await saveHeroImage(fileBuffer);
    console.log(`✓ Converted to WebP: ${heroPath}`);
    
    const newUpdatedAt = await updateSettings(heroPath);
    console.log(`✓ Updated settings.json with heroImagePath and updatedAt`);
    console.log(`✓ NEW updatedAt: ${newUpdatedAt}`);
    
    // Verificar resultado
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    console.log(`✓ Verification: heroImagePath=${settings.heroImagePath}`);
    
    // Verificar arquivo
    const heroExists = fs.existsSync(path.join(brandingDir, heroPath));
    console.log(`✓ File exists: ${heroExists}`);
    const stats = fs.statSync(path.join(brandingDir, heroPath));
    console.log(`✓ File size: ${(stats.size / 1024).toFixed(1)} KB`);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
})();
