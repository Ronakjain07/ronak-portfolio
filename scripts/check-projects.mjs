// Verifies the Work/Projects gallery renders correctly with the new
// SiteChat project leading, and the count/order/links are correct.
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

const data = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('.work-card:not(.work-card-more)')]
  return {
    count: cards.length,
    titles: cards.map((c) => c.querySelector('.work-card-title')?.textContent),
    firstUrl: cards[0]?.querySelector('a')?.href,
    progressLabel: document.querySelector('.work-progress-label')?.textContent,
  }
})
console.log(JSON.stringify(data, null, 2))

// scroll to pin the work section and screenshot the leading card
await page.evaluate(() => {
  const el = document.querySelector('#work')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 1600))
await page.screenshot({ path: `${OUT}/proj-sitechat-lead.png` })

await page.evaluate(() => window.scrollBy(0, 500))
await new Promise((r) => setTimeout(r, 1600))
await page.screenshot({ path: `${OUT}/proj-scrolled.png` })

console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
