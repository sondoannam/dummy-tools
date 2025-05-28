#!/usr/bin/env node

/**
 * Version Helper Script for dummie-tools
 * 
 * This script helps manage version numbers according to the project's strategy:
 * - Even minor versions (1.0.x, 1.2.x) are stable and published to npm
 * - Odd minor versions (1.1.x, 1.3.x) are development versions
 */

const path = require('path');
const { execSync } = require('child_process');

// Read the package.json
const packagePath = path.join(__dirname, 'package.json');
const package = require(packagePath);
const currentVersion = package.version;

// Parse the current version
const [major, minor, patch] = currentVersion.split('.').map(Number);

function displayHelp() {
  console.log(`
Version Helper for dummie-tools (current: ${currentVersion})

Commands:
  node version-helper.js dev      # Bump to next development version (odd minor)
  node version-helper.js release  # Bump to next release version (even minor)
  node version-helper.js patch    # Bump the patch version
  node version-helper.js status   # Show current version status
  node version-helper.js help     # Display this help
  `);
}

function isEven(num) {
  return num % 2 === 0;
}

function getNextVersion(type) {
  switch (type) {
    case 'dev':
      // If current is even, increment to next odd
      return isEven(minor) ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
    
    case 'release':
      // If current is odd, increment to next even
      return !isEven(minor) ? `${major}.${minor + 1}.0` : `${major}.${minor}.${patch + 1}`;
    
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    
    default:
      throw new Error('Invalid version type');
  }
}

function updateVersion(newVersion) {
  try {
    execSync(`npm version ${newVersion} --no-git-tag-version`, { stdio: 'inherit' });
    console.log(`\nVersion updated to ${newVersion}`);
    
    const versionType = isEven(newVersion.split('.')[1]) ? 'RELEASE' : 'DEVELOPMENT';
    console.log(`\nThis is a ${versionType} version.`);
    
    if (versionType === 'RELEASE') {
      console.log('This version will be automatically published to npm when pushed to the main branch.');
    } else {
      console.log('This version will NOT be automatically published to npm.');
    }
  } catch (error) {
    console.error('Failed to update version:', error);
  }
}

function showStatus() {
  const versionType = isEven(minor) ? 'RELEASE' : 'DEVELOPMENT';
  console.log(`Current version: ${currentVersion}`);
  console.log(`Version type: ${versionType}`);
  console.log(`Will auto-publish: ${isEven(minor) ? 'YES' : 'NO'}`);
  
  console.log('\nNext versions:');
  console.log(`  Development: ${getNextVersion('dev')}`);
  console.log(`  Release: ${getNextVersion('release')}`);
  console.log(`  Patch: ${getNextVersion('patch')}`);
}

// Main execution
const command = process.argv[2] || 'help';

switch (command) {
  case 'dev':
    updateVersion(getNextVersion('dev'));
    break;
  
  case 'release':
    updateVersion(getNextVersion('release'));
    break;
  
  case 'patch':
    updateVersion(getNextVersion('patch'));
    break;
  
  case 'status':
    showStatus();
    break;
  
  case 'help':
  default:
    displayHelp();
    break;
}
