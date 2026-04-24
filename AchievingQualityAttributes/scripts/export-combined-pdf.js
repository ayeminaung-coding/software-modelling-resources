const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

const ROOT_DIR = path.resolve(__dirname, '..');
const SLIDES_DIR = path.join(ROOT_DIR, 'slides');
const SHARED_CSS = path.join(ROOT_DIR, 'shared', 'css', 'slides.css');
const OUTPUT_DIR = path.join(ROOT_DIR, 'exports');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'AchievingQualityAttributes.pdf');

function toNumberedSort(a, b) {
  const aNum = Number((a.match(/^(\d+)/) || [])[1]);
  const bNum = Number((b.match(/^(\d+)/) || [])[1]);

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
    return aNum - bNum;
  }

  return a.localeCompare(b);
}

function getSlideFiles() {
  return fs
    .readdirSync(SLIDES_DIR)
    .filter((name) => /^\d+-.+\.html$/i.test(name))
    .sort(toNumberedSort)
    .map((name) => path.join(SLIDES_DIR, name));
}

function loadCssText() {
  return fs.readFileSync(SHARED_CSS, 'utf8');
}

async function collectSlides(page, slideFiles) {
  const slides = [];

  for (const filePath of slideFiles) {
    const fileUrl = pathToFileURL(filePath).href;
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForNetworkIdle({ idleTime: 150, timeout: 1500 }).catch(() => {});
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 1500 }).catch(() => {});

    const slideData = await page.evaluate(() => {
      const slide = document.querySelector('.slide');
      const inlineStyleText = Array.from(document.querySelectorAll('head style'))
        .map((styleEl) => styleEl.textContent || '')
        .join('\n');

      return {
        slideHtml: slide ? slide.outerHTML : null,
        inlineStyleText
      };
    });

    if (!slideData || !slideData.slideHtml) {
      throw new Error(`No .slide element found in ${path.basename(filePath)}`);
    }

    slides.push(slideData);
  }

  return slides;
}

function buildCombinedDocument(cssText, slides) {
  const pages = slides
    .map((slideData) => {
      const localStyles = slideData.inlineStyleText || '';
      const styleBlock = localStyles.trim() ? `<style>${localStyles}</style>` : '';
      return `<section class=\"pdf-page\">${styleBlock}${slideData.slideHtml}</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Achieving Quality Attributes - Combined PDF</title>
  <style>
    ${cssText}

    @page {
      size: 13.333in 7.5in;
      margin: 0;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #ffffff;
    }

    .pdf-page {
      width: 100%;
      min-height: 100vh;
      height: auto;
      overflow: visible;
      break-after: page;
      page-break-after: always;
    }

    .pdf-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }

    .pdf-page .slide {
      width: 100%;
      min-height: 100vh;
      height: auto !important;
      overflow: visible !important;
    }

    .pdf-page .content-area {
      overflow: visible !important;
      max-height: none !important;
    }
  </style>
</head>
<body>
${pages}
</body>
</html>`;
}

async function run() {
  if (!fs.existsSync(SHARED_CSS)) {
    throw new Error(`Shared CSS file not found: ${SHARED_CSS}`);
  }

  const slideFiles = getSlideFiles();
  if (slideFiles.length === 0) {
    throw new Error(`No slide HTML files found in ${SLIDES_DIR}`);
  }
  const cssText = loadCssText();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setJavaScriptEnabled(true);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const requestUrl = request.url();
      const shouldBlockNavigationScript =
        request.resourceType() === 'script' && /\/shared\/js\/navigation\.js$/i.test(requestUrl);

      if (shouldBlockNavigationScript) {
        request.abort();
        return;
      }

      request.continue();
    });

    const slides = await collectSlides(page, slideFiles);
    const combinedHtml = buildCombinedDocument(cssText, slides);

    await page.setContent(combinedHtml, { waitUntil: 'domcontentloaded' });
    await page.pdf({
      path: OUTPUT_FILE,
      printBackground: true,
      width: '13.333in',
      height: '7.5in',
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    console.log(`Created ${OUTPUT_FILE}`);
    console.log(`Slides exported: ${slideFiles.length}`);
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
