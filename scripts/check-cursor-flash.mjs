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
await new Promise((r) => setTimeout(r, 6500))

// neutral empty spot in the hero — not over any link/button/data-cursor target
await page.mouse.move(1250, 500, { steps: 8 })
await new Promise((r) => setTimeout(r, 300))
await page.mouse.down()
await new Promise((r) => setTimeout(r, 90)) // ~40% into the 0.45s keyframe
await page.screenshot({ path: `${OUT}/cursor-flash-neutral.png`, clip: { x: 1100, y: 400, width: 340, height: 200 } })
await page.mouse.up()

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
