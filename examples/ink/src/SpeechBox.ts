import { EaseFuncs, tweenValue } from './easing';
import { Drawable } from './interfaces';
import { Paragraph } from './Paragraph';


export abstract class SpeechBox implements Drawable {
  protected paragraph: Paragraph;
  alpha = 1;
  x = 0;
  y = 0;
  width = 1;

  constructor() {
    const el = new Paragraph();
    el.font = 'PatrickHand';
    el.lineHeight = 0.035;
    this.paragraph = el;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.text || this.text == '' || this.alpha === 0)
      return;

    this.paragraph.x = this.x + 0.01;
    this.paragraph.y = this.x + 0.01;
    this.paragraph.width = this.width - 0.02;

    const h = this.paragraph.getPixelHeight(ctx) + (ctx.canvas.height * 0.02);
    const w = this.paragraph.getPixelWidth(ctx) + (ctx.canvas.width * 0.02);

    const x = this.x * ctx.canvas.width;
    const y = this.y * ctx.canvas.height;

    ctx.globalAlpha = this.alpha

    this.drawBox(ctx, x, y, w, h);

    this.paragraph.draw(ctx);

    ctx.globalAlpha = 1;
  }

  protected abstract drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number);

  public get text() {
    return this.paragraph.text;
  }
  public set text(value) {
    this.paragraph.text = value;
  }

  public async show(text: string, time = 0) {
    if (this.text && this.text !== '' && this.alpha !== 0) {
      await this.hide(time * 0.5);
      time *= 0.5;
    }
    this.alpha = 0;
    this.text = text;
    await tweenValue(this.alpha, 1, time, EaseFuncs.easeOutQuad, v => this.alpha = v);
    console.log('Showing...')
  }

  public async hide(time = 0) {
    await tweenValue(this.alpha, 0, time, EaseFuncs.easeOutQuad, v => this.alpha = v);
  }
}
