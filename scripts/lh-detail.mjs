import { launch } from 'puppeteer-core'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const browser = await launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
})
const port = Number(new URL(browser.wsEndpoint()).port)
const { lhr } = await lighthouse(
  'http://localhost:4173/',
  { port, output: 'json', onlyCategories: ['best-practices'] },
  desktopConfig,
)
for (const id of ['third-party-cookies', 'inspector-issues']) {
  const a = lhr.audits[id]
  console.log(`\n=== ${id} (score ${a.score}) ===`)
  console.log(a.displayValue || '')
  const items = a.details?.items || []
  for (const it of items.slice(0, 12)) console.log(JSON.stringify(it))
}
await browser.close()
