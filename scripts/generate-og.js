const { chromium } = require('playwright');
const path = require('path');

async function generateOGImage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 630 });

  const htmlPath = path.join(__dirname, 'generate-og-image.html');
  await page.goto(`file://${htmlPath}`);

  await page.screenshot({
    path: path.join(__dirname, '../public/og-image.png'),
    type: 'png'
  });

  await browser.close();
  console.log('OG image generated successfully!');
}

generateOGImage().catch(console.error);
