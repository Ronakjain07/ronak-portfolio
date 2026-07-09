// Runs the text sampler in isolation (blank page = no Syne available)
// and dumps intermediates, to explain the flattened mobile formation.
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})

async function probe(label, configure, url) {
  const page = await browser.newPage()
  await configure(page)
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 4000))
  const result = await page.evaluate(sampler)
  console.log(label, JSON.stringify(result))
  await page.close()
}

const sampler = async () => {
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
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, inkCount = 0
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      if (data[(y * canvas.width + x) * 4 + 3] > 128) {
        inkCount++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  return {
    fontResolved: ctx.font,
    syneLoaded: document.fonts.check('800 140px Syne'),
    measured: Math.round(measured),
    canvasW: canvas.width,
    canvasH: canvas.height,
    inkW: maxX - minX,
    inkH: maxY - minY,
    inkCount,
  }
}

await probe('desktop-site:', async (p) => p.setViewport({ width: 1440, height: 900 }), 'http://localhost:4173/')
await probe(
  'mobile-site:',
  async (p) =>
    p.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }),
  'http://localhost:4173/',
)
await browser.close()
