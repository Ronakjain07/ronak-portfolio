// Waits out the idle timer to capture the SCROLL whisper formation.
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
// let the intro formation pass, then wait for the idle egg's mix rise
await new Promise((r) => setTimeout(r, 7000))
await page.waitForFunction('window.__nameMix > 0.9', { timeout: 20000 })
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: `${OUT}/egg-idle-scroll.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
