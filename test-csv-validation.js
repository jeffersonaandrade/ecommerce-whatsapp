const fs = require('fs');
const path = require('path');

// Import the validation functions
const { buildImportPreview, getValidProducts } = require('./lib/catalog/import/validate-import');

function testCSVFile(csvPath, label) {
  console.log(`\n📊 Testing: ${label}`);
  console.log(`📄 File: ${csvPath}`);
  
  if (!fs.existsSync(csvPath)) {
    console.log(`❌ File not found: ${csvPath}`);
    return null;
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const preview = buildImportPreview(csvContent, path.basename(csvPath));
  
  console.log(`\nStatistics:`);
  console.log(`  Total Rows: ${preview.stats.totalRows}`);
  console.log(`  Total Products: ${preview.stats.totalProducts}`);
  console.log(`  Valid Products: ${preview.stats.validProducts}`);
  console.log(`  Errors: ${preview.stats.errorCount}`);
  console.log(`  Warnings: ${preview.stats.warningCount}`);
  
  if (preview.issues.length > 0) {
    console.log(`\nIssues:`);
    for (const issue of preview.issues) {
      const icon = issue.severity === 'error' ? '🔴' : '⚠️';
      console.log(`  ${icon} ${issue.code} (${issue.severity}): ${issue.message}`);
      if (issue.row) console.log(`     Row: ${issue.row}`);
      if (issue.slug) console.log(`     Slug: ${issue.slug}`);
    }
  }
  
  const valid = getValidProducts(preview);
  if (valid.length > 0) {
    console.log(`\nValid Products:`);
    for (const product of valid) {
      console.log(`  ✓ ${product.slug}: ${product.name}`);
      console.log(`    - Variations: ${product.variations.length}`);
      console.log(`    - Price: R$ ${product.price.toFixed(2)}`);
      if (product.promotionalPrice) {
        console.log(`    - Promo: R$ ${product.promotionalPrice.toFixed(2)}`);
      }
      console.log(`    - Images: ${product.images.length}`);
    }
  }
  
  return preview;
}

console.log('🚀 CSV Validation Test Suite\n');
console.log('='.repeat(50));

// Test template
testCSVFile(
  './public/templates/importacao-produtos-exemplo.csv',
  'Official Template'
);

// Test valid CSV
testCSVFile(
  './test-data/csv-test-valid.csv',
  'Valid Products Test'
);

// Test error CSV
testCSVFile(
  './test-data/csv-test-errors.csv',
  'Error Scenarios Test'
);

console.log('\n' + '='.repeat(50));
console.log('✅ CSV validation test completed');
