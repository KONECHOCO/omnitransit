// Screenshot per gli store dall'app web reale con dati reali, nella lingua scelta.
// Prerequisito: `npm run dev -- --port 5174` avviato.
// Uso: node scripts/capture-store-screenshots.mjs [iphone|ipad|android] [it|en|fr|es|de|ja]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { translations } from '../src/data/translations.js';

const device = ['ipad', 'android'].includes(process.argv[2]) ? process.argv[2] : 'iphone';
const lang = process.argv[3] || 'it';
const t = translations[lang];
const SIZES = {
  iphone: { viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, suffix: '1320x2868' },
  ipad: { viewport: { width: 1032, height: 1376 }, deviceScaleFactor: 2, suffix: 'ipad-2064x2752' },
  android: { viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, suffix: 'android-1080x1920' }
};
// Per ogni lingua una città e un tragitto rappresentativi (fermate reali)
const SCENES = {
  it: { city: 'milan', from: 'Milano Centrale', to: 'Duomo M1' },
  en: { city: 'london', from: 'Paddington', to: 'London Bridge' },
  fr: { city: 'paris', from: 'Gare de Lyon', to: 'Trocadéro' },
  es: { city: 'paris', from: 'Gare du Nord', to: 'Châtelet' },
  de: { city: 'london', from: 'King\'s Cross St. Pancras', to: 'Westminster' },
  ja: { city: 'tokyo', from: '東京', to: '渋谷' }
};
const size = SIZES[device];
const scene = SCENES[lang];
const OUT = `store-assets/screenshots/${lang}`;
await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: size.viewport,
  deviceScaleFactor: size.deviceScaleFactor,
  isMobile: device !== 'ipad',
  hasTouch: true,
  locale: lang
});
await context.addInitScript(([l, c]) => {
  localStorage.setItem('omnitransit.prefs', JSON.stringify({ lang: l, cityId: c, favorites: [], recents: [] }));
}, [lang, scene.city]);
const page = await context.newPage();
await page.goto('http://localhost:5174/?storeshot');
// La barra "Pro" del browser non esiste nell'app nativa
await page.addStyleTag({ content: '.fixed.bottom-0 { display: none !important; }' });

const shot = async name => {
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${name}-${size.suffix}.png` });
  console.log('saved', lang, name);
};

const pickPlace = async (index, text) => {
  const input = page.getByPlaceholder(t.planner.placeholder).nth(index);
  await input.click();
  await input.fill(text);
  await page.waitForTimeout(2500);
  await page.locator('form .absolute.z-30 button').first().click();
};

// 1) Percorso con risultati e dettaglio aperto
await pickPlace(0, scene.from);
await pickPlace(1, scene.to);
await page.locator('form button[type="submit"]').click();
await page.waitForSelector('text=' + t.planner.sortFastest, { timeout: 60000 });
await page.waitForTimeout(1500);
await page.evaluate(() => window.scrollTo(0, 0));
await page.locator('main .glass-panel button.w-full.text-left').first().click();
await page.evaluate(() => document.querySelector('main .glass-panel button.w-full.text-left')?.scrollIntoView({ block: 'start' }));
await page.evaluate(() => window.scrollBy(0, -110));
await shot('01-percorso');

// 2) Mappa con il percorso
await page.getByText(t.planner.showMap).first().click();
await page.waitForTimeout(3500);
await shot('02-mappa');

// 3) Partenze in tempo reale
await page.locator('nav button').nth(1).click();
await page.waitForTimeout(5000);
await shot('03-partenze');

// 4) Biglietti ufficiali
await page.locator('nav button').nth(3).click();
await page.waitForTimeout(4000);
await shot('04-biglietti');

// 5) Pro
await page.locator('header button[aria-label="Pro"]').click();
await shot('05-pro');

await browser.close();
