import { DrawUtils } from './utils';


export class LazyImage {
  private _name: string;
  private _image: ImageBitmap;
  private _promise: Promise<ImageBitmap>;
  public get image(): ImageBitmap {
    if (!this._image && !this._promise) {
      this.loadImage(this._name);
    }
    return this._image;
  }
  public get name(): string {
    return this._name;
  }
  public set name(value: string) {
    if (value !== this._name) {
      this._image = null;
      this._promise = null;
      this._name = value;
    }
  }
  loadImage(name: string) {
    const prom = this._promise = DrawUtils.loadImage(`assets/png/${name}.png`);
    prom.then(x => {
      if (prom === this._promise)
        this._image = x;
    });
  }
}
