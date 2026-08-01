import puppeteer from 'puppeteer-core'
const W = Number(process.argv[2]) || 1440
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: [`--window-size=${W},900`, '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: 900, isMobile: W < 700, hasTouch: W < 700, deviceScaleFactor: 2 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 6500))
await page.evaluate(() => {
  const el = document.querySelector('.stats-grid')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 260)
})
await new Promise(r => setTimeout(r, 3200))
const el = await page.$('.stats-grid')
await el.screenshot({ path: `E:/portfolio-new/.mob-shots/stats-${W}.png` })
await browser.close()
