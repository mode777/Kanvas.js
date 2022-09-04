import { Path2D } from "./Path2d";

export class CanvasRenderingContext2D {
  constructor(){
    this.fillStyle = "#000"
    // vg.createFont("sans-serif", "assets/fonts/Roboto/Roboto-Regular.ttf");
    // vg.createFont("sans-serif:bold", "assets/fonts/Roboto/Roboto-Bold.ttf");
    // vg.createFont("sans-serif:italic", "assets/fonts/Roboto/Roboto-Italic.ttf");
    // vg.createFont("sans-serif:bold:italic", "assets/fonts/Roboto/Roboto-BoldItalic.ttf");
    // vg.createFont("serif", "assets/fonts/NotoSerif/NotoSerif-Regular.ttf");
    // vg.createFont("serif:bold", "assets/fonts/NotoSerif/NotoSerif-Bold.ttf");
    // vg.createFont("serif:italic", "assets/fonts/NotoSerif/NotoSerif-Italic.ttf");
    // vg.createFont("serif:bold:italic", "assets/fonts/NotoSerif/NotoSerif-BoldItalic.ttf");
  }
  globalAlpha: number;
  globalCompositeOperation: any;
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: unknown, sx: unknown, sy: unknown, sw?: unknown, sh?: unknown, dx?: unknown, dy?: unknown, dw?: unknown, dh?: unknown): void {
    throw new Error('drawImage not implemented.');
  }
  beginPath(): void {
    vg.beginPath()
  }
  clip(fillRule?: CanvasFillRule): void;
  clip(path: Path2D, fillRule?: CanvasFillRule): void;
  clip(path?: unknown, fillRule?: unknown): void {
    throw new Error('clip not implemented.');
  }
  fill(fillRule?: CanvasFillRule): void;
  fill(path: Path2D, fillRule?: CanvasFillRule): void;
  fill(path?: unknown, fillRule?: unknown): void {
    // TODO: Implement more
    vg.fillColor(this.fillStyle);
    if(path){
      (<Path2D>path).apply();
    }
    vg.fill();
  }
  isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInPath(path: Path2D, x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInPath(path: unknown, x: unknown, y?: unknown, fillRule?: unknown): boolean {
    throw new Error('isPointInPath not implemented.');
  }
  isPointInStroke(x: number, y: number): boolean;
  isPointInStroke(path: Path2D, x: number, y: number): boolean;
  isPointInStroke(path: unknown, x: unknown, y?: unknown): boolean {
    throw new Error('isPointInStroke not implemented.');
  }
  stroke(): void;
  stroke(path: Path2D): void;
  stroke(path?: unknown): void {
    vg.strokeWidth(this.lineWidth);
    vg.strokeColor(this.strokeStyle)
    if(path){
      (<Path2D>path).apply();
    } 
    vg.stroke()
    
  }
  private _fillStyle: string | CanvasGradient | CanvasPattern = "#000"
  public set fillStyle(v: string | CanvasGradient | CanvasPattern){
    //vg.fillColor(v);
    this._fillStyle = v;
  }
  public get fillStyle() {
    return this._fillStyle
  }
  private _strokeStyle: string | CanvasGradient | CanvasPattern;
  public get strokeStyle(): string | CanvasGradient | CanvasPattern {
    return this._strokeStyle;
  }
  public set strokeStyle(value: string | CanvasGradient | CanvasPattern) {
    this._strokeStyle = value;
  }
  createConicGradient(startAngle: number, x: number, y: number): CanvasGradient {
    throw new Error('createConicGradient not implemented.');
  }
  createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    throw new Error('createLinearGradient not implemented.');
  }
  createPattern(image: CanvasImageSource, repetition: string): CanvasPattern {
    throw new Error('createPattern not implemented.');
  }
  createRadialGradient(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): CanvasGradient {
    throw new Error('createRadialGradient not implemented.');
  }
  filter: string;
  createImageData(sw: number, sh: number, settings?: any): ImageData;
  createImageData(imagedata: ImageData): ImageData;
  createImageData(sw: unknown, sh?: unknown, settings?: unknown): ImageData {
    throw new Error('createImageData not implemented.');
  }
  getImageData(sx: number, sy: number, sw: number, sh: number, settings?: any): ImageData {
    throw new Error('getImageData not implemented.');
  }
  putImageData(imagedata: ImageData, dx: number, dy: number): void;
  putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
  putImageData(imagedata: unknown, dx: unknown, dy: unknown, dirtyX?: unknown, dirtyY?: unknown, dirtyWidth?: unknown, dirtyHeight?: unknown): void {
    throw new Error('putImageData not implemented.');
  }
  imageSmoothingEnabled: boolean;
  imageSmoothingQuality: ImageSmoothingQuality;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    vg.arc(x,y,radius,startAngle,endAngle,counterclockwise ? vg.CCW : vg.CW)
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    throw new Error('arcTo not implemented.');
  }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    vg.bezierTo(cp1x,cp1y,cp2x,cp2y,x,y);
  }
  closePath(): void {
    vg.closePath()
  }
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    vg.ellipse(x,y,radiusX,radiusY)
  }
  lineTo(x: number, y: number): void {
    vg.lineTo(x,y)
  }
  moveTo(x: number, y: number): void {
    vg.moveTo(x,y)
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    vg.quadTo();
  }
  rect(x: number, y: number, w: number, h: number): void {
    vg.rect(x,y,w,h);
  }
  lineCap: CanvasLineCap;
  lineDashOffset: number;
  lineJoin: CanvasLineJoin;
  lineWidth: number = 1;
  miterLimit: number;
  getLineDash(): number[] {
    throw new Error('getLineDash not implemented.');
  }
  setLineDash(segments: number[]): void {
    throw new Error('setLineDash not implemented.');
  }
  clearRect(x: number, y: number, w: number, h: number): void {
    vg.clear()
  }
  fillRect(x: number, y: number, w: number, h: number): void {
    vg.beginPath();
    vg.rect(x,y,w,h);
    vg.fillColor(this._fillStyle);
    vg.fill();
  }
  strokeRect(x: number, y: number, w: number, h: number): void {
    throw new Error('strokeRect not implemented.');
  }
  shadowBlur = 0;
  shadowColor = "#00000000";
  shadowOffsetX = 0;
  shadowOffsetY = 0;
  restore(): void {
    vg.restore();
  }
  save(): void {
    vg.save()
  }

  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    const face = `${this._fontFace}${this._fontBold ? ':bold' : ''}${this._fontItalic ? ':italic' : ''}`
    this.checkFace(face);
    vg.fontFace(face)
    vg.fontSize(this._fontSize)
    if(this.shadowBlur != 0){
      vg.fontBlur(this.shadowBlur)
      vg.fillColor(this.shadowColor)
      if(maxWidth){
        vg.textBox(x+this.shadowOffsetX,y+this.shadowOffsetY,maxWidth,text);
      } else {
        vg.text(x+this.shadowOffsetX,y+this.shadowOffsetY,text);
      }
      vg.fontBlur(0)
    }
    vg.fillColor(this._fillStyle)
    if(maxWidth){
      vg.textBox(x,y,maxWidth,text);
    } else {
      vg.text(x,y,text);
    }
  }
  private faces = {
    "sans-serif": "assets/fonts/Roboto/Roboto-Regular.ttf",
    "sans-serif:bold": "assets/fonts/Roboto/Roboto-Bold.ttf",
    "sans-serif:italic": "assets/fonts/Roboto/Roboto-Italic.ttf",
    "sans-serif:bold:italic": "assets/fonts/Roboto/Roboto-BoldItalic.ttf",
    "serif": "assets/fonts/NotoSerif/NotoSerif-Regular.ttf",
    "serif:bold": "assets/fonts/NotoSerif/NotoSerif-Bold.ttf",
    "serif:italic": "assets/fonts/NotoSerif/NotoSerif-Italic.ttf",
    "serif:bold:italic": "assets/fonts/NotoSerif/NotoSerif-BoldItalic.ttf"
  }
  private loaded = {}
  private checkFace(str: string){
    if(!this.loaded[str]){
      vg.createFont(str,this.faces[str])
      this.loaded[str] = true
    }
  }
  measureText(text: string): TextMetrics {
    throw new Error('measureText not implemented.');
  }
  strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    throw new Error('strokeText not implemented.');
  }
  direction: CanvasDirection;
  _fontFace = "sans"
  _fontSize = 12
  _fontBold = false
  _fontItalic = false
  get font() {
    return `${ this._fontItalic ? 'italic ' : '' }${this._fontBold ? 'bold ' : '' }${this._fontSize}px ${this._fontFace}`
  }
  set font(v){
    var f = v.split(' ')
    if(f.length == 2){
      this._fontSize = parseInt(f[0])
      this._fontFace = f[1]
    } else if(f.length == 3){
      this._fontBold = f[0] == 'bold'
      this._fontItalic = f[0] == 'italic'
      this._fontSize = parseInt(f[1])
      this._fontFace = f[2]
    } else if(f.length == 4){
      this._fontBold = f[0] == 'bold' || f[1] == 'bold'
      this._fontItalic = f[0] == 'italic' || f[1] == 'italic' 
      this._fontSize = parseInt(f[2])
      this._fontFace = f[3]
    }
  }
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  getTransform(): DOMMatrix {
    throw new Error('getTransform not implemented.');
  }
  resetTransform(): void {
    vg.resetTransform();
  }
  rotate(angle: number): void {
    vg.rotate(angle);
  }
  scale(x: number, y: number): void {
    vg.scale(x,y);
  }
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  setTransform(transform?: DOMMatrix2DInit): void;
  setTransform(a?: unknown, b?: unknown, c?: unknown, d?: unknown, e?: unknown, f?: unknown): void {
    throw new Error('setTransform not implemented.');
  }
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    vg.transform(a,b,c,d,e,f)
  }
  translate(x: number, y: number): void {
    vg.translate(x,y)
  }
  drawFocusIfNeeded(element: Element): void;
  drawFocusIfNeeded(path: Path2D, element: Element): void;
  drawFocusIfNeeded(path: unknown, element?: unknown): void {
    throw new Error('drawFocusIfNeeded not implemented.');
  }
  readonly canvas = window["kanvas"];
  getContextAttributes() {
    return {};
  }
}
