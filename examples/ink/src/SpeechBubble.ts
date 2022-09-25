import { SpeechBox } from './SpeechBox';

export class SpeechBubble extends SpeechBox {

  constructor() {
    super();
    this.width = 0.66;
  }

  protected drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.003 * ctx.canvas.height;
    ctx.strokeRect(x, y, w, h);
  }

  show(text: string, time = 0, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    return super.show(text, time);
  }
}
