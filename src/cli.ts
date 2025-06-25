#!/usr/bin/env node

// Suppress specific deprecation warnings in production
// This prevents the punycode deprecation warning from showing to end users
if (process.env.NODE_ENV !== 'development') {
  // Use a direct approach to suppress only punycode warnings
  const originalProcessEmit = process.emit;
  // @ts-ignore - This is a hack to suppress specific warnings without TypeScript errors
  process.emit = function(event, warning, ...args) {
    if (
      event === 'warning' && 
      warning && 
      typeof warning === 'object' && 
      'name' in warning &&
      warning.name === 'DeprecationWarning' &&
      'message' in warning &&
      typeof warning.message === 'string' && 
      warning.message.includes('punycode')
    ) {
      return false;
    }
    // @ts-ignore - Pass through all other events
    return originalProcessEmit.apply(process, [event, warning, ...args]);
  };
}

import { Command } from "commander";
import { printTree } from "./strucview";
import { StrucViewCommandOptions, TranslateCommandOptions, isNumber } from "./types";
import { translateText } from "./translate";
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Read version from package.json to ensure it's always in sync
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

const program = new Command();

program
  .name("dummie")
  .description("dummie-tools CLI")
  .version(version);

// Global options
program
  .option('-d, --debug', 'enable debug mode')
  .option('-q, --quiet', 'suppress output');

// Set environment variables based on global options
program.hook('preAction', (thisCommand) => {
  const opts = thisCommand.opts();
  if (opts.debug) {
    process.env.DEBUG = 'true';
  }
  if (opts.quiet) {
    process.env.QUIET = 'true';
  }
});

// View structure command
program
  .command("strucview")
  .description("print directory tree view")
  .option("-l, --level <n>", 'max depth level (or use "la" for all)', "3")
  .option("-d, --dir <path>", "directory to scan", ".")
  .action(async (opts: StrucViewCommandOptions) => {
    // Validate and process the level option
    let maxDepth: number;
    if (opts.level === "la") {
      maxDepth = Infinity;
    } else {
      const parsedLevel = parseInt(opts.level, 10);
      if (!isNumber(parsedLevel) || parsedLevel < 0) {
        console.error("Error: Level must be a non-negative number or 'la'");
        process.exit(1);
      }
      maxDepth = parsedLevel;
    }

    // Validate the directory path
    const dir = opts.dir;
    if (typeof dir !== "string") {
      console.error("Error: Directory must be a string");
      process.exit(1);
    }

    // Execute the command
    try {
      await printTree({
        dirPath: dir,
        maxDepth,
      });
    } catch (error) {
      console.error(
        `Error processing directory: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }
  });

// Translation command
program
  .command("translate <text>")
  .description("translate text using HTTP API with Puppeteer fallback")
  .option("-f, --from <lang>", "source language code (default: en)", "en")
  .option("-t, --to <lang>", "target language code (default: vi)", "vi")
  .action(async (text: string, opts: TranslateCommandOptions) => {
    try {
      const result = await translateText(text, opts.from, opts.to);
      console.log(result);
    } catch (err) {
      console.error(`Translation error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

// Info command - Shows system info and environment
program
  .command('info')
  .description('display system and environment information')
  .action(() => {
    console.log('dummie-tools Information:');
    console.log(`Version: ${version}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`OS: ${process.platform} (${process.arch})`);
    
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`NPM Version: ${npmVersion}`);
    } catch (e) {
      console.log('NPM Version: Not available');
    }
    
    console.log(`Package Location: ${__dirname}`);
  });

// Version check command
program
  .command('version-check')
  .description('check for new version of dummie-tools')
  .action(async () => {
    try {
      console.log('Checking for updates...');
      const result = execSync('npm view dummie-tools version', { encoding: 'utf8' }).trim();
      
      if (result === version) {
        console.log(`You are using the latest version (${version}).`);
      } else {
        console.log(`Current version: ${version}`);
        console.log(`Latest version: ${result}`);
        console.log('You can update using: npm install -g dummie-tools@latest');
      }
    } catch (err) {
      console.error('Failed to check for updates:', err instanceof Error ? err.message : String(err));
    }
  });

// Browser detection command - helps with puppeteer configuration
program
  .command('browser-detect')
  .description('detect browser installations for translation feature')
  .action(() => {
    console.log('Detecting browsers for translation feature...');
    
    // Common Chrome paths by platform
    const chromePaths = {
      win32: [
        'C:/Program Files/Google/Chrome/Application/chrome.exe',
        'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
        process.env.LOCALAPPDATA + '/Google/Chrome/Application/chrome.exe'
      ],
      darwin: [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium'
      ],
      linux: [
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium'
      ]
    };
    
    // Get paths for current platform
    const paths = chromePaths[process.platform as 'win32' | 'darwin' | 'linux'] || [];
    let browserFound = false;
    
    for (const path of paths) {
      try {
        if (existsSync(path)) {
          console.log(`✅ Found Chrome at: ${path}`);
          console.log('');
          console.log('To use this browser for translations, set the CHROME_PATH environment variable:');
          console.log('');
          if (process.platform === 'win32') {
            console.log(`setx CHROME_PATH "${path}"`);
          } else {
            console.log(`export CHROME_PATH="${path}"`);
          }
          browserFound = true;
          break;
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    if (!browserFound) {
      console.log('❌ No Chrome installation found in common locations.');
      console.log('');
      console.log('Manual configuration needed:');
      console.log('1. Install Google Chrome');
      console.log('2. Set the CHROME_PATH environment variable to your chrome.exe location');
      console.log('');
      if (process.platform === 'win32') {
        console.log('Example: setx CHROME_PATH "C:/path/to/chrome.exe"');
      } else {
        console.log('Example: export CHROME_PATH="/path/to/chrome"');
      }
    }
  });

program.parse(process.argv);
