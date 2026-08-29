import { PNG } from "pngjs"
import fs from "node:fs"

// Convert a flat chroma-key green background into real alpha transparency.
// greenness = g - max(r, b). Pure chroma green ~255; sage/olive art greens are low.
const HARD = 120 // >= this greenness -> fully transparent
const SOFT = 55 // <= this greenness -> fully opaque; between -> feathered

const jobs = [
  ["public/game/assets/characters/character_raw.png", "public/game/assets/characters/character.png"],
  ["public/game/assets/backgrounds/wisteria_raw.png", "public/game/assets/backgrounds/wisteria.png"],
  ["public/game/assets/flowers/rose_raw.png", "public/game/assets/flowers/rose.png"],
  ["public/game/assets/flowers/sunflower_raw.png", "public/game/assets/flowers/sunflower.png"],
  ["public/game/assets/flowers/lavender_raw.png", "public/game/assets/flowers/lavender.png"],
]

function process(src, dst) {
  const png = PNG.sync.read(fs.readFileSync(src))
  const { data, width, height } = png
  let cleared = 0
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const greenness = g - Math.max(r, b)

    let alpha
    if (greenness >= HARD) alpha = 0
    else if (greenness <= SOFT) alpha = 255
    else alpha = Math.round(255 * (1 - (greenness - SOFT) / (HARD - SOFT)))

    data[i + 3] = alpha
    if (alpha === 0) cleared++

    // Suppress green spill on kept/edge pixels: clamp green toward max(r,b).
    if (alpha > 0 && greenness > 0) {
      data[i + 1] = Math.max(r, b) + Math.min(greenness, 8)
    }
  }
  fs.writeFileSync(dst, PNG.sync.write(png))
  const pct = ((cleared / (width * height)) * 100).toFixed(1)
  console.log(`${dst}  ${width}x${height}  transparent=${pct}%`)
}

for (const [src, dst] of jobs) process(src, dst)
console.log("done")
