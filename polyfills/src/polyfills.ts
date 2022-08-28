import 'core-js/actual';
import { CanvasRenderingContext2D } from './CanvasRenderingContext2D';

if (typeof window === 'undefined') {
  (function () {
      var window = new Function('return this;')();
      Object.defineProperty(window, 'window', {
          value: window,
          writable: true,
          enumerable: false,
          configurable: true
      });
  })();
}

class Kanvas {
  private readonly  listeners = {
    "mousemove": []
  };

  getContext(id){
    return new CanvasRenderingContext2D()
  }
  addEventListener(name, fn){
    this.listeners[name].push(fn)
  }
  dispatchEvent(event: Event){
    for (const listener of this.listeners[event.type]) {
      listener.apply(this, [event])
    }
  }
}

function requestAnimationFrame(fn){
  window["onrender"] = function(time){
    window["onrender"] = null
    fn(time)
  }
}

(<any>window).kanvas = new Kanvas();
(<any>window).requestAnimationFrame = requestAnimationFrame;
(<any>window).onmousemove = (x,y) => {

  const ev = <Event><any>{type: "mousemove", offsetX: x, offsetY: y }
  window.kanvas.dispatchEvent(ev);
}

