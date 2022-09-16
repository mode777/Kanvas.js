import compiledStory from './../ink/test2.ink';
import { Framework, KvsInit, Mouse, onRender, onResize, Time } from './framework'
import { Node } from './scene-graph'
import { InkStory, Panel, TextElement } from './ink-app'
import { EaseFunc, EaseFuncs, tweenValue } from './easing';

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


// interface Scene {
//   background?: BackgroundState,
//   characterLeft?: string,
//   characterRight?: string,
// }

const ctx = Framework.context;

//const lookup = {}



// function getImage(file: string) {
//   const el = lookup[file]
//   if(!el){
//     const p = loadImage(file)
//       .then(i => lookup[file] = i)
//       .catch(e => console.log(e.err));
//     lookup[file] = p
//     return null;
//   } else if(el instanceof Promise){
//     return null;
//   } else {
//     return el
//   }
// }



class DrawUtils {
  private constructor(){}
  static drawFullScreenImage(ctx: CanvasRenderingContext2D, image: ImageBitmap){
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
  }
  static async loadImage(file: string){
    return await createImageBitmap(await (await fetch(file)).blob());
  }
}

class CharacterRenderer {
  image: ImageBitmap = null
  position: 'left' | 'right' = 'left'
  flipped = false

  draw(ctx: CanvasRenderingContext2D){
    if(!this.image) return;
    const s = (ctx.canvas.height * 0.7) / this.image.height
    const scale = 1 + (Math.sin(Time.elapsed/800)*0.01)
    const offsetY = (Math.sin(Time.elapsed/800)*(ctx.canvas.height*0.004))
    const offsetX = (Math.sin(Time.elapsed/2888)*(ctx.canvas.width*0.003))
    //ctx.translate(-image.width/2,-image.height/2)
    //ctx.translate(offsetX,offsetY)
    //ctx.translate()
    const x = ctx.canvas.width * (this.position == 'left' ?  0.20 : 0.80)
    ctx.translate(offsetX + x,offsetY + ctx.canvas.height * 0.7)
    ctx.scale(s*scale * (this.flipped ? -1 : 1),s*scale)
    ctx.rotate(Math.sin(Time.elapsed / 800)*0.01)
    ctx.translate(-this.image.width/2,-this.image.height/2)
    ctx.drawImage(this.image, 0,0);
    //ctx.drawImage(image, -ctx.canvas.width * 0.1, ctx.canvas.height * 0.35, image.width * s, image.height * s);
    ctx.resetTransform()
  }
}

class BackgroundRenderer {
  fade = 0
  imageA: ImageBitmap = null;
  imageB: ImageBitmap = null;

  draw(ctx: CanvasRenderingContext2D){
    ctx.globalAlpha = 1 - this.fade;
    if(this.imageA) DrawUtils.drawFullScreenImage(ctx,this.imageA);
    ctx.globalAlpha = this.fade;
    if(this.imageB) DrawUtils.drawFullScreenImage(ctx,this.imageB);
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
  }
}

class Background {
  private name: string
  renderer = new BackgroundRenderer()

  async change(name: string, time = 1000){
    this.name = name;
    const bg = this.renderer;
    const img = await DrawUtils.loadImage(`assets/png/${name}.png`)
    bg.imageB = img
    await tweenValue(0, 1, time, EaseFuncs.easeInQuad, v => bg.fade = v)
    bg.imageA = img 
    bg.imageB = null 
    bg.fade = 0
  }
}

class Character {
  private name: string
  renderer = new CharacterRenderer()

  async change(name: string){
    var c = this.renderer
    c.image = await DrawUtils.loadImage(`assets/png/${name}.png`)
  }
}

class Scene {
  
  background = new Background();
  charLeft = new Character();
  charRight = new Character();
  
  draw(ctx: CanvasRenderingContext2D){
    this.background.renderer.draw(ctx)
    this.charLeft.renderer.draw(ctx)
    this.charRight.renderer.draw(ctx)
  }

  async run(){
    await this.background.change('bg_alley', 3000)
    await this.background.change('bg_alley_02')
    await this.charLeft.change('man_02')
  }
}

const scene = new Scene()

onRender(ctx => {
  scene.draw(ctx);
});

scene.run().catch(err => console.log(err.stack));