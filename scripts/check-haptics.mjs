// Verifies the ignition haptic logic without needing a real vibrating
// device: stubs navigator.vibrate on a mobile-emulated page and records
// every pattern the site attempts to fire, in both the cold-load case
// (no user activation) and the already-interacted case.
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

// stub vibrate BEFORE any site code runs, and report activation state
await page.evaluateOnNewDocument(() => {
  window.__vibes = []
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: (pattern) => {
      window.__vibes.push({
        pattern,
        hadActivation: navigator.userActivation ? navigator.userActivation.hasBeenActive : 'unknown',
        at: Math.round(performance.now()),
      })
      return true
    },
  })
})

await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000)) // through preloader + intro

const beforeTouch = await page.evaluate(() => ({
  vibes: window.__vibes.length,
  activation: navigator.userActivation ? navigator.userActivation.hasBeenActive : 'unknown',
}))
console.log('COLD LOAD (no touch yet):', JSON.stringify(beforeTouch))

// first touch — should trigger the armed ignition crescendo
await page.tap('body')
await new Promise((r) => setTimeout(r, 500))

const afterTouch = await page.evaluate(() => window.__vibes)
const ignition = afterTouch.find((v) => Array.isArray(v.pattern) && v.pattern.length > 20)
console.log('after first touch, total vibrate calls:', afterTouch.length)
console.log('ignition pattern fired:', !!ignition)
if (ignition) {
  const total = ignition.pattern.reduce((a, b) => a + b, 0)
  console.log('  steps:', ignition.pattern.length, '| total duration:', total, 'ms')
  console.log('  hadActivation at fire time:', ignition.hadActivation)
}

// tapping again must NOT re-fire the ignition (one-shot)
await page.tap('body')
await new Promise((r) => setTimeout(r, 400))
const ignitions = await page.evaluate(
  () => window.__vibes.filter((v) => Array.isArray(v.pattern) && v.pattern.length > 20).length,
)
console.log('ignition fire count after 2 taps (must be 1):', ignitions)

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
