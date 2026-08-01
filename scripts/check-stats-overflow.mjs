import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
for (const W of [360, 390, 430, 768, 1024, 1280, 1440]) {
  const page = await browser.newPage()
  await page.setViewport({ width: W, height: 900, isMobile: W < 700, hasTouch: W < 700 })
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 6000))
  await page.evaluate(() => {
    const el = document.querySelector('.stats-grid')
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 250)
  })
  await new Promise(r => setTimeout(r, 3000))
  const res = await page.evaluate(() => {
    const grid = document.querySelector('.stats-grid')
    const worst = [...document.querySelectorAll('.stat')].map(cell => {
      const cs = getComputedStyle(cell)
      const cr = cell.getBoundingClientRect()
      const contentRight = cr.right - parseFloat(cs.paddingRight)
      const v = cell.querySelector('.stat-value')
      // real rendered text extent, not the block box
      const range = document.createRange(); range.selectNodeContents(v)
      const tr = range.getBoundingClientRect()
      return { text: v.textContent.trim(), spill: Math.round(tr.right - contentRight) }
    })
    return {
      values: worst,
      gridOverflow: Math.round(grid.scrollWidth - grid.clientWidth),
      pageOverflow: Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth),
    }
  })
  const maxSpill = Math.max(...res.values.map(v => v.spill))
  console.log(`${String(W).padStart(4)}px  maxTextSpill=${String(maxSpill).padStart(4)}px  gridOverflow=${res.gridOverflow}  pageOverflow=${res.pageOverflow}  ${maxSpill <= 0 ? 'OK' : '*** CLIPPING ***'}`)
  await page.close()
}
await browser.close()
