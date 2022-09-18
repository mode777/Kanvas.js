import { EaseFuncs, tweenValue } from './easing';
import { Drawable } from './interfaces';

export class Title implements Drawable {
  title = '';
  subtitle = '';
  titleAlpha = 1;
  subtitleAlpha = 1;
  titleStyle = 'bold';
  titleFont = 'serif';
  titleHeight = 0.15;
  titleColor = '#ffffffff';
  subtitleColor = '#fff';
  shadowColor = '#000';
  subtitleHeight = 0.07;
  subtitleFont = 'serif';
  subtitleStyle = '';
  underlineWidth = 0.8;
  underlineColor = '#a00';
  y = 0.5;

  draw(ctx: CanvasRenderingContext2D) {
    ctx.textAlign = 'center';
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (this.title && this.title !== '' && this.titleAlpha > 0) {
      ctx.globalAlpha = this.titleAlpha;
      ctx.font = `${this.titleStyle} ${this.titleHeight * h}px ${this.titleFont}`;
      ctx.shadowBlur = this.titleHeight * h * 0.08;
      ctx.shadowColor = this.shadowColor;
      ctx.fillStyle = this.titleColor;
      ctx.fillText(this.title, w / 2, h * this.y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = this.underlineColor;
      ctx.fillRect(w * ((1 - this.underlineWidth) / 2), (this.y + 0.03) * h, this.underlineWidth * w, h * 0.01);
    }
    if (this.subtitle && this.subtitle !== '' && this.subtitleAlpha > 0) {
      ctx.globalAlpha = this.subtitleAlpha;
      ctx.font = `${this.subtitleStyle} ${this.subtitleHeight * h}px ${this.subtitleFont}`;
      ctx.shadowBlur = this.subtitleHeight * h * 0.08;
      ctx.shadowColor = this.shadowColor;
      ctx.fillStyle = this.subtitleColor;
      ctx.fillText(this.subtitle, w / 2, h * (this.y + 0.13));
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'start';
  }

  async show(title: string, subtitle = null, time = 0) {
    this.y = 0.5;
    this.titleAlpha = 0;
    this.subtitleAlpha = 0;
    this.subtitle = subtitle;
    this.title = title;
    this.underlineWidth = 0;
    tweenValue(0, 1, time * 0.4, EaseFuncs.easeInCubic, x => this.titleAlpha = x);
    await tweenValue(0, 0.8, time * 0.5, EaseFuncs.linear, v => this.underlineWidth = v);
    if (this.subtitle != null) {
      await tweenValue(this.y, this.y - 0.1, time * 0.2, EaseFuncs.easeOutCubic, v => this.y = v);
      await tweenValue(0, 1, time * 0.3, EaseFuncs.easeInCubic, v => this.subtitleAlpha = v);
    }
  }

  async hide(time = 0) {
    tweenValue(this.titleAlpha, 0, time, EaseFuncs.easeOutCubic, x => this.titleAlpha = x);
    await tweenValue(this.subtitleAlpha, 0, time, EaseFuncs.easeOutCubic, x => this.subtitleAlpha = x);
    this.title = null;
  }
}
