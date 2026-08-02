import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new', args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await new Promise(r => setTimeout(r, 7000))

const sectionH = await page.evaluate(() => {
  const el = document.querySelector('#experience')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 60)
  return Math.round(el.getBoundingClientRect().height)
})
await new Promise(r => setTimeout(r, 1500))
console.log('experience section height:', sectionH, 'px  (viewport 844)')

// scroll through and watch cards pin
for (const step of [0, 260, 520, 780, 1040]) {
  await page.evaluate(y => window.scrollBy(0, y), step === 0 ? 0 : 260)
  await new Promise(r => setTimeout(r, 900))
  const s = await page.evaluate(() => {
    const items = [...document.querySelectorAll('.timeline-item')]
    return items.map(el => {
      const r = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      return { co: el.querySelector('.timeline-company')?.textContent.slice(0,10),
               top: Math.round(r.top), pos: cs.position, vis: cs.visibility,
               opaque: cs.backgroundColor }
    })
  })
  console.log(`after +${step}: ` + s.map(x => `${x.co}@${x.top}`).join('  '))
}
const meta = await page.evaluate(() => {
  const el = document.querySelector('.timeline-item')
  const cs = getComputedStyle(el)
  return { position: cs.position, top: cs.top, bg: cs.backgroundColor, visibility: cs.visibility }
})
console.log('first item computed:', JSON.stringify(meta))
await page.screenshot({ path: 'E:/portfolio-new/.mob-shots/exp-stack.png' })
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'NO JS ERRORS')
await browser.close()
