// Runs Lighthouse (desktop preset, matching the report) against the local
// preview and prints category scores + the key failing audits.
import { launch } from 'puppeteer-core'
import lighthouse from 'lighthouse'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'

const TARGET = process.argv[2] || 'http://localhost:4173/'

const browser = await launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu'],
})
const port = Number(new URL(browser.wsEndpoint()).port)

const runnerResult = await lighthouse(
  TARGET,
  { port, output: 'json', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] },
  desktopConfig,
)

const { categories, audits } = runnerResult.lhr
const line = (c) => `${c.title}: ${Math.round(c.score * 100)}`
console.log('\n=== SCORES ===')
console.log(line(categories.performance))
console.log(line(categories.accessibility))
console.log(line(categories['best-practices']))
console.log(line(categories.seo))

const metrics = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
]
console.log('\n=== METRICS ===')
for (const m of metrics) if (audits[m]) console.log(`${audits[m].title}: ${audits[m].displayValue}`)

console.log('\n=== FAILING AUDITS (score < 0.9) ===')
for (const cat of ['performance', 'accessibility', 'best-practices']) {
  for (const ref of categories[cat].auditRefs) {
    const a = audits[ref.id]
    if (
      a &&
      a.score !== null &&
      a.score < 0.9 &&
      a.scoreDisplayMode !== 'informative' &&
      a.scoreDisplayMode !== 'manual'
    ) {
      const ms = a.details?.overallSavingsMs ? ` (~${Math.round(a.details.overallSavingsMs)}ms)` : ''
      const kb = a.details?.overallSavingsBytes
        ? ` (~${Math.round(a.details.overallSavingsBytes / 1024)}KiB)`
        : ''
      console.log(`[${cat}] ${a.id}: ${a.title}${ms}${kb}`)
    }
  }
}

await browser.close()
