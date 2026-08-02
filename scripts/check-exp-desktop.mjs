import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 7000))
const d = await page.evaluate(() => {
  const el = document.querySelector('.timeline-item')
  const cs = getComputedStyle(el)
  return { position: cs.position, lineShown: getComputedStyle(document.querySelector('.timeline-line')).display,
           markerShown: getComputedStyle(document.querySelector('.timeline-marker')).display,
           sectionH: Math.round(document.querySelector('#experience').getBoundingClientRect().height) }
})
console.log('desktop:', JSON.stringify(d))
await page.evaluate(() => { const e = document.querySelector('#experience'); window.scrollTo(0, e.getBoundingClientRect().top + window.scrollY + 5) })
await new Promise(r => setTimeout(r, 2200))
await page.screenshot({ path: 'E:/portfolio-new/.mob-shots/exp-desktop.png' })
await browser.close()
