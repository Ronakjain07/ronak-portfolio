// Mobile audit: captures key sections at phone size and measures the
// timeline line/dot alignment that looks off on small screens.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))

const sections = ['#about', '#skills', '#experience', '#work', '#contact']
for (const sel of sections) {
  await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
  }, sel)
  await new Promise((r) => setTimeout(r, 2000))
  await page.screenshot({ path: `${OUT}/mob-${sel.replace('#', '')}.png` })
}

// measure timeline alignment
await page.evaluate(() => {
  const el = document.querySelector('#experience')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 1500))
const align = await page.evaluate(() => {
  const line = document.querySelector('.timeline-line')
  const dot = document.querySelector('.timeline-dot')
  const card = document.querySelector('.timeline-card')
  const wrap = document.querySelector('.timeline')
  if (!line || !dot) return null
  const l = line.getBoundingClientRect()
  const d = dot.getBoundingClientRect()
  const c = card?.getBoundingClientRect()
  const w = wrap.getBoundingClientRect()
  return {
    lineCenterX: +(l.left + l.width / 2).toFixed(1),
    dotCenterX: +(d.left + d.width / 2).toFixed(1),
    misalignPx: +(l.left + l.width / 2 - (d.left + d.width / 2)).toFixed(1),
    cardLeft: c ? +c.left.toFixed(1) : null,
    timelineLeft: +w.left.toFixed(1),
    viewportWidth: window.innerWidth,
  }
})
console.log('timeline alignment:', JSON.stringify(align, null, 2))
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
