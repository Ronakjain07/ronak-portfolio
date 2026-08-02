import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 7000))
const m = await page.evaluate(() => {
  const sec = document.querySelector('#experience')
  const tl = document.querySelector('.timeline')
  return {
    sectionH: Math.round(sec.getBoundingClientRect().height),
    sectionPadTop: getComputedStyle(sec).paddingTop,
    sectionPadBottom: getComputedStyle(sec).paddingBottom,
    headingH: Math.round(document.querySelector('#experience .section-heading').getBoundingClientRect().height),
    timelineH: Math.round(tl.getBoundingClientRect().height),
    cards: [...document.querySelectorAll('.timeline-item')].map(el => ({
      co: el.querySelector('.timeline-company')?.textContent.slice(0, 12),
      h: Math.round(el.getBoundingClientRect().height),
      bullets: el.querySelectorAll('.timeline-points li').length,
    })),
  }
})
console.log(JSON.stringify(m, null, 2))
await browser.close()
