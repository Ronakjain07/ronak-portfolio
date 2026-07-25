// Polls the real DOM/CSS state of the preloader at short intervals to get
// a ground-truth timing trace, instead of guessing screenshot delays.
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const t0 = Date.now()
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
console.log(`navigation resolved at +${Date.now() - t0}ms`)

const samples = []
for (let i = 0; i < 55; i++) {
  const s = await page.evaluate(() => {
    const root = document.querySelector('.preloader')
    const fillEl = document.querySelector('.preloader-wordmark-fill')
    const wordmark = document.querySelector('.preloader-wordmark')
    if (!root) return null
    const cs = getComputedStyle(root)
    const wcs = wordmark ? getComputedStyle(wordmark) : null
    return {
      rootOpacity: cs.opacity,
      rootDisplay: cs.display,
      wordmarkOpacity: wcs?.opacity,
      fillClip: fillEl ? getComputedStyle(fillEl).clipPath : null,
    }
  })
  samples.push(`+${Date.now() - t0}ms  ${JSON.stringify(s)}`)
  if (s === null) break // preloader div gone from DOM entirely (shouldn't happen, it's display:none not removed)
  await new Promise((r) => setTimeout(r, 120))
}
console.log(samples.join('\n'))
await browser.close()
