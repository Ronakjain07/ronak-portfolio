import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
for (const [W,H,label] of [[390,844,'iPhone 12/13/14'],[360,740,'small Android'],[430,932,'iPhone Pro Max'],[1440,900,'desktop']]) {
  const page = await browser.newPage()
  await page.setViewport({ width: W, height: H, isMobile: W < 700, hasTouch: W < 700 })
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
  await page.waitForFunction('window.__nameMix > 0.9', { timeout: 30000 })
  await new Promise(r => setTimeout(r, 600))
  const r = await page.evaluate(() => {
    const b = window.__nameBounds
    const iw = window.innerWidth, ih = window.innerHeight
    const visH = 2 * Math.tan((55/2) * Math.PI/180) * 7
    const visW = visH * (iw / ih)
    const pxPerUnit = iw / visW
    const halfText = b.w / 2
    // screen px positions of the text edges with a centred camera
    const leftPx = Math.round(iw/2 - halfText * pxPerUnit)
    const rightPx = Math.round(iw/2 + halfText * pxPerUnit)
    // worst case: camera parallax pushes the view up to 0.85 units sideways
    // Scene.jsx damps parallax to 15% while a word is held, so this is
    // the real worst-case camera swing during the formation.
    const shiftPx = 0.85 * 0.15 * pxPerUnit
    return { iw, leftPx, rightPx, marginPx: leftPx,
             clippedStatic: leftPx < 0 || rightPx > iw,
             clippedAtMaxParallax: (leftPx - shiftPx) < 0 || (rightPx + shiftPx) > iw }
  })
  console.log(`${label.padEnd(16)} vw=${String(r.iw).padStart(4)}  text spans ${r.leftPx}..${r.rightPx}px  margin=${r.marginPx}px  static:${r.clippedStatic?'CLIPPED':'ok'}  maxParallax:${r.clippedAtMaxParallax?'CLIPPED':'ok'}`)
  await page.close()
}
await browser.close()
