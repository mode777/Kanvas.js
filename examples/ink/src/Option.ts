import { EaseFuncs, tweenValue } from './easing';
import { Drawable } from './interfaces';
import { Paragraph } from './Paragraph';
import { canvas } from './main';

export class Option implements Drawable {

  private paragraph = new Paragraph();
  private readonly handler = (ev: MouseEvent) => this.handleInput(ev);
  private x = 0;
  private y = 0;
  private alpha = 0;
  private boundingBox = [0, 0, 0, 0];
  private state = 'inactive';
  private color = 'rgba(255,255,255,0.6)';
  private observer: (idx: number) => void;

  constructor(private canvas: HTMLCanvasElement, public id: number, text: string) {
    this.paragraph.text = text;
    this.paragraph.font = 'PatrickHand';
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.alpha > 0) {
      const w = this.paragraph.getPixelWidth(ctx) + (ctx.canvas.width * 0.02);
      const h = this.paragraph.getPixelHeight(ctx) + (ctx.canvas.height * 0.02);
      this.paragraph.x = this.x;
      this.paragraph.y = this.y;
      const x = ctx.canvas.width * (this.x - 0.01);
      const y = ctx.canvas.height * (this.y - 0.01);
      ctx.translate(-w / 2, -h / 2);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.003 * ctx.canvas.height;
      ctx.strokeRect(x, y, w, h);
      this.paragraph.draw(ctx);
      ctx.globalAlpha = 1;
      ctx.translate(w / 2, h / 2);
      this.boundingBox = [x - w / 2, y - h / 2, w, h];
    }
  }

  public registerObserver(cb: (idx: number) => void) {
    this.observer = cb;
  }

  private isInside(x, y) {
    const [bx, by, bw, bh] = this.boundingBox;
    return x >= bx && y >= by && x < bx + bw && y < by + bh;
  }

  private handleInput(ev: MouseEvent) {
    switch (this.state) {
      case 'inactive':
        this.color = 'rgba(255,255,255,0.6)';
        if (this.isInside(ev.offsetX, ev.offsetY))
          this.state = 'mouseover';
        return;
      case 'mouseover':
        this.color = '#fff';
        if (!this.isInside(ev.offsetX, ev.offsetY)) {
          this.state = 'inactive';
          return;
        }
        if (ev.type === 'mousedown' && ev.button === 0) {
          this.state = 'active';
          this.color = 'rgba(255, 246, 79, 1)';
          return;
        }
        return;
      case 'active':
        this.color = 'rgba(255, 246, 79, 1)';
        if (!this.isInside(ev.offsetX, ev.offsetY)) {
          this.state = 'inactive';
          return;
        }
        if (ev.type === 'mouseup' && ev.button === 0) {
          this.observer(this.id);
          this.state = 'mouseover';
          return;
        }
        return;
      default:
        break;
    }
  }

  async show(x = 0, y = 0, time = 0) {
    this.x = x;
    this.y = y;
    this.alpha = 0;
    await tweenValue(0, 1, time, EaseFuncs.easeInQuad, v => this.alpha = v);
    canvas.addEventListener('mousemove', this.handler);
    canvas.addEventListener('mousedown', this.handler);
    canvas.addEventListener('mouseup', this.handler);
  }

  async hide(time = 0) {
    await tweenValue(this.alpha, 0, time, EaseFuncs.easeInQuad, v => this.alpha = v);
    canvas.removeEventListener('mousemove', this.handler);
    canvas.removeEventListener('mousedown', this.handler);
    canvas.removeEventListener('mouseup', this.handler);
  }
}
