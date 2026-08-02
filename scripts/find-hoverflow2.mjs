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
  const vw = document.documentElement.clientWidth
  const bad = []
  document.querySelectorAll('main *').forEach(el => {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return
    // does THIS element push its own scrollable area wider than the viewport?
    if (el.scrollWidth > vw + 1) {
      const cs = getComputedStyle(el)
      bad.push({
        el: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0,2).join('.') : ''),
        scrollW: el.scrollWidth, rectW: Math.round(rect.width),
        overflowX: cs.overflowX, transform: cs.transform === 'none' ? '' : 'T',
        id: el.id || '',
      })
    }
  })
  // only keep the innermost offenders (no offending descendant)
  return { vw, offenders: bad.slice(0, 14) }
})
console.log(JSON.stringify(r, null, 2))
await browser.close()
