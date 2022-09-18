import { Actor } from './Actor';
import { EaseFuncs, tweenValue } from './easing';
import { Drawable } from './interfaces';
import { SpeechBox } from './SpeechBox';
import { DrawUtils } from './utils';

class Speech extends SpeechBox {

  constructor(){
    super()
    this.width = 0.33
  }

  protected drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.003 * ctx.canvas.height;
    ctx.strokeRect(x, y, w, h);
  }

  async show(text: string, time = 0, x = 0, y = 0){
    this.x = x
    this.y = y
    await super.show(text, time)
  }
}

export class Costume implements Drawable {

  image: ImageBitmap = null;
  x: number = 0;
  flipped = false;
  alpha = 1;
  align: 'left' | 'center' | 'right' = 'left'
  bubble = new Speech()
  actor: Actor

  get actorId() { return this.actor?.id }
  get visible() { return this.alpha > 0 }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.image)
      return;
    const s = (ctx.canvas.height * 0.6) / this.image.height;
    //const scale = 1 + (Math.sin(Time.elapsed/800)*0.01)
    //const offsetY = (Math.sin(Time.elapsed/800)*(ctx.canvas.height*0.004))
    //const offsetX = (Math.sin(Time.elapsed/2888)*(ctx.canvas.width*0.003))
    //ctx.translate(-image.width/2,-image.height/2)
    //ctx.translate(offsetX,offsetY)
    //ctx.translate()
    const x = ctx.canvas.width * this.x;
    ctx.translate(x, ctx.canvas.height * 0.7);
    ctx.scale(s * (this.flipped ? -1 : 1), s);
    //ctx.rotate(Math.sin(Time.elapsed / 800)*0.01)
    ctx.translate(-this.image.width / 2, -this.image.height / 2);
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.image, 0, 0);
    //ctx.drawImage(image, -ctx.canvas.width * 0.1, ctx.canvas.height * 0.35, image.width * s, image.height * s);
    ctx.resetTransform();
    this.bubble.draw(ctx)
    ctx.globalAlpha = 1
  }

  async enter(actor: Actor, time = 0) {
    this.align = <any>actor.pos
    this.x = this.align === 'left' ? -0.25 : 1.25;
    this.alpha = 0;
    this.image = await DrawUtils.loadImage(`assets/png/${actor.img}.png`);
    this.flipped = actor.flipped;
    this.actor = actor
    tweenValue(0, 1, time, EaseFuncs.easeInCubic, x => this.alpha = x);
    await tweenValue(this.x, this.align === 'left' ? 0.2 : 0.8, time, EaseFuncs.easeOutCubic, x => this.x = x);
  }

  async showBubble(text: string){
    await this.bubble.show(text, 1000, this.align === 'left' ? 0.1 : 0.56, 0.33)
  }

  async hideBubble(){
    await this.bubble.hide(1000)
  }

  async exit(time = 0){
    tweenValue(this.alpha, 0, time, EaseFuncs.easeInCubic, x => this.alpha = x);
    await tweenValue(this.x, this.align === 'left' ? -0.25 : 1.25, time, EaseFuncs.easeOutCubic, x => this.x = x);
    this.actor == null
  }
}
