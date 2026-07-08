// Quick spot-check: About card (photo) + contact links, desktop + mobile.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
})
const page = await browser.newPage()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await sleep(5600)
await page.evaluate(() => {
  const el = document.querySelector('#about')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await sleep(2400)
await page.screenshot({ path: `${OUT}/spot-about.png` })

await page.evaluate(() => {
  const el = document.querySelector('#contact')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await sleep(2400)
await page.screenshot({ path: `${OUT}/spot-contact.png` })

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await page.evaluate(() => {
  const el = document.querySelector('#about')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await sleep(2200)
await page.screenshot({ path: `${OUT}/spot-about-mobile.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
