const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer');

const ROOT_DIR = path.resolve(__dirname, '..');

const COURSES = {
  'analysing-architecture': {
    label: 'AnalysingArchitecture'
  },
  'design-for-change': {
    label: 'DesignForChange'
  },
  'design-for-intelligent': {
    label: 'DesignForIntelligent'
  },
  'design-for-scale': {
    label: 'DesignForScale'
  }
};

function toNumberedSort(a, b) {
  const aNum = Number((a.match(/^(\d+)/) || [])[1]);
  const bNum = Number((b.match(/^(\d+)/) || [])[1]);

  if (!Number.isNaN(aNum) && !Number.isNaN(bNum) && aNum !== bNum) {
    return aNum - bNum;
  }

  return a.localeCompare(b);
}

function findFirstExistingPath(candidates, errorMessage) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(errorMessage);
}

function resolveCoursePaths(courseKey) {
  const course = COURSES[courseKey];
  if (!course) {
    throw new Error(`Unsupported course key: ${courseKey}`);
  }

  const courseRoot = path.join(ROOT_DIR, courseKey);

  const slidesDir = findFirstExistingPath(
    [
      path.join(courseRoot, 'slides'),
      path.join(courseRoot, courseKey, 'slides'),
      path.join(courseRoot, 'lessons', 'slides'),
      path.join(courseRoot, 'lessons', courseKey, 'slides')
    ],
    `Slides directory not found for ${courseKey}`
  );

  const cssFile = findFirstExistingPath(
    [
      path.join(courseRoot, 'shared', 'css', 'slides.css'),
      path.join(courseRoot, courseKey, 'shared', 'css', 'slides.css'),
      path.join(courseRoot, 'lessons', 'shared', 'css', 'slides.css'),
      path.join(courseRoot, 'lessons', courseKey, 'shared', 'css', 'slides.css')
    ],
    `Shared CSS not found for ${courseKey}`
  );

  const outputDir = path.join(courseRoot, 'exports');
  const perSlideDir = path.join(outputDir, 'slides');
  const combinedFile = path.join(outputDir, `${course.label}.pdf`);

  return {
    course,
    courseRoot,
    slidesDir,
    cssFile,
    outputDir,
    perSlideDir,
    combinedFile
  };
}

function getSlideFiles(slidesDir) {
  return fs
    .readdirSync(slidesDir)
    .filter((name) => /^\d+[a-zA-Z0-9-]*-.+\.html$/i.test(name))
    .sort(toNumberedSort)
    .map((name) => path.join(slidesDir, name));
}

function loadCssText(cssFile) {
  return fs.readFileSync(cssFile, 'utf8');
}

async function readSlideMarkup(page, filePath) {
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

  return slideData;
}

function buildSingleSlideDocument(cssText, slideData) {
  const slideStyles = slideData.inlineStyleText || '';
  const slideHtml = slideData.slideHtml;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    ${cssText}
    ${slideStyles}

    @page {
      size: 13.333in 7.5in;
      margin: 0;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: #ffffff;
    }

    .slide {
      width: 100%;
      min-height: 100vh;
      height: auto !important;
      overflow: visible !important;
    }

    .content-area {
      overflow: visible !important;
      max-height: none !important;
    }
  </style>
</head>
<body>
${slideHtml}
</body>
</html>`;
}

function buildCombinedDocument(cssText, slideDataList, title) {
  const pages = slideDataList
    .map((slideData) => {
      const slideStyles = slideData.inlineStyleText || '';
      const styleBlock = slideStyles.trim() ? `<style>${slideStyles}</style>` : '';
      return `<section class="pdf-page">${styleBlock}${slideData.slideHtml}</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} - Combined PDF</title>
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

async function renderPdf(page, html, outputPath) {
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: '13.333in',
    height: '7.5in',
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
}

async function exportCourse(courseKey) {
  const { course, slidesDir, cssFile, outputDir, perSlideDir, combinedFile } = resolveCoursePaths(courseKey);
  const slideFiles = getSlideFiles(slidesDir);
  const cssText = loadCssText(cssFile);

  if (slideFiles.length === 0) {
    throw new Error(`No slide HTML files found for ${courseKey}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(perSlideDir, { recursive: true });

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

    const slideDataList = [];
    for (const slideFile of slideFiles) {
      const slideData = await readSlideMarkup(page, slideFile);
      slideDataList.push(slideData);

      const outputName = `${path.basename(slideFile, '.html')}.pdf`;
      const outputPath = path.join(perSlideDir, outputName);
      const oneSlideHtml = buildSingleSlideDocument(cssText, slideData);
      await renderPdf(page, oneSlideHtml, outputPath);
    }

    const combinedHtml = buildCombinedDocument(cssText, slideDataList, course.label);
    await renderPdf(page, combinedHtml, combinedFile);

    console.log(`[${courseKey}] Slides exported: ${slideFiles.length}`);
    console.log(`[${courseKey}] Combined PDF: ${combinedFile}`);
    console.log(`[${courseKey}] Per-slide PDFs: ${perSlideDir}`);
  } finally {
    await browser.close();
  }
}

async function run() {
  const arg = process.argv[2] || 'all';
  const targets = arg === 'all' ? Object.keys(COURSES) : [arg];

  for (const target of targets) {
    await exportCourse(target);
  }
}

run().catch((err) => {
  console.error(err.message || err);
  process.exitCode = 1;
});
