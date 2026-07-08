// Verifies both analytics boot: Clarity's tag loads from clarity.ms and
// GA4's gtag.js loads from googletagmanager.com, with their globals set.
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
let clarityTag = false
let gaTag = false
page.on('request', (req) => {
  const url = req.url()
  if (url.includes('clarity.ms/tag/t0sl3d501t')) clarityTag = true
  if (url.includes('googletagmanager.com/gtag/js?id=G-5ET3N73HGX')) gaTag = true
})
const errors = []
page.on('pageerror', (e) => errors.push(e.message))

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise((r) => setTimeout(r, 3000))
const globals = await page.evaluate(() => ({
  clarity: typeof window.clarity === 'function',
  gtag: typeof window.gtag === 'function',
  dataLayer: Array.isArray(window.dataLayer) && window.dataLayer.length > 0,
}))

console.log(
  `clarityTag=${clarityTag} gaTag=${gaTag} windowClarity=${globals.clarity} ` +
    `windowGtag=${globals.gtag} dataLayer=${globals.dataLayer} ` +
    (errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no js errors'),
)
await browser.close()
