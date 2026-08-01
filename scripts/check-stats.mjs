import puppeteer from 'puppeteer-core'
const URL = process.argv[2] || 'http://localhost:4173/'
const W = Number(process.argv[3]) || 390
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: [`--window-size=${W},844`, '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: 844, isMobile: W < 700, hasTouch: W < 700, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 6500))

// scroll so the stats grid is just entering view, then sample the counters
await page.evaluate(() => {
  const el = document.querySelector('.stats-grid')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.85)
})
const samples = []
for (let i = 0; i < 10; i++) {
  samples.push(await page.evaluate(() =>
    [...document.querySelectorAll('.stat-value')].map(e => e.textContent.trim()).join(' | ')))
  await new Promise(r => setTimeout(r, 350))
}
console.log('counter samples over ~3.5s:')
samples.forEach((s, i) => console.log(`  t+${(i * 0.35).toFixed(2)}s  ${s}`))

const metrics = await page.evaluate(() => {
  return [...document.querySelectorAll('.stat')].map(cell => {
    const v = cell.querySelector('.stat-value')
    const cs = getComputedStyle(cell)
    const inner = cell.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
    return {
      text: v.textContent.trim(),
      textW: Math.round(v.scrollWidth),
      availW: Math.round(inner),
      overflow: Math.round(v.scrollWidth - inner),
      fontSize: getComputedStyle(v).fontSize,
    }
  })
})
console.log('\nstat cell measurements (viewport ' + W + 'px):')
console.table ? console.table(metrics) : console.log(JSON.stringify(metrics, null, 2))
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'NO JS ERRORS')
await browser.close()
