import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 4000))

const m = await page.evaluate(() => {
  const measure = (el) => {
    const fs = parseFloat(getComputedStyle(el).fontSize)
    return { px: el.scrollWidth, fontSize: fs, em: +(el.scrollWidth / fs).toFixed(3) }
  }
  const [line1, line2] = document.querySelectorAll('.hero-line-inner')
  const footer = document.querySelector('.footer-name-outline')
  return {
    heroLine1_AI_ENGINEER: measure(line1),
    heroLine2_AND_DEVELOPER: measure(line2),
    footer_RONAK_JAIN: measure(footer),
  }
})
console.log(JSON.stringify(m, null, 2))
await browser.close()
