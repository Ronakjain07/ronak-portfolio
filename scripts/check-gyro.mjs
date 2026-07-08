// Verifies tilt parallax: a touch device processes deviceorientation
// events (gyro active), a desktop pointer device never attaches.
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] || 'http://localhost:4173/'

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: 'new',
})
const errors = []

// touch device → listener attaches automatically (no permission on Android)
const mobile = await browser.newPage()
mobile.on('pageerror', (e) => errors.push('mobile: ' + e.message))
await mobile.setViewport({ width: 390, height: 844, hasTouch: true, isMobile: true })
await mobile.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6500))
await mobile.evaluate(() => {
  window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 40, gamma: 5 }))
  window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 46, gamma: 21 }))
})
const mobileActive = await mobile.evaluate(() => !!window.__gyroActive)
await mobile.close()

// desktop → gyro must stay dormant
const desktop = await browser.newPage()
desktop.on('pageerror', (e) => errors.push('desktop: ' + e.message))
await desktop.setViewport({ width: 1440, height: 900 })
await desktop.goto(URL, { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 6500))
await desktop.evaluate(() => {
  window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 40, gamma: 20 }))
})
const desktopActive = await desktop.evaluate(() => !!window.__gyroActive)
await desktop.close()

console.log(
  `mobileGyroActive=${mobileActive} desktopGyroActive=${desktopActive} ` +
    (errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no js errors'),
)
await browser.close()
