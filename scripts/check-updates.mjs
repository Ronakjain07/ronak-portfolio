// Verifies the content update: merged skills, Drive resume links,
// certificate links, and the VHM project URL.
import puppeteer from 'puppeteer-core'

const OUT = process.argv[2] || '.'
const URL = process.argv[3] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
  args: ['--window-size=1440,900', '--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6500))

const checks = await page.evaluate(() => {
  const chips = [...document.querySelectorAll('.skill-chips li')].map((el) => el.textContent)
  const links = [...document.querySelectorAll('a')].map((a) => ({
    href: a.href,
    target: a.target,
    text: a.textContent.trim(),
  }))
  const certs = links.filter((l) => l.text.includes('View certificate'))
  const resumes = links.filter((l) => l.text.startsWith('Résumé'))
  return {
    newChips: ['TypeScript', 'Angular', 'FastAPI', 'MongoDB', 'Agentic RAG', 'DSA', 'Agile/Scrum', 'Claude Code'].filter(
      (c) => chips.includes(c),
    ).length,
    certCount: certs.length,
    certsOnDrive: certs.every((c) => c.href.includes('drive.google.com') && c.target === '_blank'),
    resumeCount: resumes.length,
    resumesOnDrive: resumes.every(
      (r) => r.href.includes('1P3oRGtQPjtkqoHmiFDh-_wuB9BnRPkaz') && r.target === '_blank',
    ),
    vhmOk: links.some((l) => l.href === 'https://vhm-tex-website.vercel.app/'),
    achievementCards: document.querySelectorAll('.achievement-card').length,
  }
})
console.log(JSON.stringify(checks))

await page.evaluate(() => {
  const el = document.querySelector('#skills')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 2200))
await page.screenshot({ path: `${OUT}/upd-skills.png` })

await page.evaluate(() => {
  const el = document.querySelector('.achievements')
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 5)
})
await new Promise((r) => setTimeout(r, 2200))
await page.screenshot({ path: `${OUT}/upd-achievements.png` })

console.log(errors.length ? errors.join('\n') : 'NO JS ERRORS')
await browser.close()
