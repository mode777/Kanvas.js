import { Actor } from './Actor';
import { EaseFuncs, tweenValue } from './easing';
import { Drawable } from './interfaces';
import { LazyImage } from './LazyImage';
import { SpeechBubble } from './SpeechBubble';
import { DrawUtils } from './utils';

export class Costume implements Drawable {

  imageContainer =  new LazyImage();
  x: number = 0;
  flipped = false;
  alpha = 1;
  align: 'left' | 'center' | 'right' = 'left'
  bubble = new SpeechBubble()
  actor: Actor

  get actorId() { return this.actor?.id }
  get visible() { return this.alpha > 0 }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.imageContainer.image)
      return;
    const s = (ctx.canvas.height * 0.6) / this.imageContainer.image.height;
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
    ctx.translate(-this.imageContainer.image.width / 2, -this.imageContainer.image.height / 2);
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.imageContainer.image, 0, 0);
    //ctx.drawImage(image, -ctx.canvas.width * 0.1, ctx.canvas.height * 0.35, image.width * s, image.height * s);
    ctx.resetTransform();
    this.bubble.draw(ctx)
    ctx.globalAlpha = 1
  }

  async enter(actor: Actor, time = 0) {
    this.align = <any>actor.pos
    this.x = this.align === 'left' ? -0.25 : 1.25;
    this.alpha = 0;
    this.imageContainer.name = actor.img;
    this.flipped = actor.flipped;
    this.actor = actor
    if(time === 0){
      this.alpha = 1
      this.x = this.align === 'left' ? 0.2 : 0.8
    } else {
      tweenValue(0, 1, time, EaseFuncs.easeInCubic, x => this.alpha = x);
      await tweenValue(this.x, this.align === 'left' ? 0.2 : 0.8, time, EaseFuncs.easeOutCubic, x => this.x = x);
    }
  }

  async showBubble(text: string, time = 0){
    return this.bubble.show(text, time, this.align === 'left' ? .1 : 0.25, 0.2)
  }

  async hideBubble(time = 0){
    return this.bubble.hide(time)
  }

  async exit(time = 0){
    if(!this.visible) return
    if(time === 0){
      this.alpha = 0
      this.x = this.align === 'left' ? -0.25 : 1.25, time
    } else {
      tweenValue(this.alpha, 0, time, EaseFuncs.easeInCubic, x => this.alpha = x);
      await tweenValue(this.x, this.align === 'left' ? -0.25 : 1.25, time, EaseFuncs.easeOutCubic, x => this.x = x);
    }
    this.actor = null
  }
}
