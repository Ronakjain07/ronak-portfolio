// Responsive audit: reloads the site at a matrix of real device sizes and
// captures key sections at each. Also reports any horizontal overflow.
// Usage: node scripts/responsive.mjs <output-dir>
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = 'http://localhost:4173/'

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1280x720', width: 1280, height: 720 },
  { name: 'small-desktop-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'phone-390', width: 390, height: 844 },
  { name: 'phone-360', width: 360, height: 740 },
  { name: 'phone-landscape-844', width: 844, height: 390 },
]

const SECTIONS = [
  ['hero', null],
  ['skills', '#skills'],
  ['work', '#work'],
  ['contact', '#contact'],
]

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-color-profile=srgb'],
})

const page = await browser.newPage()
const errors = []
page.on('pageerror', (err) => errors.push('PAGE ERROR: ' + err.message))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

for (const vp of VIEWPORTS) {
  await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 })
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 })
  await sleep(5600) // preloader + name formation + hero entrance

  for (const [label, sel] of SECTIONS) {
    if (sel) {
      await page.evaluate((s) => {
        const el = document.querySelector(s)
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
      }, sel)
      await sleep(2000)
    }
    await page.screenshot({ path: `${OUT}/r-${vp.name}-${label}.png` })
  }

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  console.log(`${vp.name}: horizontal overflow = ${overflow}px`)
}

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
