import compiledStory from './../ink/test2.ink';
import { EaseFunc, EaseFuncs, tweenValue } from './easing';

import * as ink from 'inkjs/dist/ink'
import { Drawable } from './interfaces';
import { InputUtils, TimeUtils } from './utils';
import { Background } from './Background';
import { Costume } from './Costume';
import { Title } from './Title';
import { Voiceover } from './Voiceover';
import { InkLine } from './InkLine';
import { Directive } from './Directive';
import { Paragraph } from './Paragraph';
import { Actor } from './Actor';

const canvas = window['kanvas'] ?? <HTMLCanvasElement>document.getElementById('canvas')

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

class ActorCommand extends Command {

  constructor(directive: Directive, private actor: Actor, private costumeLeft: Costume, private costumeRight: Costume){
    super(directive)
  }

  protected loadParameters() {
    this.tryConvertParameter('flipped', v => v === 'true')
    return this.directive.parameters
  }
  protected getDefaults() {
    return this.actor
  }
  protected async executeOperation(name: string, parameters: any): Promise<void> {
    let cost: Costume;
    switch (name) {
      case 'set':
        Object.assign(this.actor, parameters)
        return Promise.resolve()  
      case 'enter':
        cost = parameters.pos === 'right' ? this.costumeRight : this.costumeLeft
        if(cost.visible) {
          await cost.exit(parameters.time*0.5)
          parameters.time *= 0.5
        }
        await cost.enter(parameters, parameters.time)
        return  
      case 'exit': 
        cost = parameters.pos === 'right' ? this.costumeRight : this.costumeLeft
        if(cost.visible) {
          await cost.exit(parameters.time)
        }
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

interface InkChoice {
  text: string
  index: number
}

class Option implements Drawable {

  private paragraph = new Paragraph()
  private readonly handler = (ev: MouseEvent) => this.handleInput(ev);
  private x = 0
  private y = 0
  private alpha = 1
  private boundingBox = [0,0,0,0]
  private state = 'inactive'
  private color = 'rgba(255,255,255,0.6)'
  private observer: (idx: number) => void;

  constructor(private canvas: HTMLCanvasElement, public id: number, text: string){
    this.paragraph.text = text
    this.paragraph.font = 'PatrickHand'
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    if(this.alpha > 0){
      const w = this.paragraph.getPixelWidth(ctx) + (ctx.canvas.width * 0.02)
      const h = this.paragraph.getPixelHeight(ctx) + (ctx.canvas.height * 0.02)
      this.paragraph.x = this.x
      this.paragraph.y = this.y
      const x = ctx.canvas.width * (this.x-0.01)
      const y = ctx.canvas.height * (this.y-0.01)
      ctx.translate(-w/2,-h/2)
      ctx.globalAlpha = this.alpha
      ctx.fillStyle = this.color
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 0.003 * ctx.canvas.height
      ctx.strokeRect(x,y,w,h)
      this.paragraph.draw(ctx)
      ctx.globalAlpha = 1
      ctx.translate(w/2,h/2)
      this.boundingBox = [x-w/2,y-h/2,w,h]
    }
  }

  public registerObserver(cb: (idx: number) => void){
    this.observer = cb;
  }

  private isInside(x,y){
    const [bx,by,bw,bh] = this.boundingBox;
    return x >= bx && y >= by && x < bx+bw && y < by+bh
  }

  private handleInput(ev: MouseEvent){
    switch (this.state) {
      case 'inactive':
        this.color = 'rgba(255,255,255,0.6)'
        if(this.isInside(ev.offsetX,ev.offsetY)) this.state = 'mouseover'
        return;
      case 'mouseover':
        this.color = '#fff'
        if(!this.isInside(ev.offsetX,ev.offsetY)) {
          this.state = 'inactive'
          return
        }
        if(ev.type === 'mousedown' && ev.button === 0){
          this.state = 'active'
          this.color = 'rgba(255, 246, 79, 1)'
          return 
        }
        return;
      case 'active': 
        this.color = 'rgba(255, 246, 79, 1)'
        if(!this.isInside(ev.offsetX,ev.offsetY)) {
          this.state = 'inactive'
          return
        }
        if(ev.type === 'mouseup' && ev.button === 0){
          this.observer(this.id)
          this.state = 'mouseover'
          return 
        }
        return;
      default:
        break;
    }
  }

  async show(x = 0, y = 0, time = 0){
    this.x = x
    this.y = y
    this.alpha = 0
    await tweenValue(0,1,time,EaseFuncs.easeInQuad,v => this.alpha = v)
    canvas.addEventListener('mousemove', this.handler);
    canvas.addEventListener('mousedown', this.handler);
    canvas.addEventListener('mouseup', this.handler);
  }

  async hide(time = 0){
    await tweenValue(this.alpha,0,time,EaseFuncs.easeInQuad,v => this.alpha = v)
    canvas.removeEventListener('mousemove', this.handler);
    canvas.removeEventListener('mousedown', this.handler);
    canvas.removeEventListener('mouseup', this.handler);
  }

}

class Choices implements Drawable {
  options: Option[] = []

  constructor(private canvas: HTMLCanvasElement){

  }

  draw(ctx: CanvasRenderingContext2D) {
    
    for (const opt of this.options) {
      opt.draw(ctx)
    }
  }

  async getChoice(choices: InkChoice[], time = 0){
    this.options = choices.map(x => new Option(this.canvas, x.index, x.text))
    let x = 0.5
    let y = 0.66
    let observer: (number) => void;
    const promise = new Promise<number>((res) => observer = res);
    for (const opt of this.options) {
      opt.registerObserver(observer)
      await opt.show(x,y,time/this.options.length)
    }
    const choice = await promise
    await this.hide(time)
    return choice
  }

  async hide(time = 0){
    for (const opt of this.options) {
      await opt.hide(time/this.options.length)
    }
    this.options = []
  }

}

class Stage {
  
  background = new Background();
  charLeft = new Costume();
  charRight = new Costume();
  title = new Title();
  voiceover = new Voiceover();
  choices: Choices
  lastText: Drawable

  actors: {[key:string]: Actor } = {}
  ctx: CanvasRenderingContext2D

  ink: Story;

  textMode: 'voiceover' = null

  constructor(private canvas: HTMLCanvasElement){
    this.ctx = canvas.getContext('2d');
    this.choices = new Choices(canvas);
  }
  
  draw(){
    this.background.draw(this.ctx)
    this.charLeft.draw(this.ctx)
    this.charRight.draw(this.ctx)
    this.voiceover.draw(this.ctx)
    this.choices.draw(this.ctx)
    this.title.draw(this.ctx)
  }

  private clickOrKey(){
    return Promise.race([InputUtils.waitClick(this.canvas), InputUtils.waitKey()])
  }

  private async display(text: string, speaker: string){
    if(speaker === 'VOICEOVER') { 
      await this.voiceover.show(text, 1000);
      this.lastText = this.voiceover
      await this.clickOrKey()
      await this.voiceover.hide(1000)
    } else {
      let costume = speaker === this.charLeft.actorId 
        ? this.charLeft : (speaker === this.charRight.actorId ? this.charRight : null)
      if(costume === null){
        const actor = this.actors[speaker]
        if(!actor) throw new Error('Unknown character: ' + speaker)
        costume = actor.pos === 'left' ? this.charLeft : this.charRight
        if(costume.actorId) await costume.exit(1000)
        await costume.enter(actor, 1000)
      } 
      await costume.showBubble(text)
      await this.clickOrKey()
      await costume.hideBubble()
    }
  }

  private async executeDirective(directive: Directive): Promise<void[] | void> {
    if(directive.command.toUpperCase() === directive.command) {
      let actor = this.actors[directive.command]
      if(!actor) actor = this.actors[directive.command] = new Actor(directive.command);
      return new ActorCommand(directive, actor, this.charLeft, this.charRight).executeOperations()
    }
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
    while (this.ink.story.canContinue) {
      while (this.ink.story.canContinue) {
        const raw = this.ink.story.Continue()
        const line = new InkLine(raw)
        await this.processLine(line)
      }
      if (this.ink.story.currentChoices.length > 0) {
        const choice = await this.choices.getChoice(this.ink.story.currentChoices, 2000)
        this.ink.story.ChooseChoiceIndex(choice)
      } else {
        return;
      }
    }
  }
}

const stage = new Stage(canvas)

function draw(t) {
  stage.draw()
  requestAnimationFrame(draw)
}
requestAnimationFrame(draw)

stage.run(compiledStory).catch(err => console.log(err.stack));
