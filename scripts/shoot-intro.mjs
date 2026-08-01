import puppeteer from 'puppeteer-core'
// no --window-size: it fights setViewport and makes the screenshot crop
// the real render, which looks exactly like clipped text.
const W = Number(process.argv[2]) || 1440, H = Number(process.argv[3]) || 900
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, isMobile: W < 700, hasTouch: W < 700, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await page.waitForFunction('window.__nameMix > 0.95', { timeout: 30000 })
await new Promise(r => setTimeout(r, 1100))
const chk = await page.evaluate(() => {
  const b = window.__nameBounds
  const visH = 2 * Math.tan((55 / 2) * Math.PI / 180) * 7
  const visW = visH * (window.innerWidth / window.innerHeight)
  return { iw: window.innerWidth, ih: window.innerHeight, textW: b.w, visW: +visW.toFixed(2),
           usesPctOfWidth: Math.round((b.w / visW) * 100) }
})
console.log(`${W}x${H} -> real viewport ${chk.iw}x${chk.ih} | text ${chk.textW}u of ${chk.visW}u visible = ${chk.usesPctOfWidth}% ${errors.length ? 'ERR:' + errors.join('|') : ''}`)
await page.screenshot({ path: `E:/portfolio-new/.mob-shots/intro-${W}.png` })
await browser.close()
