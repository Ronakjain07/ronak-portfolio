// Drives the easter eggs: bottom-of-page SAY HI and the logo-click heart.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 9000)) // intro formation fully released

// egg 1: scroll hard to the bottom → starfield says hi
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await new Promise((r) => setTimeout(r, 2600))
await page.screenshot({ path: `${OUT}/egg-sayhi.png` })
await new Promise((r) => setTimeout(r, 4500)) // release + settle

// egg 2: back to top, five quick logo clicks → heart
await page.evaluate(() => window.scrollTo(0, 0))
await new Promise((r) => setTimeout(r, 1200))
for (let i = 0; i < 5; i++) {
  await page.click('.nav-brand')
  await new Promise((r) => setTimeout(r, 120))
}
await new Promise((r) => setTimeout(r, 2400))
await page.screenshot({ path: `${OUT}/egg-heart.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
