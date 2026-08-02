import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
// sample the preloader's opacity from the very first frames
await page.evaluateOnNewDocument(() => {
  window.__op = []
  const t = setInterval(() => {
    const p = document.querySelector('.preloader')
    if (!p) return
    const cs = getComputedStyle(p)
    window.__op.push({ t: Math.round(performance.now()), opacity: +cs.opacity, display: cs.display })
    if (window.__op.length > 90) clearInterval(t)
  }, 30)
})
await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' })
await new Promise(r => setTimeout(r, 2600))
const s = await page.evaluate(() => window.__op)
const visible = s.filter(x => x.display !== 'none')
const seeThrough = visible.filter(x => x.opacity < 0.99)
console.log('samples while preloader shown:', visible.length)
console.log('frames where backdrop was see-through (hero would flash):', seeThrough.length)
if (seeThrough.length) console.log('  worst:', JSON.stringify(seeThrough.slice(0, 5)))
console.log('first 5 opacities:', JSON.stringify(visible.slice(0, 5).map(x => x.opacity)))
await browser.close()
