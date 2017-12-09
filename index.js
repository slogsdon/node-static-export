const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mkdirp = require('mkdirp');
const path = require('path');
const fs = require('fs');

const QUIET = false;
const BUILD = 'build';

const context = process.cwd();
const prompt = '  >';
const uriSeparator = '/';

let outDir;
let buildDir;
let quiet;

const log = msg => !quiet && console.log(msg ? msg : '');

const tryClose = (server) => {
  log();
  log(`[Export] Closing server...`);

  try { server && server.close(); } catch (e) {}
};

// super sophisticated cache
const routeCache = [];

const crawlAndWrite = async (chrome, address, route) => {
  // ignore routes already visited
  if (routeCache.indexOf(route) !== -1) {
    return;
  }

  routeCache.push(route);

  // obtain page HTML
  const page = await chrome.newPage();
  const response = await page.goto(`http://${address.address}:${address.port}${route}`, {waitUntil: 'networkidle2'});
  const html = await page.evaluate(() => (
    new XMLSerializer().serializeToString(document.doctype) + document.documentElement.outerHTML
  ));

  // write HTML
  const destDir = path.join.apply(
    path,
    [buildDir].concat(route.split(uriSeparator).filter(p => p))
  );
  const outFile = destDir.endsWith('.html')
    ? destDir
    : (destDir + uriSeparator + 'index.html');

  mkdirp.sync(destDir);
  fs.writeFileSync(outFile, html);

  log(`${prompt} Saved ${route} to ${destDir.replace(context, '').replace('/.static-export', '')}${uriSeparator}index.html`);

  // crawl page HTML for internal links
  const $ = cheerio.load(html);
  const promises = [];
  $('a')
    .not('[href^="http"]')
    .map((i, el) => (
      promises.push(crawlAndWrite(chrome, address, $(el).attr('href')))
    ));
  await Promise.all(promises);

  return;
};

const start = async (server, address, options) => {
  if (!options) {
    options = {};
  }

  outDir = path.join(context, options.path || BUILD);
  buildDir = path.join(outDir, '.static-export');
  quiet = options.quiet || QUIET;

  const chrome = await puppeteer.launch();

  try {
    await crawlAndWrite(chrome, address, uriSeparator);
  } catch (e) { log(e); }

  chrome.close();
  tryClose(server);

  mkdirp.sync(buildDir);

  fs.readdirSync(buildDir)
    .map(p => (
      fs.renameSync(
        path.join(buildDir, p),
        path.join(outDir, p)
      )
    ));
  fs.rmdirSync(buildDir);
};

module.exports = {
  log,
  start,
  tryClose,
};
