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
  const el = document.querySelector('#experience')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 2400))
await page.screenshot({ path: `${OUT}/upd-experience-top.png` })

await page.evaluate(() => window.scrollBy(0, 620))
await new Promise((r) => setTimeout(r, 1800))
await page.screenshot({ path: `${OUT}/upd-experience-btm.png` })

const terms = await page.evaluate(() => {
  const txt = document.querySelector('#experience').textContent
  return {
    automation: (txt.match(/automat/gi) || []).length,
    aiAssisted: txt.includes('AI-assisted') || txt.includes('AI-Assisted'),
    metricsIntact: ['28%', '1.8s', '99.2%', '850+', '45 to 18', '30%', '32%', '3 new'].filter((m) =>
      txt.includes(m),
    ),
  }
})
console.log(JSON.stringify(terms))
console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
