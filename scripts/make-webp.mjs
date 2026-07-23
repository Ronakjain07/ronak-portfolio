// Re-encodes the portrait to a right-sized WebP using Chrome's canvas
// encoder (no extra deps). The About card renders it at ~350px CSS, so
// 720px covers retina; the original 900px JPEG stays as the <picture>
// fallback and for social/schema (og.png).
import puppeteer from 'puppeteer-core'
import { readFileSync, writeFileSync } from 'node:fs'

const src = readFileSync(new URL('../public/ronak-jain.jpg', import.meta.url))
const dataUrl = 'data:image/jpeg;base64,' + src.toString('base64')

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
const out = await page.evaluate(async (jpg) => {
  const img = new Image()
  img.src = jpg
  await img.decode()
  const targetW = 720
  const scale = targetW / img.naturalWidth
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return { url: canvas.toDataURL('image/webp', 0.82), w: canvas.width, h: canvas.height }
}, dataUrl)
await browser.close()

const buf = Buffer.from(out.url.split(',')[1], 'base64')
writeFileSync(new URL('../public/ronak-jain.webp', import.meta.url), buf)
console.log(`ronak-jain.webp: ${Math.round(buf.length / 1024)} KB (${out.w}x${out.h}) — was ${Math.round(src.length / 1024)} KB JPEG`)
