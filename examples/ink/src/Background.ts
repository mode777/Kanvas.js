import { EaseFuncs, tweenValue } from './easing';
import { Drawable } from './interfaces';
import { DrawUtils } from './utils';

export class Background implements Drawable {

  fade = 0;
  imageA: ImageBitmap = null;
  imageB: ImageBitmap = null;
  overlayColor = '#fff';
  overlayAlpha = 0;

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = 1 - this.fade;
    if (this.imageA)
      DrawUtils.drawFullScreenImage(ctx, this.imageA);
    ctx.globalAlpha = this.fade;
    if (this.imageB)
      DrawUtils.drawFullScreenImage(ctx, this.imageB);
    if (this.overlayAlpha > 0) {
      ctx.globalAlpha = this.overlayAlpha;
      ctx.fillStyle = this.overlayColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.globalAlpha = 1;
    }
  }

  async changeBg(name: string, time = 0) {
    const img = await DrawUtils.loadImage(`assets/png/${name}.png`);
    this.imageB = img;
    await tweenValue(0, 1, time, EaseFuncs.easeInQuad, v => this.fade = v);
    this.imageA = img;
    this.imageB = null;
    this.fade = 0;
  }

  async fadeIn(name: string, time = 0) {
    if (!name)
      return;
    this.imageA = await DrawUtils.loadImage(`assets/png/${name}.png`);
    this.fade = 0;
    await tweenValue(this.overlayAlpha, 0, time, EaseFuncs.easeInQuad, v => this.overlayAlpha = v);
  }

  async showOverlay(color: string = '#fff', alpha = 0.2, time = 0) {
    this.overlayColor = color;
    await tweenValue(this.overlayAlpha, alpha, time, EaseFuncs.easeOutCubic, v => this.overlayAlpha = v);
  }

  async hideOverlay(time = 0) {
    await tweenValue(this.overlayAlpha, 0, time, EaseFuncs.easeInCubic, v => this.overlayAlpha = v);
  }
}
