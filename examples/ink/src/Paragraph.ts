import { Drawable } from './interfaces';

export interface Line {
  text: string,
  width: number
}

export class Paragraph implements Drawable {
  private _text = '';
  public get text() {
    return this._text;
  }
  public set text(value) {
    this._text = value;
    this.dirty = true;
  }
  private _font = 'serif';
  public get font() {
    return this._font;
  }
  public set font(value) {
    this._font = value;
    this.dirty = true;
  }
  private _lineHeight = 0.05;
  public get lineHeight() {
    return this._lineHeight;
  }
  public set lineHeight(value) {
    this._lineHeight = value;
    this.dirty = true;
  }
  private _width = 1;
  public get width() {
    return this._width;
  }
  public set width(value) {
    this._width = value;
    this.dirty = true;
  }
  color = '#000';
  private dirty = true;
  x = 0;
  y = 0;
  private canvasWidth = -1;
  private canvasHeight = -1;
  private lines: Line[];
  align: 'left' | 'center' | 'right' = 'left';

  getPixelHeight(ctx: CanvasRenderingContext2D) {
    this.update(ctx);
    return this.lineHeight * this.canvasHeight * this.lines.length;
  }

  getHeight(ctx: CanvasRenderingContext2D){
    return this.getPixelHeight(ctx) / this.canvasHeight;
  }

  getPixelWidth(ctx: CanvasRenderingContext2D) {
    this.update(ctx);
    return this.lines.reduce((p,c) => c.width > p ? c.width : p,0);
  }

  getWidth(ctx: CanvasRenderingContext2D){
    return this.getPixelWidth(ctx) / this.canvasWidth;
  }

  private update(ctx: CanvasRenderingContext2D) {
    ctx.font = `${this.lineHeight * ctx.canvas.height}px ${this.font}`;
    ctx.fillStyle = this.color;
    ctx.textBaseline = 'top';
    if (this.dirty || this.canvasWidth !== ctx.canvas.width || this.canvasHeight !== ctx.canvas.height) {
      this.canvasWidth = ctx.canvas.width;
      this.canvasHeight = ctx.canvas.height;
      this.lines = this.getLines(ctx, this.text, this.width * this.canvasWidth);
      this.dirty = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.text && this.text !== '') {
      this.update(ctx);
      let y = this.y * this.canvasHeight;
      for (const line of this.lines) {
        const offset = this.align === 'left'
          ? 0 : (this.align === 'center' ? ((this.width * this.canvasWidth) - line.width) / 2 : (this.width * this.canvasWidth) - line.width);
        ctx.fillText(line.text, (this.x * this.canvasWidth) + offset, y);
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
        lines.push({ text: currentLine, width: lastw });
        currentLine = word;
        //lastw = width;
      }
      lastw = width;
      if (i === words.length - 1)
        lastw = ctx.measureText(currentLine).width;
    }
    if(words.length === 1) lastw = ctx.measureText(currentLine).width
    lines.push({ text: currentLine, width: lastw });
    return lines;
  }
}
