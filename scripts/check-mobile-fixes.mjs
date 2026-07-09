// 1) Mobile + slow network: the RONAK intro must wait for the three.js
//    chunk and still form fully (and fit the narrow viewport).
// 2) Sound-enabled visitor hovering before any click must not trigger
//    Chrome's AudioContext autoplay warning.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})

// ── mobile name formation under throttling ──
const mobile = await browser.newPage()
await mobile.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const cdp = await mobile.createCDPSession()
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (750 * 1024) / 8, // ~750 kbps — chunk lands after preloader
  uploadThroughput: (500 * 1024) / 8,
})
const mobileErrors = []
mobile.on('pageerror', (e) => mobileErrors.push(e.message))
// domcontentloaded, NOT networkidle — we must watch the FIRST formation
// (the intro), not whatever egg fires later
await mobile.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 })
const intro = await mobile.evaluate(
  () =>
    new Promise((resolve) => {
      const t0 = performance.now()
      const iv = setInterval(() => {
        if ((window.__nameMix || 0) > 0.9) {
          clearInterval(iv)
          const heroEl = document.querySelector('.hero-el')
          resolve({
            formed: true,
            atSec: +((performance.now() - t0) / 1000).toFixed(1),
            // must still be '0' — hero waits for the intro, not the preloader
            heroOpacityAtForm: heroEl ? getComputedStyle(heroEl).opacity : 'missing',
          })
        } else if (performance.now() - t0 > 60000) {
          clearInterval(iv)
          resolve({ formed: false })
        }
      }, 120)
    }),
)
const bounds = await mobile.evaluate(() => window.__nameBounds)
const sampler = await mobile.evaluate(() => window.__samplerDebug)
console.log('name bounds:', JSON.stringify(bounds), 'sampler:', JSON.stringify(sampler))
await new Promise((r) => setTimeout(r, 1100)) // particles settle into the glyphs
await mobile.screenshot({ path: `${OUT}/fix-mobile-name.png` })
await mobile.close()

// ── audio warning on hover with sound persisted on ──
const desktop = await browser.newPage()
await desktop.setViewport({ width: 1440, height: 900 })
await desktop.evaluateOnNewDocument(() => localStorage.setItem('rj-sound', '1'))
const audioWarnings = []
desktop.on('console', (msg) => {
  if (msg.text().includes('AudioContext')) audioWarnings.push(msg.text())
})
await desktop.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6000))
// hover links without clicking — the old code created the ctx here
await desktop.mouse.move(500, 38)
await new Promise((r) => setTimeout(r, 300))
await desktop.mouse.move(560, 38)
await new Promise((r) => setTimeout(r, 800))
await desktop.close()

console.log(
  `intro=${JSON.stringify(intro)} audioWarnings=${audioWarnings.length} ` +
    (mobileErrors.length ? 'MOBILE ERRORS: ' + mobileErrors.join(' | ') : 'no js errors'),
)
await browser.close()
