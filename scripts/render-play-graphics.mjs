// Grafiche Google Play: icona 512x512 e immagine in evidenza 1024x500 (da assets/icon.svg).
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';

const OUT = 'store-assets/play';
await mkdir(OUT, { recursive: true });
const svg = await readFile('assets/icon.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
await page.setContent(`<html><body style="margin:0">${svg.replace('width="1024" height="1024"', 'width="512" height="512"')}</body></html>`);
await page.screenshot({ path: `${OUT}/icon-512.png` });

await page.setViewportSize({ width: 1024, height: 500 });
const pill = (label, c) => `<div style="padding:10px 22px;border-radius:14px;background:${c};color:#fff;font:800 28px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.35)">${label}</div>`;
await page.setContent(`<html><body style="margin:0;width:1024px;height:500px;overflow:hidden;
  background:radial-gradient(circle at 80% 30%,#4f46e555,transparent 55%),linear-gradient(135deg,#0b0f19,#1e1b4b);font-family:system-ui">
  <div style="position:absolute;left:70px;top:115px;display:flex;align-items:center;gap:34px">
    <div style="width:270px;height:270px;border-radius:60px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.5)">${svg.replace('width="1024" height="1024"', 'width="270" height="270"')}</div>
    <div style="color:#fff;font-weight:900;font-size:80px;letter-spacing:-2px;margin-top:-70px">OmniTransit</div>
  </div>
  <div style="position:absolute;left:374px;top:300px;display:flex;gap:16px">
    ${pill('🚇 M3', '#ca8a04')}${pill('🚌 36', '#e11d48')}${pill('🚆 R38', '#65a30d')}
  </div>
</body></html>`);
await page.screenshot({ path: `${OUT}/feature-graphic-1024x500.png` });
await browser.close();
console.log('play graphics rendered');
