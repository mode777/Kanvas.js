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
  private readonly listeners: {[key: string]: any[] } = {};
  public readonly width = (<any>window).kanvas_width;
  public readonly height = (<any>window).kanvas_height;

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
  removeEventListener(name,fn){
    this.ensureListener(name)
    const idx = this.listeners[name].findIndex((v) => v == fn)
    this.listeners[name].splice(idx, 1)
  }
  dispatchEvent(event: Event){
    this.ensureListener(event.type)
    //console.log(event.type, this.listeners[event.type].length)
    const listeners = this.listeners[event.type]
    if(listeners.length > 0){
      const copy = [...listeners]
      //let i = 1
      for (const listener of copy) {
        //console.log("dispatch " + i++)
        listener.apply(this, [event])
      }
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

(<any>window).addEventListener = (n,cb) => kanvas.addEventListener.apply(kanvas, [n,cb]);
(<any>window).removeEventListener = (n,cb) => kanvas.removeEventListener.apply(kanvas, [n,cb]);
(<any>window).dispatchEvent = (e) => kanvas.dispatchEvent.apply(kanvas, [e]);

class Event {
  public type: string
  constructor(type: string, init: EventInit){
    this.type = type;
  }
}

class CustomEvent<T = any> extends Event {
  public detail: T;
  constructor(type: string, init: CustomEventInit){
    super(type, init)
    this.detail = init.detail
  }
}

(<any>window).Event = Event;
(<any>window).CustomEvent = CustomEvent;

class Response {
  constructor(public readonly path: string){}
  arrayBuffer(){
    return Promise.resolve(fs.readFile(this.path));
  }
  text(){
    return Promise.resolve(fs.readText(this.path))
  }
}

function fetch(path: string){
  return Promise.resolve(new Response(path))
}

(<any>window).fetch = fetch;

class Path2D {

  private readonly commands: SvgCommand[] = []

  constructor(path?: Path2D | string){

  }

  private pushCommand(name, args){
    this.commands.push(new SvgCommand(name, args))
  }

  addPath(path: Path2D, transform?: DOMMatrix2DInit){
    throw new Error('Method not implemented.');
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.pushCommand("arc", [x,y,radius,startAngle,endAngle,counterclockwise])
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.pushCommand("arcTo",[x1,y1,x2,y2,radius])
  }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  closePath(): void {
    throw new Error('Method not implemented.');
  }
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    throw new Error('Method not implemented.');
  }
  lineTo(x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  moveTo(x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    throw new Error('Method not implemented.');
  }
  rect(x: number, y: number, w: number, h: number): void {
    throw new Error('Method not implemented.');
  }


  private parse(){
    type Vector2 = [number,number]
    let numBuffer = "";
    let currentPoint: Vector2 = [0,0];
    let currentCommand = "";
    let prevCommand = "";
    let coordinates: number[] = [];
    let control1: Vector2 = [0,0];
    let control2: Vector2 = [0,0];

    const flushNum = () => 
    {
        if (numBuffer.length == 0) return;
        
        coordinates.push(parseFloat(numBuffer));
        numBuffer = ""
    }

    const projectPoint = (control: Vector2, anchor: Vector2): Vector2 => {
        return [anchor[0] + (anchor[0] - control[0]),anchor[1] + (anchor[1] - control[1])];
    }

    const flushCommand = () =>
    {
        switch (currentCommand)
        {
            case 'M':
                currentPoint = [coordinates.shift(), coordinates.shift()];
                this.pushCommand("moveTo",currentPoint)
                currentCommand = 'L';
                break;
            case 'm':
                currentPoint = [currentPoint[0] + coordinates.shift(),currentPoint[1] + coordinates.shift()];
                this.pushCommand("moveTo",currentPoint)
                currentCommand = 'l';
                break;
            case 'L':
                currentPoint = [coordinates.shift(), coordinates.shift()];
                this.pushCommand("lineTo", currentPoint);
                break;
                case 'l':
                currentPoint = [currentPoint[0] + coordinates.shift(),currentPoint[1] + coordinates.shift());
                this.pushCommand("lineTo", currentPoint);
                break;
            case 'H':
                currentPoint = [coordinates.shift(), currentPoint[1]];
                this.pushCommand("lineTo", currentPoint);
                break;
            case 'h':
                currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1]];
                this.pushCommand("lineTo", currentPoint);
                break;
            case 'V':
                currentPoint.Y = coordinates.shift();
                commands.Add(new LineTo(currentPoint));
                break;
            case 'v':
                currentPoint.Y += coordinates.shift();
                commands.Add(new LineTo(currentPoint));
                break;
            case 'C':
                control1 = [coordinates.shift(), coordinates.shift());
                control2 = [coordinates.shift(), coordinates.shift());
                currentPoint = [coordinates.shift(), coordinates.shift());
                commands.Add(new CubicTo(control1, control2, currentPoint));
                break;
            case 'c':
                control1 = currentPoint + [coordinates.shift(), coordinates.shift());
                control2 = currentPoint + [coordinates.shift(), coordinates.shift());
                currentPoint += [coordinates.shift(), coordinates.shift());
                commands.Add(new CubicTo(control1, control2, currentPoint));
                break;
            case 'S':
                control1 = prevCommand == 's' || prevCommand == 'S' ? projectPoint(control2, currentPoint) : currentPoint;
                control2 = [coordinates.shift(), coordinates.shift());
                currentPoint = [coordinates.shift(), coordinates.shift());
                commands.Add(new CubicTo(control1, control2, currentPoint));
                break;
            case 's':
                control1 = prevCommand == 's' || prevCommand == 'S' ? projectPoint(control2, currentPoint) : currentPoint;
                control2 = currentPoint + [coordinates.shift(), coordinates.shift());
                currentPoint += [coordinates.shift(), coordinates.shift());
                commands.Add(new CubicTo(control1, control2, currentPoint));
                break;
            case 'Q':
                control1 = [coordinates.shift(), coordinates.shift());
                currentPoint = [coordinates.shift(), coordinates.shift());
                commands.Add(new QuadTo(control1, currentPoint));
                break;
            case 'q':
                control1 = currentPoint + [coordinates.shift(), coordinates.shift());
                currentPoint += [coordinates.shift(), coordinates.shift());
                commands.Add(new QuadTo(control1, currentPoint));
                break;
            case 'T':
                control1 = prevCommand == 't' || prevCommand == 'T' ? projectPoint(control1, currentPoint) : currentPoint;
                currentPoint = [coordinates.shift(), coordinates.shift());
                commands.Add(new QuadTo(control1, currentPoint));
                break;
            case 't':
                control1 = prevCommand == 't' || prevCommand == 'T' ? projectPoint(control1, currentPoint) : currentPoint;
                currentPoint += [coordinates.shift(), coordinates.shift());
                commands.Add(new QuadTo(control1, currentPoint));
                break;
            case 'A':
            case 'a':
                throw new NotImplementedException();
            case 'Z':
            case 'z':
                commands.Add(new ClosePath());
                break;
            default:
                return;
        }
        if (coordinates.length > 0)
        {
            flushCommand();
        }
    }

    foreach (var c in path)
    {
        switch (c)
        {
            case 'M':
            case 'm':
            case 'L':
            case 'l':
            case 'H':
            case 'h':
            case 'V':
            case 'v':
            case 'C':
            case 'c':
            case 'S':
            case 's':
            case 'Q':
            case 'q':
            case 'T':
            case 't':
            case 'A':
            case 'a':
            case 'Z':
            case 'z':
                flushNum();
                flushCommand();
                prevCommand = currentCommand;
                currentCommand = c;
                break;
            case ',':
                flushNum();
                break;
            case '-':
                flushNum();
                numBuffer.Append(c);
                break;
            default:
                numBuffer.Append(c);
                break;
        }
    }
    flushNum();
    flushCommand();
  }
}

class SvgCommand {
  constructor(private readonly name: string, private readonly args: any[]){}
}