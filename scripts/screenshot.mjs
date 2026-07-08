// Visual verification: drives headless Chrome over the preview server
// (npm run preview → http://localhost:4173) and captures every signature
// moment. Usage: node scripts/screenshot.mjs <output-dir>
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars', '--force-color-profile=srgb'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })

const errors = []
page.on('pageerror', (err) => errors.push('PAGE ERROR: ' + err.message))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push('CONSOLE ERROR: ' + msg.text())
})

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const scrollTo = (sel, extra = 10) =>
  page.evaluate(
    (s, e) => {
      const el = document.querySelector(s)
      if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + e)
    },
    sel,
    extra,
  )

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 })

// shoot the "RONAK" formation at its peak: poll the live mix uniform
// instead of guessing load timing
for (let i = 0; i < 90; i++) {
  const mix = await page.evaluate(() => window.__nameMix || 0)
  if (mix > 0.96) break
  await sleep(100)
}
await sleep(250) // let the last particles settle into the glyphs
await page.screenshot({ path: `${OUT}/0-name-formation.png` })
console.log(
  'name sampled:',
  await page.evaluate(() => window.__nameSampled),
  '· mix at shot:',
  await page.evaluate(() => Math.round((window.__nameMix || 0) * 100) / 100),
)

// wait for dispersal + headline entrance, then park the cursor for the dent
for (let i = 0; i < 90; i++) {
  const mix = await page.evaluate(() => window.__nameMix || 0)
  if (mix < 0.05) break
  await sleep(100)
}
await sleep(2600)
await page.mouse.move(500, 620)
await sleep(200)
await page.mouse.move(880, 560, { steps: 12 })
await sleep(450)
await page.screenshot({ path: `${OUT}/1-hero-repel.png` })

await scrollTo('#about')
await sleep(2600)
await page.screenshot({ path: `${OUT}/2-about.png` })

await scrollTo('#skills')
await sleep(2600)
await page.screenshot({ path: `${OUT}/3-skills.png` })

await scrollTo('#experience')
await sleep(2600)
await page.screenshot({ path: `${OUT}/4-experience.png` })

// work gallery: pin start, then 60% through the horizontal scrub
await scrollTo('#work', 5)
await sleep(2200)
await page.screenshot({ path: `${OUT}/5-work-pin-start.png` })

const workMid = await page.evaluate(() => {
  const track = document.querySelector('.work-track')
  const section = document.querySelector('#work')
  const amount = track.scrollWidth - window.innerWidth
  return section.getBoundingClientRect().top + window.scrollY + amount * 0.6
})
await page.evaluate((y) => window.scrollTo(0, y), workMid)
await sleep(2400)
// hover a card so the labelled cursor pill shows
await page.mouse.move(720, 450)
await sleep(600)
await page.screenshot({ path: `${OUT}/6-work-mid-gallery.png` })

// footer: mid fill, then the very end
await page.evaluate(() => {
  const el = document.querySelector('.footer-name')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.7)
})
await sleep(2400)
await page.screenshot({ path: `${OUT}/7-contact.png` })

await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await sleep(2400)
await page.screenshot({ path: `${OUT}/8-footer-end.png` })

// mobile pass
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await page.evaluate(() => window.scrollTo(0, 0))
await sleep(2200)
await page.screenshot({ path: `${OUT}/9-mobile-hero.png` })
await scrollTo('#work')
await sleep(2400)
await page.screenshot({ path: `${OUT}/10-mobile-work.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
