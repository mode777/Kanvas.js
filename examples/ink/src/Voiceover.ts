import { SpeechBox } from './SpeechBox';

export class Voiceover extends SpeechBox {
  
  constructor() {
    super()
    this.width = 0.66;
    this.x = 0.02;
    this.y = 0.02;
  }

  protected drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = 'rgba(255, 246, 79, 0.8)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 0.003 * ctx.canvas.height;
    ctx.strokeRect(x, y, w, h);
  }
  
}
