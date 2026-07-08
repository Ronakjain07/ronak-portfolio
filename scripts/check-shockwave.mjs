// Clicks the particle field and captures the ripple at two moments.
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
await new Promise((r) => setTimeout(r, 8500)) // preloader + name + title settle

await page.mouse.click(720, 620) // into the dunes
await new Promise((r) => setTimeout(r, 140))
await page.screenshot({ path: `${OUT}/shock-1-early.png` })
await new Promise((r) => setTimeout(r, 260))
await page.screenshot({ path: `${OUT}/shock-2-expanding.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
