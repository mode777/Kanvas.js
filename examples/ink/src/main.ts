import compiledStory from './../ink/test2.ink';
import { Framework, KvsInit, Mouse, onRender, onResize, Time, Screen } from './framework'
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


class TimeUtils {
  static async wait(time: number){
    return new Promise<void>((res,rej) => {
      let start = -1
      const fn = t => {
        if(start === -1) start = t
        if((t-start) >= time){
          res()   
        } else {
          requestAnimationFrame(fn)
        }
      }
      requestAnimationFrame(fn)
    });
  }
}

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

class Background {

  fade = 0
  imageA: ImageBitmap = null;
  imageB: ImageBitmap = null;
  overlayColor = '#fff'
  overlayAlpha = 0

  draw(ctx: CanvasRenderingContext2D){
    ctx.globalAlpha = 1 - this.fade;
    if(this.imageA) DrawUtils.drawFullScreenImage(ctx,this.imageA);
    ctx.globalAlpha = this.fade;
    if(this.imageB) DrawUtils.drawFullScreenImage(ctx,this.imageB);
    if(this.overlayAlpha > 0){
      ctx.globalAlpha = this.overlayAlpha;
      ctx.fillStyle = this.overlayColor
      ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
      ctx.globalAlpha = 1
    }
  }

  async changeBg(name: string, time = 0){
    const img = await DrawUtils.loadImage(`assets/png/${name}.png`)
    this.imageB = img
    await tweenValue(0, 1, time, EaseFuncs.easeInQuad, v => this.fade = v)
    this.imageA = img 
    this.imageB = null 
    this.fade = 0
  }

  async showOverlay(color: string = '#fff', alpha = 0.2, time = 0){
    this.overlayColor = color
    await tweenValue(this.overlayAlpha, alpha, time, EaseFuncs.easeOutCubic, v => this.overlayAlpha = v);        
  }

  async hideOverlay(time = 0){
    await tweenValue(this.overlayAlpha, 0, time, EaseFuncs.easeInCubic, v => this.overlayAlpha = v);        
  }
}

class Character {

  image: ImageBitmap = null
  x: number = 0
  flipped = false
  alpha = 1

  draw(ctx: CanvasRenderingContext2D){
    if(!this.image) return;
    const s = (ctx.canvas.height * 0.6) / this.image.height
    //const scale = 1 + (Math.sin(Time.elapsed/800)*0.01)
    //const offsetY = (Math.sin(Time.elapsed/800)*(ctx.canvas.height*0.004))
    //const offsetX = (Math.sin(Time.elapsed/2888)*(ctx.canvas.width*0.003))
    //ctx.translate(-image.width/2,-image.height/2)
    //ctx.translate(offsetX,offsetY)
    //ctx.translate()
    const x = ctx.canvas.width * this.x
    ctx.translate(x,ctx.canvas.height * 0.7)
    ctx.scale(s*(this.flipped ? -1 : 1),s)
    //ctx.rotate(Math.sin(Time.elapsed / 800)*0.01)
    ctx.translate(-this.image.width/2,-this.image.height/2)
    ctx.globalAlpha = this.alpha
    ctx.drawImage(this.image, 0,0);
    //ctx.drawImage(image, -ctx.canvas.width * 0.1, ctx.canvas.height * 0.35, image.width * s, image.height * s);
    ctx.resetTransform()
  }

  async change(name: string, align = 'left', flipped = false, time = 0){
    this.x = align === 'left' ? -0.25 : 1.25
    this.alpha = 0
    this.image = await DrawUtils.loadImage(`assets/png/${name}.png`)
    this.flipped = flipped
    tweenValue(0, 1, time, EaseFuncs.easeInCubic, x => this.alpha = x)
    await tweenValue(this.x, align === 'left' ? 0.2 : 0.8, time, EaseFuncs.easeOutCubic, x => this.x = x)
  }
}

