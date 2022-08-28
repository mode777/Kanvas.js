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

window["kanvas"] = <any>{
  getContext: function(id){
    return new CanvasRenderingContext2D()
  }
};

