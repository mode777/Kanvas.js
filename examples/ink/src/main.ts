import compiledStory from './../ink/test2.ink';
import { KvsInit, Mouse, onRender, onResize, Time } from './framework'
import { Node } from './scene-graph'
import { InkStory, Panel, TextElement } from './ink-app'

const canvas = window['kanvas'] ?? <HTMLCanvasElement>document.getElementById('canvas')

KvsInit(canvas);

class Game extends Node {
  
  text: TextElement;
  paragraphs: string[] = []

  init(){
    const ink = this.getNode<InkStory>('ink')
    ink.connect('story', this, this.onStory);

    this.text = this.getNode<TextElement>('text')
  
    ink.run().catch(e => console.log(e.stack))
    this.run().catch(e => console.log(e.stack))
  }
  onStory(str){
    this.paragraphs.push(str)
  }

  async run(){
      while(true){
        await Time.waitFor(() => this.paragraphs.length > 0)
        this.text.text = this.paragraphs.shift();
        await Mouse.waitClick();
      }
  }
}

const root = new Game('root');
const ink = new InkStory('ink', root, { json: compiledStory });
const bg = new Panel('bg', root, { 
  color: '#fff', 
  w: '100%', 
//  h: '100%', 
  img: 'assets/png/bg_station.png'
});
const overlay = new Panel('overlay', root, { 
  color: 'rgba(255,255,255,0.5)', 
  w: '100%', 
  h: '100%'
});
const text = new TextElement('text', root, {
  x: '10%',
  y: '10%',
  w: '80%',
  fontSize: '5%',
  shadowBlur: '1%',
  shadowColor: '#000',
  fontFace: 'serif',
  fontStyle: 'italic',
  align: 'center',
  color: '#fff'
});
const actor = new Panel('actor', root, { 
  color: 'transparent', 
  y: '35%',
  //x: '%',
  //w: '100%', 
  h: '66%',
  img: 'assets/png/women_04.png'
});
// const actor2 = new Panel('actor2', root, { 
//   color: '#00000088', 
//   y: '40%',
//   x: '10%',
//   //w: '100%', 
//   h: '66%',
//   img: 'assets/png/man_01.png'
// });

// root.iterate(x => x['init']?.call(x));
// onRender(ctx => root.iterate(x => x['draw']?.call(x, ctx)));
// onResize(ctx => root.iterate(x => x['resize']?.call(x, ctx)));

// const path = new Path2D('m 36.445051,97.052432 22.021933,-5.775437 -0.83398,-5.971487 -14.76062,0.09039 -3.106694,-27.611377 75.18201,-0.62134 -5.91166,28.096485 -42.552776,0.364157 -2.089335,8.320608 z');
// onRender(ctx => {
//   ctx.scale(8,8)
//   ctx.translate(20,-30)
//   ctx.fillStyle = 'rgba(0,0,0,0.5)'
//   ctx.fill(path);
//   ctx.fillStyle = '#fff'
//   ctx.translate(-2,-1)
//   ctx.fill(path);
//   ctx.strokeStyle = '#000'
//   ctx.stroke(path);
//   ctx.resetTransform();
// })

interface CharacterState {

}

interface Scene {
  background?: string,
  characterLeft?: string,
  characterRight?: string,
}

const lookup = {}

async function loadImage(file: string){
  return await createImageBitmap(await (await fetch(file)).blob());
}

function getImage(file: string) {
  const el = lookup[file]
  if(!el){
    const p = loadImage(file)
      .then(i => lookup[file] = i)
      .catch(e => console.log(e.err));
    lookup[file] = p
    return null;
  } else if(el instanceof Promise){
    return null;
  } else {
    return el
  }
}

function drawCharacter(ctx: CanvasRenderingContext2D, name,position){
  const image = getImage(`assets/png/${name}.png`);
  if(!image) return;
  const s = (ctx.canvas.height * 0.7) / image.height
  //const scale = 1 + (Math.sin(Time.elapsed/1000)*0.1)
  const offsetY = (Math.sin(Time.elapsed/2222)*(ctx.canvas.height*0.01))
  const offsetX = (Math.sin(Time.elapsed/2888)*(ctx.canvas.width*0.01))
  //ctx.translate(-image.width/2,-image.height/2)
  ctx.translate(offsetX,offsetY)
  //ctx.translate()
  ctx.drawImage(image, -ctx.canvas.width * 0.15, ctx.canvas.height * 0.35, image.width * s, image.height * s);
  //ctx.drawImage(image, -ctx.canvas.width * 0.1, ctx.canvas.height * 0.35, image.width * s, image.height * s);
  ctx.resetTransform()
}

function drawBackground(ctx: CanvasRenderingContext2D, name){
  const image = getImage(`assets/png/${name}.png`);
  if(!image) return;
  const sx = ctx.canvas.width / image.width
  const sy = ctx.canvas.height / image.height
  let w,h
  if(sx > sy){
    w = ctx.canvas.width
    h = image.height * sx
  } else {
    h = ctx.canvas.height
    w = image.width * sy
  }
  ctx.drawImage(image, -(w - ctx.canvas.width)/2 - (w*0.01),-(h-ctx.canvas.height)/2 -(h*0.01), w*1.02, h*1.02) 

  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
}

function drawScene(ctx, state: Scene){
  if(state.background) drawBackground(ctx, state.background);
  if(state.characterLeft) drawCharacter(ctx, state.characterLeft, 'left')
  if(state.characterRight) drawCharacter(ctx, state.characterRight, 'right')

}

const state = {
  background: 'bg_garage',
  characterLeft: 'women_03'
}

onRender(ctx => {
  drawScene(ctx,state);
})