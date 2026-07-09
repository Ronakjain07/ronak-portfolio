// Renders the sampling canvas inside the throttled mobile environment
// and saves it as a PNG so we can see exactly what got inked.
import puppeteer from 'puppeteer-core'
import { writeFileSync } from 'node:fs'

const OUT = process.argv[2] || '.'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 })
const cdp = await page.createCDPSession()
await cdp.send('Network.enable')
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 150,
  downloadThroughput: (750 * 1024) / 8,
  uploadThroughput: (500 * 1024) / 8,
})
await page.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded', timeout: 60000 })

const result = await page.evaluate(async () => {
  // identical to the app's sampler timing
  try {
    await Promise.race([
      document.fonts.load('800 140px Syne'),
      new Promise((resolve) => setTimeout(resolve, 3500)),
    ])
  } catch {
    /* ignore */
  }
  const text = 'RONAK'
  const fontSize = 140
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.font = `800 ${fontSize}px Syne, sans-serif`
  const measured = ctx.measureText(text).width
  canvas.width = Math.ceil(measured) + 40
  canvas.height = Math.ceil(fontSize * 1.5)
  ctx.font = `800 ${fontSize}px Syne, sans-serif`
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#fff'
  ctx.fillText(text, 20, canvas.height / 2)

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  // repaint on black so the dump is visible
  const dump = document.createElement('canvas')
  dump.width = canvas.width
  dump.height = canvas.height
  const dctx = dump.getContext('2d')
  dctx.fillStyle = '#000'
  dctx.fillRect(0, 0, dump.width, dump.height)
  dctx.drawImage(canvas, 0, 0)

  return {
    measured: Math.round(measured),
    canvasW: canvas.width,
    canvasH: canvas.height,
    inkW: maxX - minX,
    inkH: maxY - minY,
    syneCheck: document.fonts.check('800 140px Syne'),
    dataUrl: dump.toDataURL(),
  }
})

console.log(
  `measured=${result.measured} canvas=${result.canvasW}x${result.canvasH} ` +
    `ink=${result.inkW}x${result.inkH} syneCheck=${result.syneCheck}`,
)
writeFileSync(`${OUT}/probe-canvas.png`, Buffer.from(result.dataUrl.split(',')[1], 'base64'))
await browser.close()
