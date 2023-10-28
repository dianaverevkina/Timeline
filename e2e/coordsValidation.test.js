import puppeteer from 'puppeteer';

const childProcess = require('child_process');

describe('CRM', () => {
  let browser;
  let page;
  let server;

  const baseUrl = 'http://localhost:9000';
  beforeEach(async () => {
    server = await childProcess.fork(`${__dirname}/e2e.server.js`);
    await new Promise((resolve, reject) => {
      server.on('error', () => {
        reject();
      });
      server.on('message', (message) => {
        if (message === 'ok') {
          resolve();
        }
      });
    });
    browser = await puppeteer.launch({
      // headless: true,
      // slowMo: 100,
      // devtools: false,
    });
    page = await browser.newPage();
    await page.goto(baseUrl);
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(baseUrl, []);

    await page.waitForSelector('.timeline');
    const input = await page.$('.timeline__input');
    await input.type('Lorem.');
    await page.keyboard.press('Enter');
  });
  afterEach(async () => {
    await browser.close();
    server.kill();
  });

  jest.setTimeout(60000);

  test('A new post should appear after filling out form correct and clicking popover button', async () => {
    const message = await page.waitForSelector('.message');
    const inputCoords = await message.$('.message__input');
    const btnPublish = await message.$('.message__btn-save');

    await inputCoords.type('51.50851, -0.12572');
    await btnPublish.click();
    await page.waitForSelector('.post');

    const post = await page.evaluate(() => document.querySelector('.post'));

    expect(post).toBeDefined();
  });

  test('A new post should appear after filling out form correct and clicking popover button', async () => {
    const message = await page.waitForSelector('.message');
    const inputCoords = await message.$('.message__input');
    const btnPublish = await message.$('.message__btn-save');

    await inputCoords.type('51.50851,-0.12572');
    await btnPublish.click();
    await page.waitForSelector('.post');

    const post = await page.evaluate(() => document.querySelector('.post'));

    expect(post).toBeDefined();
  });

  test('A new post should appear after filling out form correct and clicking popover button', async () => {
    const message = await page.waitForSelector('.message');
    const inputCoords = await message.$('.message__input');
    const btnPublish = await message.$('.message__btn-save');

    await inputCoords.type('[51.50851, -0.12572]');
    await btnPublish.click();
    await page.waitForSelector('.post');

    const post = await page.evaluate(() => document.querySelector('.post'));

    expect(post).toBeDefined();
  });

  test('A tooltip should appear after filling out forn incorrect', async () => {
    const message = await page.waitForSelector('.message');
    const inputCoords = await message.$('.message__input');
    await inputCoords.type('[51.5 -0.12572]');

    const tooltip = await page.evaluate(() => document.querySelector('.message .message__tooltip'));

    expect(tooltip).toBeDefined();
  });
});
