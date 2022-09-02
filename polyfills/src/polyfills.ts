import 'core-js/actual/array';
//import 'core-js/actual/array-buffer';
//import 'core-js/actual/data-view';
import 'core-js/actual/date';
import 'core-js/actual/dom-collections';
import 'core-js/actual/dom-exception';
import 'core-js/actual/error';
import 'core-js/actual/function';
//import 'core-js/actual/instance';
//import 'core-js/actual/json';
import 'core-js/actual/map';
import 'core-js/actual/math';
import 'core-js/actual/number';
import 'core-js/actual/object';
import './../../thirdparty/duktape/polyfills/promise'
//import 'core-js/actual/promise';
import 'core-js/actual/reflect';
import 'core-js/actual/regexp';
import 'core-js/actual/set';
import 'core-js/actual/string';
import 'core-js/actual/symbol';
//import 'core-js/actual/typed-array';
import 'core-js/actual/url';
import 'core-js/actual/url-search-params';
import 'core-js/actual/weak-map';
import 'core-js/actual/weak-set';

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
  private readonly listeners: { [key: string]: any[] } = {};
  public readonly width = (<any>window).kanvas_width;
  public readonly height = (<any>window).kanvas_height;

  getContext(id) {
    return new CanvasRenderingContext2D()
  }
  private ensureListener(name) {
    if (!this.listeners[name]) {
      this.listeners[name] = []
    }
  }
  addEventListener(name, fn) {
    this.ensureListener(name)
    this.listeners[name].push(fn)
    //console.log(JSON.stringify(this.listeners))
  }
  removeEventListener(name, fn) {
    this.ensureListener(name)
    const idx = this.listeners[name].findIndex((v) => v == fn)
    this.listeners[name].splice(idx, 1)
  }
  dispatchEvent(event: Event) {
    this.ensureListener(event.type)
    //console.log(event.type, this.listeners[event.type].length)
    const listeners = this.listeners[event.type]
    if (listeners.length > 0) {
      const copy = [...listeners]
      //let i = 1
      for (const listener of copy) {
        //console.log("dispatch " + i++)
        listener.apply(this, [event])
      }
    }


  }
}

function requestAnimationFrame(fn) {
  window["onrender"] = function (time) {
    window["onrender"] = null
    fn(time)
  }
}

(<any>window).kanvas = new Kanvas();
(<any>window).requestAnimationFrame = requestAnimationFrame;
(<any>window).dispatchEvent = (ev) => {
  window.kanvas.dispatchEvent(ev)
}

(<any>window).addEventListener = (n, cb) => kanvas.addEventListener.apply(kanvas, [n, cb]);
(<any>window).removeEventListener = (n, cb) => kanvas.removeEventListener.apply(kanvas, [n, cb]);
(<any>window).dispatchEvent = (e) => kanvas.dispatchEvent.apply(kanvas, [e]);

class Event {
  public type: string
  constructor(type: string, init: EventInit) {
    this.type = type;
  }
}

class CustomEvent<T = any> extends Event {
  public detail: T;
  constructor(type: string, init: CustomEventInit) {
    super(type, init)
    this.detail = init.detail
  }
}

(<any>window).Event = Event;
(<any>window).CustomEvent = CustomEvent;

class Response {
  constructor(public readonly path: string) { }
  arrayBuffer() {
    return Promise.resolve(fs.readFile(this.path));
  }
  text() {
    return Promise.resolve(fs.readText(this.path))
  }
}

function fetch(path: string) {
  return Promise.resolve(new Response(path))
}

(<any>window).fetch = fetch;
