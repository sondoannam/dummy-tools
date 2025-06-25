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
    // Primary: use the HTTP-based unofficial API
    const res = await translate(text, { from, to });
    return res.text;
  } catch (httpErr) {
    console.warn('HTTP translate failed, falling back to Puppeteer:', httpErr);

    // Fallback: scrape translate.google.com via puppeteer-core
    const browser = await launchPuppeteer({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      const url = `https://translate.google.com/?sl=${from}&tl=${to}&text=${encodeURIComponent(
        text
      )}&op=translate`;
      await page.goto(url, { waitUntil: 'networkidle2' });

      // wait for the translated span
      await page.waitForSelector('span[jsname="W297wb"]', { timeout: 5000 });
      const result = await page.evaluate(() => {
        const el = document.querySelector('span[jsname="W297wb"]');
        return el?.textContent || '';
      });
      return result;
    } finally {
      await browser.close();
    }
  }
}
