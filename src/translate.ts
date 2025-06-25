import { translate } from "@vitalets/google-translate-api";
import { launch as launchPuppeteer } from 'puppeteer-core';

// Fallback Chrome executable path—customize via env var if needed
const CHROME_PATH = process.env.CHROME_PATH || (
  process.platform === 'win32'
    ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
    : process.platform === 'darwin'
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/google-chrome'
);

// Debug mode can be enabled via environment variable or by the CLI --debug flag
const isDebugMode = process.env.DEBUG === 'true' || process.argv.includes('--debug');

/**
 * Log debug information if debug mode is enabled
 */
function debug(...args: any[]): void {
  if (isDebugMode) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * Translate text from source to target language.
 * Tries HTTP API first, then Puppeteer fallback.
 */
export async function translateText(
  text: string,
  from = 'en',
  to = 'vi'
): Promise<string> {
  try {
    debug(`Attempting translation via HTTP API: "${text}" from ${from} to ${to}`);
    // Primary: use the HTTP-based unofficial API
    const res = await translate(text, { from, to });
    debug(`Received translation: "${res.text}"`);
    debug('HTTP translation successful');
    return res.text;
  } catch (httpErr) {
    debug('HTTP translate failed, falling back to Puppeteer:', httpErr);
    if (!process.env.QUIET && !process.argv.includes('--quiet')) {
      console.warn('API translation failed, falling back to browser-based translation. This may take longer...');
    }

    try {
      // Try to find Chrome executable
      debug(`Looking for Chrome at: ${CHROME_PATH}`);
      
      // Fallback: scrape translate.google.com via puppeteer-core
      const browser = await launchPuppeteer({
        executablePath: CHROME_PATH,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      try {
        debug('Browser launched successfully');
        const page = await browser.newPage();
        // Disable navigation timeout for slow connections
        await page.setDefaultNavigationTimeout(30000);
        
        const url = `https://translate.google.com/?sl=${from}&tl=${to}&text=${encodeURIComponent(
          text
        )}&op=translate`;
        debug(`Navigating to: ${url}`);
        
        await page.goto(url, { waitUntil: 'networkidle2' });
        debug('Page loaded, waiting for translation element');

        // wait for the translated span
        await page.waitForSelector('span[jsname="W297wb"]', { timeout: 10000 });
        debug('Translation element found, extracting result');
        
        const result = await page.evaluate(() => {
          const el = document.querySelector('span[jsname="W297wb"]');
          return el?.textContent || '';
        });
        
        if (!result) {
          debug('Empty translation result received');
          throw new Error('Translation failed: Empty result received from Google Translate');
        }
        
        debug(`Translation successful: "${result}"`);
        return result;
      } finally {
        debug('Closing browser');
        await browser.close();
      }
    } catch (browserErr) {
      debug('Browser translation failed:', browserErr);
      throw new Error(`Translation failed: ${browserErr instanceof Error ? browserErr.message : String(browserErr)}`);
    }
  }
}