class Title {
  title = ''
  subtitle = ''
  titleAlpha = 1
  subtitleAlpha = 1
  titleStyle = 'bold'
  titleFont = 'serif'
  titleHeight = 0.15
  titleColor = '#ffffffff'
  subtitleColor = '#fff'
  shadowColor = '#000'
  subtitleHeight = 0.07
  subtitleFont = 'serif'
  subtitleStyle = ''
  underlineWidth = 0.8
  underlineColor = '#a00'
  y = 0.5

  draw(ctx: CanvasRenderingContext2D){
    ctx.textAlign = 'center'
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    if(this.title && this.title !== '' && this.titleAlpha > 0){
      ctx.globalAlpha = this.titleAlpha
      ctx.font = `${this.titleStyle} ${this.titleHeight * h}px ${this.titleFont}`
      ctx.shadowBlur = this.titleHeight * h * 0.08
      ctx.shadowColor = this.shadowColor
      ctx.fillStyle = this.titleColor
      ctx.fillText(this.title, w/2, h * this.y)
      ctx.shadowBlur = 0
      ctx.fillStyle = this.underlineColor
      ctx.fillRect(w*((1 - this.underlineWidth) / 2), (this.y+0.03)*h, this.underlineWidth*w, h*0.01)
    }
    if(this.subtitle && this.subtitle !== '' && this.subtitleAlpha > 0){
      ctx.globalAlpha = this.subtitleAlpha
      ctx.font = `${this.subtitleStyle} ${this.subtitleHeight * h}px ${this.subtitleFont}`
      ctx.shadowBlur = this.subtitleHeight * h * 0.08
      ctx.shadowColor = this.shadowColor
      ctx.fillStyle = this.subtitleColor
      ctx.fillText(this.subtitle, w/2, h * (this.y+0.13))
      ctx.shadowBlur = 0
    }
    ctx.globalAlpha = 1
  }

  async show(title: string, subtitle = null, time = 0){
    this.y = 0.5
    this.titleAlpha = 0
    this.subtitleAlpha = 0
    this.subtitle = subtitle
    this.title = title
    this.underlineWidth = 0
    tweenValue(0,1,time*0.4, EaseFuncs.easeInCubic, x => this.titleAlpha = x)
    await tweenValue(0, 0.8, time*0.5, EaseFuncs.linear, v => this.underlineWidth = v);
    if(this.subtitle != null){
      await tweenValue(this.y, this.y-0.1, time*0.2, EaseFuncs.easeOutCubic, v => this.y = v);
      await tweenValue(0,1,time*0.3,EaseFuncs.easeInCubic, v => this.subtitleAlpha = v);
    }
  }

  async hide(time = 0){
    tweenValue(this.titleAlpha, 0, time, EaseFuncs.easeOutCubic, x => this.titleAlpha = x);
    await tweenValue(this.subtitleAlpha, 0, time, EaseFuncs.easeOutCubic, x => this.subtitleAlpha = x);
    this.title = null;
  }
}

class Scene {
  
  background = new Background();
  charLeft = new Character();
  charRight = new Character();
  title = new Title();
  
  draw(ctx: CanvasRenderingContext2D){
    this.background.draw(ctx)
    this.title.draw(ctx)
    this.charLeft.draw(ctx)
    this.charRight.draw(ctx)
  }

  async run(){
    await this.background.showOverlay('#000', 1)
    await this.background.changeBg('bg_appartment_02')
    await this.title.show("Der Bildband", 'Alexander Klingenbeck', 2000)
    await this.background.hideOverlay(2000)
    await TimeUtils.wait(2000)
    await this.title.hide(2000)
    await this.background.showOverlay('#fff', 0.2, 2000)

    //await this.background.hideOverlay(1000)
    //await this.background.changeBg('bg_alley_02', 1000)
    //await this.background.showOverlay('#fff', 0.2, 1000)
    this.charRight.change('man_02', 'right', true, 1000)
    await this.charLeft.change('women_02', 'left', true, 1000)
  }
}

const scene = new Scene()

onRender(ctx => {
  scene.draw(ctx);
});

scene.run().catch(err => console.log(err.stack));