import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'
const W = Number(process.argv[4]) || 1440
const H = Number(process.argv[5]) || 900
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: [`--window-size=${W},${H}`, '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 6500))
await page.evaluate(() => {
  const el = document.querySelector('#about')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise(r => setTimeout(r, 2600))
await page.screenshot({ path: `${OUT}/about-fix-${W}.png` })
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'NO JS ERRORS')
await browser.close()
