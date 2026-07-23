// Self-hosts the Google Fonts: fetches the css2 stylesheet with a modern
// Chrome UA (so we get variable-font woff2), downloads every woff2 into
// public/fonts/, and rewrites the CSS to local paths. Family names stay
// exactly as Google defines them ('Syne', 'Manrope', 'Instrument Serif'),
// so no app code changes. Output: public/fonts.css + public/fonts/*.woff2
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Manrope:wght@200..800&family=Instrument+Serif:ital@0;1&display=swap'
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const fontsDir = path.join(root, 'public', 'fonts')
mkdirSync(fontsDir, { recursive: true })

let css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text()

const urls = [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1])
const unique = [...new Set(urls)]
console.log(`downloading ${unique.length} woff2 files…`)

let n = 0
for (const url of unique) {
  const name = `f${n++}-${url.split('/').slice(-2).join('-')}`
  const buf = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer())
  writeFileSync(path.join(fontsDir, name), buf)
  css = css.split(url).join(`/fonts/${name}`)
}

writeFileSync(path.join(root, 'public', 'fonts.css'), css)
console.log('wrote public/fonts.css and', unique.length, 'fonts')
// report the latin Syne/Manrope files to preload
for (const line of css.split('}')) {
  if (/font-family: 'Syne'|font-family: 'Manrope'/.test(line) && /U\+0000-00FF/.test(line)) {
    const f = line.match(/\/fonts\/(f\d+-[^)]+)/)
    if (f) console.log('preload candidate:', f[1])
  }
}
