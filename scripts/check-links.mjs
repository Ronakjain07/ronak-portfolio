import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const page = await browser.newPage()
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 3500))
const links = await page.evaluate(() =>
  [...document.querySelectorAll('.contact-links a')].map((a) => a.textContent.trim() + ' -> ' + a.href),
)
const photo = await page.evaluate(() => {
  const img = document.querySelector('.about-photo')
  return img ? `${img.src} (${img.naturalWidth}x${img.naturalHeight}, loaded: ${img.complete})` : 'MISSING'
})
const vhm = await page.evaluate(
  () => [...document.querySelectorAll('a')].some((a) => a.href.includes('vhmtex.com')),
)
console.log('contact links:\n  ' + links.join('\n  '))
console.log('about photo:', photo)
console.log('vhmtex link present:', vhm)
await browser.close()
