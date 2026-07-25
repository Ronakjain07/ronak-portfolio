// Verifies the "Molten Ignition" preloader end-to-end using condition-based
// waits on real CSS state (not fixed delays, which drift with page-load
// jitter) — entrance, mid-pour, pour-complete/ignition, burst-in-progress,
// post-handoff app state, and that reduced-motion skips straight through.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars', '--force-color-profile=srgb'],
})
const errors = []

const fillPercent = async (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.preloader-wordmark-fill')
    if (!el) return null
    const m = getComputedStyle(el).clipPath.match(/inset\(0px ([\d.]+)/)
    return m ? 100 - parseFloat(m[1]) : null
  })

// ── full sequence, normal motion ──
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(URL, { waitUntil: 'networkidle0' })

await page.screenshot({ path: `${OUT}/pre-entrance.png` })

await page.waitForFunction(() => {
  const el = document.querySelector('.preloader-wordmark-fill')
  const m = el && getComputedStyle(el).clipPath.match(/inset\(0px ([\d.]+)/)
  return m && parseFloat(m[1]) < 60 // ~40%+ poured
})
await page.screenshot({ path: `${OUT}/pre-mid-pour.png` })

await page.waitForFunction(() => {
  const el = document.querySelector('.preloader-wordmark-fill')
  return el && getComputedStyle(el).clipPath.includes('inset(0px 0%')
})
await page.screenshot({ path: `${OUT}/pre-pour-complete.png` }) // ignition-catch flash window

// burst: wordmark opacity actively dropping (fade-out + burst embers firing)
await page.waitForFunction(() => {
  const el = document.querySelector('.preloader-wordmark')
  return el && parseFloat(getComputedStyle(el).opacity) < 0.85
})
await page.screenshot({ path: `${OUT}/pre-burst.png` })

await page.waitForFunction(() => getComputedStyle(document.querySelector('.preloader')).display === 'none')
await new Promise((r) => setTimeout(r, 200)) // let trailing embers settle a touch
await page.screenshot({ path: `${OUT}/pre-post-handoff.png` })

const state = await page.evaluate(() => ({
  htmlClass: document.documentElement.className,
  navReady: document.querySelector('.nav')?.classList.contains('is-ready'),
  preloaderDisplay: getComputedStyle(document.querySelector('.preloader')).display,
  scrollWorks: (() => {
    window.scrollTo(0, 300)
    return window.scrollY
  })(),
}))
console.log('post-handoff state:', JSON.stringify(state))
await page.close()

// ── reduced motion: preloader must be skipped entirely, instantly ──
const reducedPage = await browser.newPage()
await reducedPage.setViewport({ width: 1440, height: 900 })
reducedPage.on('pageerror', (e) => errors.push('[reduced] ' + e.message))
await reducedPage.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await reducedPage.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))
const reducedState = await reducedPage.evaluate(() => ({
  preloaderDisplay: getComputedStyle(document.querySelector('.preloader')).display,
  navReady: document.querySelector('.nav')?.classList.contains('is-ready'),
}))
console.log('reduced-motion state (display:none, navReady:true almost immediately):', JSON.stringify(reducedState))
await reducedPage.screenshot({ path: `${OUT}/pre-reduced-motion.png` })
await reducedPage.close()

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
