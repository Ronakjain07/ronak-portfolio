// Asserts the ambient music engine starts/stops with the navbar toggle,
// and auto-arms for returning visitors who had sound enabled.
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1280,800', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))

const before = await page.evaluate(() => !!window.__musicOn)
await page.click('.nav-sound')
await new Promise((r) => setTimeout(r, 700))
const afterOn = await page.evaluate(() => !!window.__musicOn)
await page.click('.nav-sound')
await new Promise((r) => setTimeout(r, 1200))
const afterOff = await page.evaluate(() => !!window.__musicOn)

// returning visitor: persisted on → first click anywhere starts music
await page.evaluate(() => localStorage.setItem('rj-sound', '1'))
await page.reload({ waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 7000))
await page.mouse.click(640, 500)
await new Promise((r) => setTimeout(r, 700))
const returning = await page.evaluate(() => !!window.__musicOn)

console.log(
  `initial=${before} toggleOn=${afterOn} toggleOff=${afterOff} returningVisitorAfterClick=${returning} ` +
    (errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no js errors'),
)
await browser.close()
