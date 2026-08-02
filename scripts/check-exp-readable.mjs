import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 7000))
// For each card, find the MAXIMUM number of its own pixels ever visible
// (not covered by the next card, and inside the viewport).
const start = await page.evaluate(() => {
  const el = document.querySelector('#experience')
  return el.getBoundingClientRect().top + window.scrollY - 200
})
const best = {}
for (let y = 0; y <= 2400; y += 40) {
  await page.evaluate(v => window.scrollTo(0, v), start + y)
  await new Promise(r => setTimeout(r, 60))
  const s = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.timeline-item')]
    return items.map((el, i) => {
      const r = el.getBoundingClientRect()
      const next = items[i + 1]?.getBoundingClientRect()
      const topVis = Math.max(r.top, 0)
      // bottom is cut by the viewport OR by the next card sliding over
      const botVis = Math.min(r.bottom, window.innerHeight, next ? next.top : Infinity)
      return { co: el.querySelector('.timeline-company')?.textContent.slice(0,10),
               h: Math.round(r.height), vis: Math.max(0, Math.round(botVis - topVis)) }
    })
  })
  s.forEach(x => { if (!best[x.co] || x.vis > best[x.co].vis) best[x.co] = x })
}
console.log('max simultaneously-visible height per card:')
for (const k in best) {
  const b = best[k]
  const pct = Math.round((b.vis / b.h) * 100)
  console.log(`  ${k.padEnd(11)} height=${b.h}  maxVisible=${b.vis}  (${pct}%) ${pct >= 99 ? 'FULLY READABLE' : '*** ' + (b.h - b.vis) + 'px NEVER VISIBLE ***'}`)
}
await browser.close()
