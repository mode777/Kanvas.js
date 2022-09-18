import { SPEEDUP } from "./debug";

export class InputUtils {
  static waitForEvent<T extends Event>(name: string, target: EventTarget = window, predicate?: (ev: T) => boolean) {
    return new Promise<T>((res, rej) => {
      const handler = (ev) => {
        if (!predicate || predicate(ev)) {
          res(ev);
          removeEventListener(name, handler);
        }
      };
      addEventListener(name, handler);
    });
  }
  static async waitKey(keys?: string[]) {
    var ev = await InputUtils.waitForEvent<KeyboardEvent>('keydown', window, ev => !keys || keys.findIndex(x => x === ev.key) != -1);
    return ev.key;
  }
  static waitClick(canvas: HTMLCanvasElement) {
    return InputUtils.waitForEvent('click', canvas);
  }
}

export class TimeUtils {
  static async wait(time: number){
    if(SPEEDUP){
      return Promise.resolve()
    }
    return new Promise<void>((res,rej) => {
      let start = -1
      const fn = t => {
        if(start === -1) start = t
        if((t-start) >= time){
          res()   
        } else {
          requestAnimationFrame(fn)
        }
      }
      requestAnimationFrame(fn)
    });
  }
}

export class DrawUtils {
  private constructor(){}
  static drawFullScreenImage(ctx: CanvasRenderingContext2D, image: ImageBitmap){
    const sx = ctx.canvas.width / image.width
    const sy = ctx.canvas.height / image.height
    let w,h
    if(sx > sy){
      w = ctx.canvas.width
      h = image.height * sx
    } else {
      h = ctx.canvas.height
      w = image.width * sy
    }
    ctx.drawImage(image, -(w - ctx.canvas.width)/2 - (w*0.01),-(h-ctx.canvas.height)/2 -(h*0.01), w*1.02, h*1.02)
  }
  static async loadImage(file: string){
    return await createImageBitmap(await (await fetch(file)).blob());
  }
}

