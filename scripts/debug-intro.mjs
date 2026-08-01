import puppeteer from 'puppeteer-core'
const W = Number(process.argv[2]) || 390, H = Number(process.argv[3]) || 844
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: [`--window-size=${W},${H}`, '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, isMobile: W < 700, hasTouch: W < 700 })
// capture the viewport dims AT SAMPLE TIME (before app code runs)
await page.evaluateOnNewDocument(() => {
  window.__atLoad = null
  const t = setInterval(() => {
    if (window.__nameBounds && !window.__atLoad) {
      window.__atLoad = { iw: window.innerWidth, ih: window.innerHeight }
      clearInterval(t)
    }
  }, 30)
})
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await page.waitForFunction('window.__nameMix > 0.95', { timeout: 30000 })
await new Promise(r => setTimeout(r, 800))
const d = await page.evaluate(() => {
  const b = window.__nameBounds
  const iw = window.innerWidth, ih = window.innerHeight
  const fov = 55, dist = 7
  const visH = 2 * Math.tan((fov / 2) * Math.PI / 180) * dist
  const visWNow = visH * (iw / ih)
  const atLoad = window.__atLoad
  const visWAtLoad = atLoad ? visH * (atLoad.iw / atLoad.ih) : null
  return {
    bounds: b,
    atSampleTime: atLoad,
    atRenderTime: { iw, ih },
    visibleWidthAtLoad: visWAtLoad ? +visWAtLoad.toFixed(2) : null,
    visibleWidthNow: +visWNow.toFixed(2),
    textHalfWidth: +(b.w / 2).toFixed(2),
    visibleHalfNow: +(visWNow / 2).toFixed(2),
    fitsNow: (b.w / 2) < (visWNow / 2),
    marginUnits: +((visWNow - b.w) / 2).toFixed(2),
  }
})
console.log(JSON.stringify(d, null, 2))
await browser.close()
