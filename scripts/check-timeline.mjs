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
  const items = [...document.querySelectorAll('.timeline-item')]
  return {
    count: items.length,
    order: items.map((el) => ({
      company: el.querySelector('.timeline-company')?.textContent,
      period: el.querySelector('.timeline-period')?.textContent,
    })),
    hasLine: !!document.querySelector('.timeline-line'),
  }
})
console.log(JSON.stringify(data, null, 2))

// scroll through the whole section, capturing top and the new VHM card
await page.evaluate(() => {
  const el = document.querySelector('#experience')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 2400))
await page.screenshot({ path: `${OUT}/tl-top.png` })

// check dot ignition lit at least the first items in view
const lit = await page.evaluate(
  () => document.querySelectorAll('.timeline-item.is-lit').length,
)
console.log('lit dots after scroll:', lit)
console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
