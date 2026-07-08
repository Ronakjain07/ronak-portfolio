import { readFileSync } from 'node:fs'

const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8')
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
if (!match) throw new Error('JSON-LD block not found in dist/index.html')
const data = JSON.parse(match[1])
console.log(
  'JSON-LD valid ·',
  data['@type'],
  '· person:',
  data.mainEntity.name,
  '·',
  data.mainEntity.jobTitle,
  '@',
  data.mainEntity.worksFor.name,
  '·',
  data.mainEntity.knowsAbout.length,
  'knowsAbout topics',
)
