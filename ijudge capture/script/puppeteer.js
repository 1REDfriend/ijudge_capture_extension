const puppeteer = require('../node_modules/pupeteer');

async function scrape(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Perform scraping logic here
  const data = await page.evaluate(() => {
    // Example: Extract page title
    return document.title;
  });

  await browser.close();
  return data;
}

module.exports = scrape;
