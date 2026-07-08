// Renders scripts/og-template.html to public/og.png (1200×630) — the
// social share card used by og:image / twitter:image.
import puppeteer from 'puppeteer-core'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--force-color-profile=srgb', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })
await page.goto('file:///' + path.join(root, 'scripts', 'og-template.html').replace(/\\/g, '/'), {
  waitUntil: 'networkidle0',
})
await new Promise((r) => setTimeout(r, 600)) // fonts settle
await page.screenshot({ path: path.join(root, 'public', 'og.png') })
await browser.close()
console.log('public/og.png written')
