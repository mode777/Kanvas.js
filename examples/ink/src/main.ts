import compiledStory from './../ink/test2.ink';
import { Framework, KvsInit, Mouse, onRender, onResize, Time, Screen } from './framework'
import { Node } from './scene-graph'
import { InkStory, Panel, TextElement } from './ink-app'
import { EaseFunc, EaseFuncs, tweenValue } from './easing';

import * as ink from 'inkjs/dist/ink'

const canvas = window['kanvas'] ?? <HTMLCanvasElement>document.getElementById('canvas')

KvsInit(canvas);

// class Game extends Node {
  
//   text: TextElement;
//   paragraphs: string[] = []

//   init(){
//     const ink = this.getNode<InkStory>('ink')
//     ink.connect('story', this, this.onStory);

//     this.text = this.getNode<TextElement>('text')
  
//     ink.run().catch(e => console.log(e.stack))
//     this.run().catch(e => console.log(e.stack))
//   }
//   onStory(str){
//     this.paragraphs.push(str)
//   }

//   async run(){
//       while(true){
//         await Time.waitFor(() => this.paragraphs.length > 0)
//         this.text.text = this.paragraphs.shift();
//         await Mouse.waitClick();
//       }
//   }
// }

// const root = new Game('root');
// const ink = new InkStory('ink', root, { json: compiledStory });
// const bg = new Panel('bg', root, { 
//   color: '#fff', 
//   w: '100%', 
// //  h: '100%', 
//   img: 'assets/png/bg_station.png'
// });
// const overlay = new Panel('overlay', root, { 
//   color: 'rgba(255,255,255,0.5)', 
//   w: '100%', 
//   h: '100%'
// });
// const text = new TextElement('text', root, {
//   x: '10%',
//   y: '10%',
//   w: '80%',
//   fontSize: '5%',
//   shadowBlur: '1%',
//   shadowColor: '#000',
//   fontFace: 'serif',
//   fontStyle: 'italic',
//   align: 'center',
//   color: '#fff'
// });
// const actor = new Panel('actor', root, { 
//   color: 'transparent', 
//   y: '35%',
//   //x: '%',
//   //w: '100%', 
//   h: '66%',
//   img: 'assets/png/women_04.png'
// });
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

class InputUtils {
  static waitForEvent<T extends Event>(name: string, target: EventTarget = window, predicate?: (ev: T) => boolean) {
    return new Promise<T>((res, rej) => {
        const handler = (ev) => {
            if (!predicate || predicate(ev)) {
                res(ev);
                removeEventListener(name, handler)
            }
        }
        addEventListener(name, handler);
    })
  }
  static async waitKey(keys?: string[]) {
    var ev = await InputUtils.waitForEvent<KeyboardEvent>('keydown', window, ev => !keys || keys.findIndex(x => x === ev.key) != -1)
    return ev.key;
  }
  static waitClick(canvas: HTMLCanvasElement){
    return InputUtils.waitForEvent('click', canvas)
  }

}


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

interface Drawable {
  draw(ctx: CanvasRenderingContext2D)
}

class Background implements Drawable {

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

  async fadeIn(name: string, time = 0){
    if(!name) return;
    this.imageA = await DrawUtils.loadImage(`assets/png/${name}.png`)
    this.fade = 0
    await tweenValue(this.overlayAlpha, 0, time, EaseFuncs.easeInQuad, v => this.overlayAlpha = v)
  }

  async showOverlay(color: string = '#fff', alpha = 0.2, time = 0){
    this.overlayColor = color
    await tweenValue(this.overlayAlpha, alpha, time, EaseFuncs.easeOutCubic, v => this.overlayAlpha = v);        
  }

  async hideOverlay(time = 0){
    await tweenValue(this.overlayAlpha, 0, time, EaseFuncs.easeInCubic, v => this.overlayAlpha = v);        
  }
}

