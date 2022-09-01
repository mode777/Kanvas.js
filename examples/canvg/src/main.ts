import { DOMParser } from 'xmldom'
import {
  Canvg,
  presets
} from './../canvg.umd'

console.log(DOMParser)
console.log(Canvg)
console.log(presets)

const preset = presets.node({
  DOMParser,
  kanvas,
  null
});

(async (output, input) => {
  const svg = await fs.readFile(input, 'utf8')
  const canvas = preset.createCanvas(800, 600)
  const ctx = canvas.getContext('2d')
  const v = Canvg.fromString(ctx, svg, preset)

  // Render only first frame, ignoring animations.
  await v.render()

  const png = canvas.toBuffer()

  await fs.writeFile(output, png)
})(
  './example.png',
  './example.svg'
)
