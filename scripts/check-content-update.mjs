import puppeteer from 'puppeteer-core'
const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--window-size=1440,900', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6500))
for (const [name, sel] of [['experience', '#experience'], ['achievements', '.achievements']]) {
  await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
  }, sel)
  await new Promise((r) => setTimeout(r, 2200))
  await page.screenshot({ path: `${OUT}/upd-${name}.png` })
}
const txt = await page.evaluate(() => document.body.innerText)
console.log('CGPA 8.76 on page:', txt.includes('8.76'))
console.log('Royal Enfield/KTM/MYK:', txt.includes('Royal Enfield') && txt.includes('KTM') && txt.includes('MYK'))
console.log('Rajya Puraskar:', txt.includes('Rajya Puraskar'))
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO JS ERRORS')
await browser.close()
