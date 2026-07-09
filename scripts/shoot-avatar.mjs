// Captures the avatar from several angles for the look-judgment call.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=800,900', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 800, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto('http://localhost:5050/scripts/avatar-preview.html', { waitUntil: 'networkidle0' })
await page.waitForFunction('window.__loaded === true', { timeout: 60000 })
await new Promise((r) => setTimeout(r, 1500)) // let any idle animation settle

const info = await page.evaluate(() => window.__info)
console.log('model info:', JSON.stringify(info))

const shots = [
  ['front-bust', 'bust', 0],
  ['three-quarter-bust', 'bust', 0.55],
  ['profile-bust', 'bust', 1.2],
  ['full-body', 'full', 0.25],
]
for (const [name, frame, angle] of shots) {
  await page.evaluate(
    (f, a) => {
      window.__frame(f)
      window.__angle(a)
    },
    frame,
    angle,
  )
  await new Promise((r) => setTimeout(r, 400))
  await page.screenshot({ path: `${OUT}/avatar-${name}.png` })
}

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
