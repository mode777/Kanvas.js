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
  private readonly  listeners = {};

  getContext(id){
    return new CanvasRenderingContext2D()
  }
  private ensureListener(name){
    if(!this.listeners[name]){
      this.listeners[name] = []
    }
  }
  addEventListener(name, fn){
    this.ensureListener(name)
    this.listeners[name].push(fn)
    //console.log(JSON.stringify(this.listeners))
  }
  dispatchEvent(event: Event){
    this.ensureListener(event.type)
    //console.log(JSON.stringify(this.listeners))

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
(<any>window).dispatchEvent = (ev) => {
  window.kanvas.dispatchEvent(ev)
}

const k = <KeyboardEvent>

