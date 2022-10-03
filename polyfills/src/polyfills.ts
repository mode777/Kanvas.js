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
import { Path2D } from './Path2D';

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
    console.log(`Context requested for ${id}`)
    if(id === '2d'){
      kanvas_set_mode('2d')
      return new CanvasRenderingContext2D()
    } else if(id == 'webgl'){
      kanvas_set_mode('webgl')
      const ctx = new WebGLRenderingContext();
      (<any>ctx).canvas = kanvas
      return ctx;
    }
    return null;
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

let currentTime = 0
interface Timeout {
  fn: () => void
  time: number
  id: number
}

const timeouts: Timeout[] = [];
let toid = 0
const animationFrames = [];

function setTimeout(fn,time) {
  console.log(fn,time)
  const to = {fn,time: time+currentTime,id:toid++}
  timeouts.push(to)
  return toid
}

function requestAnimationFrame(fn) {
  animationFrames.push(fn)
}

window["onrender"] = function (time) {
  currentTime = time
  const length = animationFrames.length;
  for (let i = 0; i < length; i++) {
    const frame = animationFrames.shift();
    frame(time)
  }
  const tolen = timeouts.length;
  for (let i = tolen-1; i >= 0; i--) {
    const to = timeouts[i]
    if(to.time >= time){
      timeouts.splice(i,1);
      to.fn()
    }    
  }
};

(<any>window).kanvas = new Kanvas();
(<any>window).requestAnimationFrame = requestAnimationFrame;
(<any>window).setTimeout = setTimeout;

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

class Blob {
  constructor(private readonly buffer: ArrayBuffer){

  }
  get size() { return this.buffer.byteLength } 
  get type() { return '' }
  arrayBuffer() {
    return Promise.resolve(this.buffer);
  }
  slice(start?: number, end?: number, contentType?: string): Blob {
    throw new Error("Blob.slice not implemented")
  }
  stream() {
    throw new Error("Blob.stream not implemented")
  }
  text() {
    throw new Error("Blob.text not implemented")
  }
}

(<any>window).Blob = Blob;

class Response {
  constructor(public readonly path: string) { }
  arrayBuffer() {
    return Promise.resolve(fs.readFile(this.path));
  }
  text() {
    return Promise.resolve(fs.readText(this.path))
  }
  blob() {
    return Promise.resolve(new Blob(fs.readFile(this.path)))
  }
  json() {
    return Promise.resolve(JSON.parse(fs.readText(this.path)))
  }
}

class ImageBitmap {
  private readonly size: any
  constructor(public readonly img: any){
    this.size = vg.imageSize(img)
  }
  get width() { return this.size.width }
  get height() { return this.size.height }
}

async function createImageBitmap(blob: Blob){
  const arr = await blob.arrayBuffer();
  const img = vg.createImage(arr,0);
  return new ImageBitmap(img);
}
(<any>window).createImageBitmap = createImageBitmap;

function fetch(path: string) {
  return Promise.resolve(new Response(path))
}

(<any>window).fetch = fetch;
(<any>window).Path2D = Path2D;

class RadialGradient {
  apply(){
    
  }
}

class Storage {

  private data: {[key:string]:any} = {}
  private get filename() { return window.kanvas_config.file + ".storage" }

  private persist(){
    const d = this.data[this.filename]
    const json = JSON.stringify(d);
    fs.writeText(this.filename, json)
  }

  private load(){
    if(!this.data[this.filename]){
      fs.createFile(this.filename)
      const t = fs.readText(this.filename)
      this.data[this.filename] = t === '' ? {} : JSON.parse(t)
    }
  }

  setItem(key:string, value: string){
    this.load()
    this.data[this.filename][key] = value 
    this.persist()
  }
  getItem(key:string){
    this.load();
    return this.data[this.filename][key]
  }
  removeItem(key:string){
    this.load()
    delete this.data[this.filename][key]
    this.persist()
  }
  clear(){
    this.load()
    this.data[this.filename] = {}
    this.persist()
  }
}

