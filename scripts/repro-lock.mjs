// Reproduces the reported "can't scroll / can't click" against any URL,
// with and without prefers-reduced-motion emulation.
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] || 'https://ronakjainn.netlify.app/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1280,800'],
})

async function probe(reduced) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })
  if (reduced) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  }
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 45000 })
  await new Promise((r) => setTimeout(r, 6000)) // past preloader either way

  const state = await page.evaluate(() => ({
    htmlClass: document.documentElement.className,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    preloaderVisible: (() => {
      const p = document.querySelector('.preloader')
      if (!p) return false
      const cs = getComputedStyle(p)
      return cs.display !== 'none' && cs.visibility !== 'hidden'
    })(),
  }))

  await page.evaluate(() => window.scrollTo(0, 900))
  await new Promise((r) => setTimeout(r, 800))
  const scrollY = await page.evaluate(() => window.scrollY)

  // also try wheel like a real user
  await page.mouse.move(640, 400)
  await page.mouse.wheel({ deltaY: 1200 })
  await new Promise((r) => setTimeout(r, 1200))
  const scrollYAfterWheel = await page.evaluate(() => window.scrollY)

  console.log(
    `reduced-motion=${reduced}: htmlClass="${state.htmlClass}" overflow=${state.htmlOverflow} ` +
      `preloaderVisible=${state.preloaderVisible} scrollTo→${scrollY}px wheel→${scrollYAfterWheel}px ` +
      (errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no js errors'),
  )
  await page.close()
}

await probe(false)
await probe(true)
await browser.close()
