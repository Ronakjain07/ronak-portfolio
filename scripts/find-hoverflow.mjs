import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 7000))
const r = await page.evaluate(() => {
  const de = document.documentElement
  const out = { docScrollW: de.scrollWidth, docClientW: de.clientWidth,
                bodyScrollW: document.body.scrollWidth, bodyOffsetW: document.body.offsetWidth, sections: [] }
  // which top-level blocks are themselves wider than the viewport?
  document.querySelectorAll('main > section, main, .grain, .webgl, .preloader').forEach(el => {
    if (el.scrollWidth > de.clientWidth + 1 || el.getBoundingClientRect().width > de.clientWidth + 1) {
      out.sections.push({
        el: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''),
        scrollW: el.scrollWidth, rectW: Math.round(el.getBoundingClientRect().width),
        overflowX: getComputedStyle(el).overflowX,
      })
    }
  })
  return out
})
console.log(JSON.stringify(r, null, 2))
await browser.close()