class Character implements Drawable {

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

class Title implements Drawable {
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
    ctx.textAlign = 'start'
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

interface Line {
  text: string,
  width: number
}

class Paragraph implements Drawable {
  private _text = '';
  public get text() {
    return this._text;
  }
  public set text(value) {
    this._text = value;
    this.dirty = true
  }
  private _font = 'serif';
  public get font() {
    return this._font;
  }
  public set font(value) {
    this._font = value;
    this.dirty = true
  }
  private _lineHeight = 0.05;
  public get lineHeight() {
    return this._lineHeight;
  }
  public set lineHeight(value) {
    this._lineHeight = value;
    this.dirty = true
  }
  private _width = 1;
  public get width() {
    return this._width;
  }
  public set width(value) {
    this._width = value;
    this.dirty = true
  }
  color = '#000'
  private dirty = true
  x = 0
  y = 0
  private canvasWidth = -1
  private canvasHeight = -1
  private lines: Line[]
  align: 'left'|'center'|'right' = 'left'

  getHeight(ctx: CanvasRenderingContext2D){
    this.update(ctx);
    return this.lineHeight * this.canvasHeight * this.lines.length
  }

  private update(ctx: CanvasRenderingContext2D){
    ctx.font = `${this.lineHeight * ctx.canvas.height}px ${this.font}`
    ctx.fillStyle = this.color
    ctx.textBaseline = 'top'
    if(this.dirty || this.canvasWidth !== ctx.canvas.width || this.canvasHeight !== ctx.canvas.height){
      this.canvasWidth = ctx.canvas.width
      this.canvasHeight = ctx.canvas.height
      this.lines = this.getLines(ctx, this.text, this.width * this.canvasWidth)
      this.dirty = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D){
    if(this.text && this.text !== ''){
      this.update(ctx);
      let y = this.y * this.canvasHeight;
      for (const line of this.lines) {
        const offset = this.align === 'left' 
            ? 0 : (this.align === 'center' ? ((this.width * this.canvasWidth) - line.width)/2 : (this.width * this.canvasWidth) - line.width) 
        ctx.fillText(line.text, (this.x*this.canvasWidth)+offset,y);
        y += (this.lineHeight * this.canvasHeight);
      }
    }
  }

  // see: https://stackoverflow.com/a/16599668/4361832
  private getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const words = text.split(" ");
    const lines: Line[] = [];
    let currentLine = words[0];

    let lastw = 0;
    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push({ text:currentLine, width:lastw });
            currentLine = word;
            //lastw = width;
        }
        lastw = width;
        if(i === words.length -1) lastw = ctx.measureText(currentLine).width;
    }
    lines.push({ text:currentLine, width:lastw });
    return lines;
  }
}

type Tags = {[key:string]:any}

class Story {
  story: any;
  globalTags: Tags

  constructor(inkData: any){
    this.story = new ink.Story(inkData)
    
    this.globalTags = this.decodeTags(this.story.globalTags)
  }

  getTags(){
    return this.decodeTags(this.story.currentTags)
  }

  private decodeTags(raw: string[]): Tags{
    const tags: Tags = {}
    for (const t of raw) {
      const spl = t.split(':')
      if(spl.length > 1){
        tags[spl[0].trim()] = spl[1].trim()
      } else {
        tags[spl[0].trim()] = true
      }
    }
    return tags
  }
}

class Voiceover implements Drawable {
  private paragraph: Paragraph
  alpha = 1

  constructor(){
    const el = new Paragraph()
    el.font = 'PatrickHand'
    el.width = 0.33
    el.x = 0.02
    el.y = 0.02
    el.lineHeight = 0.035
    this.paragraph = el
  }
  draw(ctx: CanvasRenderingContext2D) {
    if(!this.text || this.text == '') return
    ctx.globalAlpha = this.alpha
    const h = this.paragraph.getHeight(ctx) + (ctx.canvas.height * 0.02);
    const w = (this.paragraph.width + 0.02) * ctx.canvas.width
    const x = 0.01*ctx.canvas.width
    const y = 0.01*ctx.canvas.height
    ctx.fillStyle = 'rgba(255, 246, 79, 0.8)' 
    ctx.fillRect(x,y,w,h)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 0.003 * ctx.canvas.height
    ctx.strokeRect(x,y,w,h)
    this.paragraph.draw(ctx)
    ctx.globalAlpha = 1
  }

  public get text() {
    return this.paragraph.text
  }
  public set text(value) {
    this.paragraph.text = value
  }

