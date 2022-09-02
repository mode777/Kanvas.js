import { DOMParser } from 'xmldom'

async function main(){
  const res = await fetch('assets/svg/Ghostscript_Tiger.svg');
  const text = await res.text();
  const parser = new DOMParser();
  const dom = parser.parseFromString(text);

  //console.log(dom)

  const canvas = window["kanvas"] ?? <HTMLCanvasElement>document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  requestAnimationFrame(t => {
    
  })
}

main();


// import {
//   Canvg,
//   presets
// } from './../canvg.umd'

// console.log(DOMParser)
// console.log(Canvg)
// console.log(presets)

// const preset = presets.node({
//   DOMParser,
//   kanvas,
//   null
// });

// (async (output, input) => {
//   const svg = await fs.readFile(input, 'utf8')
//   const canvas = preset.createCanvas(800, 600)
//   const ctx = canvas.getContext('2d')
//   const v = Canvg.fromString(ctx, svg, preset)

//   // Render only first frame, ignoring animations.
//   await v.render()

//   const png = canvas.toBuffer()

//   await fs.writeFile(output, png)
// })(
//   './example.png',
//   './example.svg'
// )
