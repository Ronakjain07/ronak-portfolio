import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 7000))
await page.evaluate(() => {
  const el = document.querySelector('#experience')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60)
})
await new Promise(r => setTimeout(r, 1400))
await page.screenshot({ path: 'E:/portfolio-new/.mob-shots/exp-a.png' })
await page.evaluate(() => window.scrollBy(0, 700))
await new Promise(r => setTimeout(r, 1400))
await page.screenshot({ path: 'E:/portfolio-new/.mob-shots/exp-b.png' })
await page.evaluate(() => window.scrollBy(0, 640))
await new Promise(r => setTimeout(r, 1400))
await page.screenshot({ path: 'E:/portfolio-new/.mob-shots/exp-c.png' })
await browser.close()
