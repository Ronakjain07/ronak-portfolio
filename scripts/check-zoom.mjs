import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
// sample everything that could read as "zoom" across the preloader boundary
await page.evaluateOnNewDocument(() => {
  window.__samples = []
  const snap = () => {
    const vv = window.visualViewport
    const hero = document.querySelector('.hero-inner')
    const canvas = document.querySelector('.webgl canvas')
    window.__samples.push({
      t: Math.round(performance.now()),
      vvScale: vv ? +vv.scale.toFixed(3) : null,
      vvW: vv ? Math.round(vv.width) : null,
      vvH: vv ? Math.round(vv.height) : null,
      iw: window.innerWidth, ih: window.innerHeight,
      docW: document.documentElement.clientWidth,
      htmlClass: document.documentElement.className,
      preloader: (() => { const p = document.querySelector('.preloader'); return p ? getComputedStyle(p).display : 'none' })(),
      heroTransform: hero ? getComputedStyle(hero).transform.slice(0, 40) : null,
      canvasCSS: canvas ? `${canvas.style.width}x${canvas.style.height}` : null,
      canvasAttr: canvas ? `${canvas.width}x${canvas.height}` : null,
      bodyW: Math.round(document.body.getBoundingClientRect().width),
    })
  }
  setInterval(snap, 150)
  snap()
})
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 9000))
const s = await page.evaluate(() => window.__samples)
// print only rows where something changed
let prev = null
for (const row of s) {
  const key = JSON.stringify({ ...row, t: 0 })
  if (key !== prev) { console.log(JSON.stringify(row)); prev = key }
}
await browser.close()
