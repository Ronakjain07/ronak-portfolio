// Samples the formation mix over time to see when/if the idle egg fires.
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })

const t0 = Date.now()
const samples = []
while (Date.now() - t0 < 19000) {
  const s = await page.evaluate(() => ({
    mix: typeof window.__nameMix === 'number' ? +window.__nameMix.toFixed(2) : null,
  }))
  samples.push(`${((Date.now() - t0) / 1000).toFixed(1)}s:${s.mix}`)
  await new Promise((r) => setTimeout(r, 700))
}
console.log(samples.join(' '))
await browser.close()