  public async change(text: string, time = 0){
    if(this.text && this.text !== '' && this.alpha !== 0){
      await this.hide(time*0.5)
      time *= 0.5
    }
    this.alpha = 0
    this.text = text
    await tweenValue(this.alpha, 1, time, EaseFuncs.easeOutQuad, v => this.alpha = v)
  }

  public async hide(time = 0){
    await tweenValue(this.alpha, 0, time, EaseFuncs.easeOutQuad, v => this.alpha = v)
  }
}

abstract class Command {
  
  constructor(protected directive: Directive){
  }

  executeOperations() {
    const defaults = this.getDefaults()
    const params = this.loadParameters()
    const combined = { ...defaults, ...params }
    if(this.directive.operations.length === 0){
      return this.executeOperation('default', combined)
    }
    return Promise.all(this.directive.operations.map(x => this.executeOperation(x, combined)))
  }

  protected tryConvertParameter(param: string, fn: (any) => any){
    if(this.directive.parameters[param]) this.directive.parameters[param] = fn(this.directive.parameters[param])
  }

  protected abstract loadParameters() : any 
  protected abstract getDefaults() : any
  protected abstract executeOperation(name: string, parameters: any) : Promise<void>;
}

class TitleCommand extends Command {
  private defaults: any
  constructor(directive: Directive, private renderer: Title, title: string, subtitle: string){
    super(directive)
    this.defaults = { title, subtitle, time: 1000 }
  }
  protected loadParameters() {
    this.tryConvertParameter('time', str => parseInt(str))
    return this.directive.parameters
  }
  protected getDefaults() {
    return this.defaults
  }
  protected executeOperation(name: string, parameters: any): Promise<void> {
    switch (name) {
      case 'show':
        return this.renderer.show(parameters.title, parameters.subtitle, parameters.time)
      case 'hide':
        return this.renderer.hide(parameters.time)
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }

}

class Actor {
  img: string = null
  pos = 'left'
  name = ''
}

class ActorCommand extends Command {

  constructor(directive: Directive, private actor: Actor){
    super(directive)
  }

  protected loadParameters() {
    return this.directive.parameters
  }
  protected getDefaults() {
    return this.actor
  }
  protected executeOperation(name: string, parameters: any): Promise<void> {
    switch (name) {
      case 'set':
        Object.assign(this.actor, parameters)
        return Promise.resolve()    
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }
  
}

class WaitCommand extends Command {
  
  protected loadParameters() {
    this.tryConvertParameter('seconds', v => parseFloat(v))
    this.tryConvertParameter('time', v => parseInt(v))
    return { time: this.directive.parameters.time ?? this.directive.parameters.seconds*1000}
  }
  protected getDefaults() {
    return { time: 1000 }
  }
  protected executeOperation(name: string, parameters: any): Promise<void> {
    return TimeUtils.wait(parameters.time)
  }
}

class SceneCommand extends Command {
  constructor(d: Directive, private renderer: Background){
    super(d)
  }

  protected loadParameters() {
    return this.directive.parameters
  }
  protected getDefaults() {
    return { time: 1000 }
  }
  protected executeOperation(name: string, parameters: any): Promise<void> {
    switch (name) {
      case 'fade-in':
        return this.renderer.fadeIn(parameters.img, parameters.time)
      default:
        throw new Error('Unknown operation: ' + name)
    }
  }
  
}

class Scene implements Drawable {
  
  background = new Background();
  charLeft = new Character();
  charRight = new Character();
  title = new Title();
  voiceover = new Voiceover();
  lastText: Drawable

  actors: {[key:string]: Actor } = {}

  ink: Story;

  textMode: 'voiceover' = null

  constructor(private canvas: HTMLCanvasElement){

  }
  
  draw(ctx: CanvasRenderingContext2D){
    this.background.draw(ctx)
    this.title.draw(ctx)
    this.charLeft.draw(ctx)
    this.charRight.draw(ctx)
    this.voiceover.draw(ctx)
  }

  private clickOrKey(){
    return Promise.race([InputUtils.waitClick(this.canvas), InputUtils.waitKey()])
  }

  private async display(text: string, speaker: string){
    if(speaker === 'VOICEOVER') { 
      await this.voiceover.change(text, 1000);
      this.lastText = this.voiceover
      await this.clickOrKey()
    }
  }

