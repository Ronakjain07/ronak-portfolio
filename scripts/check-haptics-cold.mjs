// Forces the real cold-load case: userActivation.hasBeenActive stubbed
// false until the first touch, proving the ignition defers to the armed
// fallback instead of burning its one shot on a blocked call.
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.evaluateOnNewDocument(() => {
  window.__vibes = []
  window.__active = false // flips on first real touch
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: (pattern) => {
      window.__vibes.push({ pattern, at: Math.round(performance.now()) })
      return true
    },
  })
  Object.defineProperty(navigator, 'userActivation', {
    configurable: true,
    get: () => ({ hasBeenActive: window.__active, isActive: window.__active }),
  })
  // flip activation on the first touch, like a browser would
  window.addEventListener('touchstart', () => { window.__active = true }, { once: true, capture: true })
  window.addEventListener('pointerdown', () => { window.__active = true }, { once: true, capture: true })
})

await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))

const isIgnition = (v) => Array.isArray(v.pattern) && v.pattern.length > 20
const cold = await page.evaluate(
  (fn) => window.__vibes.filter(eval('(' + fn + ')')).length,
  isIgnition.toString(),
)
console.log('ignition fires during cold load (expected 0 — no activation):', cold)

await page.tap('body')
await new Promise((r) => setTimeout(r, 600))
const afterTouch = await page.evaluate(
  (fn) => window.__vibes.filter(eval('(' + fn + ')')).length,
  isIgnition.toString(),
)
console.log('ignition fires after first touch (expected 1):', afterTouch)

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
