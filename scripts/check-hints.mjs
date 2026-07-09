// Verifies the easter-egg hint system: console whisper, progressive dot
// pop, secret toast on find, and the footer breadcrumb.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars'],
})
const page = await browser.newPage()
let whisper = false
page.on('console', (msg) => {
  if (msg.text().includes('psst')) whisper = true
})
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))

// three quick clicks → dot mid-pop
for (let i = 0; i < 3; i++) {
  await page.click('.nav-brand')
  await new Promise((r) => setTimeout(r, 130))
}
await new Promise((r) => setTimeout(r, 120))
const nav = await page.evaluate(() => {
  const r = document.querySelector('.nav').getBoundingClientRect()
  return { x: 0, y: 0, width: Math.min(r.width, 500), height: r.height + 10 }
})
await page.screenshot({ path: `${OUT}/hint-dot-pop.png`, clip: nav })

// two more clicks → heart + toast
for (let i = 0; i < 2; i++) {
  await page.click('.nav-brand')
  await new Promise((r) => setTimeout(r, 130))
}
await new Promise((r) => setTimeout(r, 900))
const toast = await page.evaluate(() => document.querySelector('.secret-toast')?.textContent)
await page.screenshot({ path: `${OUT}/hint-toast.png` })

const breadcrumb = await page.evaluate(() =>
  document.querySelector('.footer-stack')?.textContent.includes('3 secrets hidden'),
)

console.log(
  `whisper=${whisper} toast="${toast}" breadcrumb=${breadcrumb} ` +
    (errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no js errors'),
)
await browser.close()
