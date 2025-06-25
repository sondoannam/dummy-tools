#!/usr/bin/env node

/**
 * Build script for dummie-tools
 * This handles the build process including post-build checks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🛠️ Building dummie-tools...');

try {
  // Run tsup build
  console.log('📦 Running tsup...');
  execSync('npx tsup', { stdio: 'inherit' });

  // Check if files were created
  const cliPath = path.join(__dirname, 'dist', 'cli.js');
  const indexPath = path.join(__dirname, 'dist', 'index.js');
  
  if (!fs.existsSync(cliPath)) {
    throw new Error('CLI file was not created successfully');
  }
  
  if (!fs.existsSync(indexPath)) {
    throw new Error('Index file was not created successfully');
  }

  // Make sure cli.js has executable permissions (Unix systems)
  if (process.platform !== 'win32') {
    console.log('🔐 Setting executable permissions for CLI...');
    fs.chmodSync(cliPath, '755');
  }
  
  // Fix shebang in cli.js - this handles any duplicate shebang issues
  console.log('🔧 Ensuring proper shebang line in CLI...');
  let cliContent = fs.readFileSync(cliPath, 'utf8');
  
  // Remove any existing shebang to prevent duplicates
  cliContent = cliContent.replace(/^#!\/usr\/bin\/env node\n?/g, '');
  
  // Add single shebang line at the beginning
  fs.writeFileSync(
    cliPath, 
    `#!/usr/bin/env node\n${cliContent}`, 
    'utf8'
  );
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
