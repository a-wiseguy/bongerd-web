import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

function noise(width, height) {
  return sharp(randomBytes(width * height * 3), { raw: { width, height, channels: 3 } })
}

/** generated, not committed: a 23 MB jpeg has no place in git */
export async function makeFixtures(dir) {
  mkdirSync(dir, { recursive: true })
  const files = {
    fake: path.join(dir, 'fake.jpg'),
    huge: path.join(dir, 'huge.jpg'),
    phone: path.join(dir, 'phone.jpg'),
  }
  if (!existsSync(files.fake)) writeFileSync(files.fake, 'dit is geen afbeelding\n')
  if (!existsSync(files.huge)) await noise(4000, 3000).jpeg({ quality: 100 }).toFile(files.huge)
  if (!existsSync(files.phone)) {
    // landscape pixels + orientation 6 = portrait photo, like a phone camera; gps must not survive upload
    await noise(2000, 1500)
      .jpeg({ quality: 80 })
      .withMetadata({ orientation: 6 })
      .withExifMerge({
        IFD0: { Make: 'E2E', Model: 'Telefoon' },
        IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '51/1 56/1 0/1', GPSLongitudeRef: 'E', GPSLongitude: '5/1 37/1 0/1' },
      })
      .toFile(files.phone)
  }
  return files
}
