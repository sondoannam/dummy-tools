#!/usr/bin/env node

/**
 * Post-install script for dummie-tools
 * This script verifies the installation and provides helpful information to users
 */

console.log('\n🎉 Thank you for installing dummie-tools! 🎉\n');

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get package version
let version;
try {
  const packageJson = require('./package.json');
  version = packageJson.version;
  console.log(`Installed version: ${version}`);
} catch (e) {
  console.log('Could not determine installed version');
}

// Check if the CLI is executable
try {
  const cliPath = path.join(__dirname, 'dist', 'cli.js');
  if (fs.existsSync(cliPath)) {
    console.log('✅ CLI is available');
    
    // Make sure file has executable permissions on non-Windows systems
    if (process.platform !== 'win32') {
      try {
        fs.chmodSync(cliPath, '755');
        console.log('✅ CLI permissions set correctly');
      } catch (e) {
        console.warn('⚠️ Could not set executable permissions on CLI file. You may need to run:');
        console.warn(`   chmod +x ${cliPath}`);
      }
    }
  } else {
    console.error('❌ CLI file is missing. Installation may be corrupted.');
  }
} catch (e) {
  console.error('Error checking CLI file:', e.message);
}

console.log('\n📚 Documentation:');
console.log('  - Run "dummie --help" to see available commands');
console.log('  - Visit https://github.com/sondoannam/dummy-tools for full documentation');

console.log('\n🚀 Quick start:');
console.log('  - Directory tree: dummie strucview');
console.log('  - Translation:    dummie translate "Hello world" --to fr');
console.log('  - System info:    dummie info');
console.log('  - Check version:  dummie version-check');

console.log('\n💡 Tip: Add to your PATH if global installation doesn\'t work.');
console.log('    Use "npm link" in the package directory for local development.\n');
