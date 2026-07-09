// Verifies the About avatar card: 3D canvas mounts lazily, head tracks
// the cursor (left vs right shots), and the flip reveals the photo.
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
await page.evaluate(() => {
  const el = document.querySelector('#about')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
// photo is the default face — flip to reveal the 3D avatar
await page.waitForSelector('.flip-btn', { timeout: 30000 })
await page.screenshot({ path: `${OUT}/avatar-card-default-photo.png` })
await page.click('.flip-btn')
await page.waitForSelector('.about-portrait canvas', { timeout: 30000 })
await new Promise((r) => setTimeout(r, 3500))

// close-ups of the card so gaze direction is unambiguous
// (puppeteer clip is document-relative, so measure the card's rect)
const card = await page.evaluate(() => {
  const r = document.querySelector('.about-portrait').getBoundingClientRect()
  return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }
})
const gazes = [
  ['neutral', 720, 450],
  ['look-left', 60, 620],
  ['look-right', 1380, 620],
  ['look-up', 700, 60],
  ['look-down', 700, 860],
]
for (const [name, mx, my] of gazes) {
  await page.mouse.move(mx, my)
  await new Promise((r) => setTimeout(r, 900))
  await page.screenshot({ path: `${OUT}/avatar-card-${name}.png`, clip: card })
}
await page.mouse.move(1300, 250)

// flip to the real photo
await page.click('.flip-btn')
await new Promise((r) => setTimeout(r, 1100))
await page.screenshot({ path: `${OUT}/avatar-card-flipped.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