(<any>window).localStorage = new Storage();

interface AudioSource {
  setRepeat(value: boolean)
  getRepeat(): boolean
  getVolume(): number
  setVolume(value: number)
  load(path: string)
  play() 
  isPlaying(): boolean
}

abstract class WavBase implements AudioSource {
  public _ptr: any;
  protected _playHandle: number = -1
  protected _repeat: boolean;
  public getRepeat(): boolean {
    return this._repeat;
  }
  public setRepeat(value: boolean) {
    this._repeat = value;
  }
  protected _volume: number;
  public getVolume(): number {
    return this._volume;
  }
  public setVolume(value: number) {
    this._volume = value;
  }
  abstract load(path: string);
  play() {    
    this._playHandle = soloud.play(this._ptr)
  }
  isPlaying(){
    if(this._playHandle === -1) return false;
    return soloud.isPlaying(this._playHandle)
  }
}

class Wav extends WavBase {
  constructor(){
    super()
    this._ptr = soloud.wav_create()
  }
  public setRepeat(value: boolean) {
    soloud.wav_repeat(this._ptr, value)
    super.setRepeat(value);
  }
  public setVolume(value: number) {
    soloud.wav_volume(this._ptr, value)
    super.setVolume(value);
  }
  load(path: string) {
    soloud.wav_load(this._ptr, path)
  }
}
Duktape.fin(Wav.prototype, function(x: Wav){
  soloud.wav_destroy(x._ptr)
})

class WavStream extends WavBase {
  constructor(){
    super()
    this._ptr = soloud.wavstream_create()
  }
  public setRepeat(value: boolean) {
    soloud.wavstream_repeat(this._ptr, value)
    super.setRepeat(value);
  }
  public setVolume(value: number) {
    soloud.wavstream_volume(this._ptr, value)
    super.setVolume(value);
  }
  load(path: string) {
    soloud.wavstream_load(this._ptr, path)
  }
}
Duktape.fin(WavStream.prototype, function(x: Wav){
  soloud.wavstream_destroy(x._ptr)
})

class Audio {
  private _source: AudioSource
  private _repeat: boolean;
  public get repeat(): boolean {
    return this._repeat;
  }
  public set repeat(value: boolean) {
    this._repeat = value;
  }
  private _src: string;
  public get src(): string {
    return this._src;
  }
  public set src(value: string) {
    this._src = value;
  }
  private _preload: string;
  public get preload(): string {
    return this._preload;
  }
  public set preload(value: string) {
    this._preload = value;
  }
  constructor(filename?: string){
    this.src = filename
  }

  play(){
    if(!this._source){
      if(!this._src) return
      this._source = this.preload !== 'auto' ? new WavStream() : new Wav()
      this._source.load(this._src)
    }
    //if(this._playHandle !== null) console.log(soloud.isPlaying(this._playHandle))
    //this._playHandle = this._source.play()
    if(!this._source.isPlaying()) this._source.play()
    //console.log(this._playHandle)
  }
}

(<any>window).Audio = Audio;

let wasCanvasCreated = false;
(<any>window).document = {
  addEventListener: (name,cb) => {
    kanvas.addEventListener.apply(kanvas, [name, cb]);
  },
  createElement: (name,options) => {
    console.log(`Create element ${name}`)
    switch(name){
      case 'canvas':
        return kanvas
        if(wasCanvasCreated) throw new Error("Kanvas can only create one canvas");
        else {
          wasCanvasCreated = true
          return kanvas
        }
      case 'div':
        return {
          style: {},
          addEventListener: (name) => console.log(`Add listener to ${name}`)
        }
      default:
        throw new Error(`Kanvas cannot create element "${name}"`)
    }
  }
};

(<any>window).WebGLRenderingContext = WebGLRenderingContext;
(<any>window).CanvasRenderingContext2D = CanvasRenderingContext2D;
(<any>window).navigator = {};