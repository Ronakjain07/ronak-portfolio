// Verifies the Ember Comet Trail cursor: resting trail, hover bloom,
// data-cursor pill (unchanged mechanic), click flash, and that it's
// fully disabled under prefers-reduced-motion. Local verification only.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars'],
})
const errors = []

async function newPage(reduced = false) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  if (reduced) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: 'networkidle0' })
  await new Promise((r) => setTimeout(r, 6500)) // past preloader/intro
  return page
}

// ── resting trail: sweep the mouse across the hero to build a wake ──
const page = await newPage()
const pts = [
  [300, 400], [420, 380], [560, 420], [700, 360], [850, 440], [1000, 380], [1150, 420],
]
for (const [x, y] of pts) {
  await page.mouse.move(x, y, { steps: 6 })
  await new Promise((r) => setTimeout(r, 30))
}
await new Promise((r) => setTimeout(r, 80))
await page.screenshot({ path: `${OUT}/cursor-trail.png` })

// ── generic hover bloom ──
await page.mouse.move(700, 640) // hero "Résumé" ghost button area-ish; fall back to a safe link
await page.hover('a.nav-brand').catch(() => {})
await new Promise((r) => setTimeout(r, 500))
await page.screenshot({ path: `${OUT}/cursor-hover.png` })

// ── data-cursor pill (should still say "View ↗" etc, unchanged mechanic) ──
await page.evaluate(() => {
  const el = document.querySelector('#work')
  if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 2000))
const cursorTarget = await page.$('[data-cursor]')
if (cursorTarget) {
  const box = await cursorTarget.boundingBox()
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 10 })
    await new Promise((r) => setTimeout(r, 500))
  }
}
await page.screenshot({ path: `${OUT}/cursor-pill.png` })

// ── click flash ──
await page.mouse.move(700, 400)
await page.mouse.down()
await new Promise((r) => setTimeout(r, 90)) // mid-flash
await page.screenshot({ path: `${OUT}/cursor-click-flash.png` })
await page.mouse.up()
await page.close()

// ── reduced motion: trail canvas must stay empty ──
const reducedPage = await newPage(true)
for (const [x, y] of pts) {
  await reducedPage.mouse.move(x, y, { steps: 6 })
  await new Promise((r) => setTimeout(r, 30))
}
await new Promise((r) => setTimeout(r, 80))
await reducedPage.screenshot({ path: `${OUT}/cursor-reduced-motion.png` })
await reducedPage.close()

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