  private async executeDirective(directive: Directive): Promise<void[] | void> {
    if(directive.command.toUpperCase() === directive.command) {
      let actor = this.actors[directive.command]
      if(!actor) actor = this.actors[directive.command] = new Actor();
      return new ActorCommand(directive, actor).executeOperations()
    }
    console.log(directive)
    switch (directive.command) {
      case 'title':
        return new TitleCommand(directive, this.title, this.ink.globalTags.title, this.ink.globalTags.author).executeOperations()
      case 'wait':
        return new WaitCommand(directive).executeOperations()
      case 'scene':
        return new SceneCommand(directive, this.background).executeOperations()
      default:
        throw new Error('Unknown directive: ' + directive.command)
    }
  }

  private async processLine(line: InkLine){
    await Promise.all(line.directives.map(x => this.executeDirective(x)))
    if(line.hasText){
      await this.display(line.text, line.speaker)
    }
  }

  async run(inkData: any){
    this.ink = new Story(inkData);

    await this.background.showOverlay('#000', 1)
    // if(this.ink.globalTags.background){
    //   await this.background.changeBg(this.ink.globalTags.background)
    // }
    // if(this.ink.globalTags.title){
    //   await this.title.show(this.ink.globalTags.title, this.ink.globalTags.author ?? '', 2000)
    // }
    //this.background.hideOverlay(5000)
    //await TimeUtils.wait(3000)
    //await this.title.hide(2000)
    //await this.background.showOverlay('#fff', 0.2, 2000)

    while (this.ink.story.canContinue) {
      while (this.ink.story.canContinue) {
        const raw = this.ink.story.Continue()
        const line = new InkLine(raw)
        await this.processLine(line)
      }
      // if (this.story.currentChoices.length > 0) {
      //   this.emit("choices", [this.story.currentChoices])
      //   const choice = await this.waitForChoice()
      //   this.story.ChooseChoiceIndex(choice)
      // } else {
      //   return;
      // }
    }

    //await this.background.hideOverlay(1000)
    //await this.background.changeBg('bg_alley_02', 1000)
    //await this.background.showOverlay('#fff', 0.2, 1000)
    this.charRight.change('man_02', 'right', true, 1000)
    await this.charLeft.change('women_02', 'left', true, 1000)

    // this.text.font = 'Neucha'
    // this.text.text = 'Hello Darkness my old friend'
    // this.text.x = 0.1
    // this.text.y = 0.1
  }
}

class InkLine {
  text = ''
  speaker = ''
  directives: Directive[] = []

  get hasText() { return this.text && this.text !== '' }

  private readonly outerReg = /@\(([^\)]+)\)/gm

  constructor(input: string){
    this.parse(input)
  }

  private parse(input: string){
    let outerMatch: RegExpExecArray;
    while((outerMatch = this.outerReg.exec(input)) !== null) {
      if(!outerMatch[1]) throw new Error('Malformed directive in line: ' + input)
      this.directives.push(new Directive(outerMatch[1]))
    }
    this.text = input.replace(this.outerReg,'').trim()
    const parts = this.text.split(':');
    if(parts.length > 1){
      this.speaker = parts[0]
      this.text = parts[1]
    }
  }
}

class Directive {
  command: string
  operations: string[] = []
  parameters: {[key: string]: any} = {}
  text: string = ''

  private readonly innerReg = /([^\s"':]+):"([^"]+)"|([^\s"':]+):'([^']+)'|([^\s"':]+):([^\s]+)|([^\s"':]+)/gm
  
  constructor(input: string){
    this.parse(input)
  }

  private parse(input: string){
    let innerMatch: RegExpExecArray
    while((innerMatch = this.innerReg.exec(input)) !== null) {
      const key = innerMatch[1] ?? innerMatch[3] ?? innerMatch[5] ?? null
      const value = innerMatch[2] ?? innerMatch[4] ?? innerMatch[6] ?? innerMatch[7]
      if(!value) throw new Error('Malformed directive ' + input)
      if(key){
        this.parameters[key] = value
      } else {
        if(!this.command) this.command = value
        else this.operations.push(value)
      }
    }
  }
}

const scene = new Scene(canvas)

onRender(ctx => {
  scene.draw(ctx);
});

scene.run(compiledStory).catch(err => console.log(err.stack));
