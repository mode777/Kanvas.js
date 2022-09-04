import { KSvgImage } from './KSvgImage';
//import { Canvg } from '../canvg-4.0.1/src/Canvg'



async function main(){
  
  const canvas = window["kanvas"] ?? <HTMLCanvasElement>document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const svg = await new KSvgImage().load('assets/svg/Ghostscript_Tiger.svg')

  let _t = 0;

  function loop(t){
    //console.log(t-_t);
    _t = t; 
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.translate(canvas.width/2-100,canvas.height/2-100)
    ctx.scale(1.5+Math.sin(t/1000),1.5+Math.sin(t/1000))
    svg.render(ctx)
    ctx.resetTransform()

    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop);
}

main().catch(err => {
  console.log(err.stack)
})

