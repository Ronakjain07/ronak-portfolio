// Verifies the mobile swipe carousel (snap points + progress indicator)
// and confirms the desktop pinned scrub still works unchanged.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const errors = []

// ── MOBILE ──
const m = await browser.newPage()
await m.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
m.on('pageerror', (e) => errors.push('[mobile] ' + e.message))
await m.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))
await m.evaluate(() => {
  const el = document.querySelector('#work')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 1500))

const before = await m.evaluate(() => {
  const vp = document.querySelector('.work-viewport')
  return {
    isScrollable: vp.scrollWidth > vp.clientWidth,
    scrollLeft: vp.scrollLeft,
    snapType: getComputedStyle(vp).scrollSnapType,
    progressVisible: getComputedStyle(document.querySelector('.work-progress')).display,
    label: document.querySelector('.work-progress-label')?.textContent.trim(),
    fill: document.querySelector('.work-progress-fill')?.style.transform,
  }
})
await m.screenshot({ path: `${OUT}/car-mob-start.png` })

// swipe to the end of the carousel
await m.evaluate(() => {
  const vp = document.querySelector('.work-viewport')
  vp.scrollTo({ left: vp.scrollWidth - vp.clientWidth, behavior: 'instant' })
})
await new Promise((r) => setTimeout(r, 600))
const after = await m.evaluate(() => ({
  scrollLeft: Math.round(document.querySelector('.work-viewport').scrollLeft),
  label: document.querySelector('.work-progress-label')?.textContent.trim(),
  fill: document.querySelector('.work-progress-fill')?.style.transform,
}))
await m.screenshot({ path: `${OUT}/car-mob-end.png` })
console.log('MOBILE before:', JSON.stringify(before))
console.log('MOBILE after :', JSON.stringify(after))

// page must not scroll horizontally as a whole
const overflow = await m.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
)
console.log('MOBILE page horizontal overflow:', overflow, 'px')
await m.close()

// ── DESKTOP (regression check: pin still works) ──
const d = await browser.newPage()
await d.setViewport({ width: 1440, height: 900 })
d.on('pageerror', (e) => errors.push('[desktop] ' + e.message))
await d.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))
await d.evaluate(() => {
  const el = document.querySelector('#work')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 1200))
const deskStart = await d.evaluate(() => ({
  trackX: getComputedStyle(document.querySelector('.work-track')).transform,
  label: document.querySelector('.work-progress-label')?.textContent.trim(),
}))
await d.evaluate(() => window.scrollBy(0, 1200))
await new Promise((r) => setTimeout(r, 1500))
const deskAfter = await d.evaluate(() => ({
  trackX: getComputedStyle(document.querySelector('.work-track')).transform,
  label: document.querySelector('.work-progress-label')?.textContent.trim(),
}))
console.log('DESKTOP start:', JSON.stringify(deskStart))
console.log('DESKTOP after:', JSON.stringify(deskAfter))
await d.screenshot({ path: `${OUT}/car-desktop.png` })
await d.close()

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
