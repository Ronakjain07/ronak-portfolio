// Verifies Microsoft Clarity boots: the tag script loads from clarity.ms
// and the window.clarity queue function exists.
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
let tagRequested = false
page.on('request', (req) => {
  if (req.url().includes('clarity.ms/tag/t0sl3d501t')) tagRequested = true
})
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise((r) => setTimeout(r, 3000))
const clarityFn = await page.evaluate(() => typeof window.clarity === 'function')

console.log(
  `tagRequested=${tagRequested} windowClarity=${clarityFn} ` +
    (errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no js errors'),
)
await browser.close()
