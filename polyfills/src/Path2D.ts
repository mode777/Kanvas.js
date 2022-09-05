class CommandBuffer {
  private buffer = new ArrayBuffer(16*4)
  private commands = new Uint32Array(this.buffer)
  private coordinates = new Float32Array(this.buffer)
  private index = 0

  pushCommand(op: number, ...args: number[]){
    this.pushOp(op)
    this.pushArgs(args)
  }

  private pushOp(op: number){
    if(this.index === this.commands.length) this.resize();
    this.commands[this.index] = op;
    this.index++;
  }
  
  private pushArgs(arr: number[]){
    if(arr.length === 0) return;
    if((this.index+arr.length) > this.coordinates.length) this.resize();
    this.coordinates.set(arr, this.index);
    this.index += arr.length;
  }

  private resize(){
    this.buffer = new ArrayBuffer(this.commands.length*2*4)
    const ncommands = new Uint32Array(this.buffer)
    ncommands.set(this.commands)
    this.commands = ncommands
    this.coordinates = new Float32Array(this.buffer);
  }

  public apply(){
    vg.applyPath(this.buffer);
  }
}

class SvgCommand {
  constructor(public readonly name: string, public readonly args: any[]) { }
  toString() {
    return `${this.name}:${this.args.join(', ')}`
  }
}

enum CommandOp {
  noCommand = 0,
  beginPath,
  arc,
  arcTo,
  bezierCurveTo,
  closePath,
  ellipse,
  lineTo,
  moveTo,
  quadraticCurveTo,
  rect
}

export class Path2D {

  //public readonly commands: SvgCommand[] = [];
  public readonly buffer: CommandBuffer;

  constructor(path?: Path2D | string) {
    this.buffer = new CommandBuffer()
    this.buffer.pushCommand(CommandOp.beginPath);
    if (typeof (path) == "string") {
      this.parse(path)
    }
  }

  addPath(path: Path2D, transform?: DOMMatrix2DInit) {
    // if (this.commands.length > 0 && this.commands[this.commands.length - 1].name !== "closePath") {
    //   this.buffer.pushCommand(CommandOp.closePath);
    // }
    // this.buffer.pushCommand(CommandOp.beginPath);
    throw new Error('Method not implemented.');
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.buffer.pushCommand(CommandOp.arc, x, y, radius, startAngle, endAngle, counterclockwise ? vg.CCW : vg.CW);
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.buffer.pushCommand(CommandOp.arcTo, x1, y1, x2, y2, radius);
  }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.buffer.pushCommand(CommandOp.bezierCurveTo, cp1x, cp1y, cp2x, cp2y, x, y);
  }
  closePath(): void {
    this.buffer.pushCommand(CommandOp.closePath);
  }
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.buffer.pushCommand(CommandOp.ellipse, x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise ? vg.CCW : vg.CW);
  }
  lineTo(x: number, y: number): void {
    this.buffer.pushCommand(CommandOp.lineTo, x, y);
  }
  moveTo(x: number, y: number): void {
    this.buffer.pushCommand(CommandOp.moveTo, x, y);
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.buffer.pushCommand(CommandOp.quadraticCurveTo, cpx, cpy, x, y);
  }
  rect(x: number, y: number, w: number, h: number): void {
    this.buffer.pushCommand(CommandOp.rect, x, y, w, h);
  }


  private parse(path: string) {
    type Vector2 = [number, number];
    let numBuffer = "";
    let lastPoint: Vector2 = [0, 0];
    let currentPoint: Vector2 = [0, 0];
    let currentCommand = "";
    let prevCommand = "";
    //let isFollow = false;
    const coordinates: number[] = [];
    let control1: Vector2 = [0, 0];
    let control2: Vector2 = [0, 0];

    const flushNum = () => {
      if (numBuffer.length == 0) {
        return;
      }
      const f = parseFloat(numBuffer);
      if(isNaN(f)){
        throw new Error("Cannot parse " + numBuffer)
      }
      coordinates.push(f);
      numBuffer = "";
    };

    const projectPoint = (control: Vector2, anchor: Vector2): Vector2 => {
      return [anchor[0] + (anchor[0] - control[0]), anchor[1] + (anchor[1] - control[1])];
    };

    const flushCommand = () => {
      switch (currentCommand) {
        case 'M':
          lastPoint = [coordinates.shift(), coordinates.shift()];
          this.buffer.pushCommand(CommandOp.moveTo, ...lastPoint);
          currentCommand = 'L';
          break;
        case 'm':
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          //console.log(`m ${lastPoint[0]},${lastPoint[1]}`);
          if(prevCommand === '') currentPoint = [...lastPoint]
          this.buffer.pushCommand(CommandOp.moveTo, ...lastPoint);
          currentCommand = 'l';
          break;
        case 'L':
          lastPoint = [coordinates.shift(), coordinates.shift()];
          this.buffer.pushCommand(CommandOp.lineTo, ...lastPoint);
          break;
        case 'l':
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          this.buffer.pushCommand(CommandOp.lineTo, ...lastPoint);
          break;
        case 'H':
          lastPoint = [coordinates.shift(), lastPoint[1]];
          this.buffer.pushCommand(CommandOp.lineTo, ...lastPoint);
          break;
        case 'h':
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1]];
          this.buffer.pushCommand(CommandOp.lineTo, ...lastPoint);
          break;
        case 'V':
          lastPoint = [lastPoint[0], coordinates.shift()];
          this.buffer.pushCommand(CommandOp.lineTo, ...lastPoint);
          break;
        case 'v':
          lastPoint = [lastPoint[0], lastPoint[1] + coordinates.shift()];
          this.buffer.pushCommand(CommandOp.lineTo, ...lastPoint);
          break;
        case 'C':
          control1 = [coordinates.shift(), coordinates.shift()];
          control2 = [coordinates.shift(), coordinates.shift()];
          lastPoint = [coordinates.shift(), coordinates.shift()];
          //console.log("C ", " c1 ", ...control1, " c2 ", ...control2, " p ", ...lastPoint)
          this.buffer.pushCommand(CommandOp.bezierCurveTo, ...control1, ...control2, ...lastPoint);
          break;
        case 'c':
          control1 = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          control2 = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          //console.log("c ", " c1 ", ...control1, " c2 ", ...control2, " p ", ...lastPoint)
          this.buffer.pushCommand(CommandOp.bezierCurveTo, ...control1, ...control2, ...lastPoint);
          break;
        case 'S':
          control1 = prevCommand == 's' || prevCommand == 'S' ? projectPoint(control2, lastPoint) : [...lastPoint];
          control2 = [coordinates.shift(), coordinates.shift()];
          lastPoint = [coordinates.shift(), coordinates.shift()];
          this.buffer.pushCommand(CommandOp.bezierCurveTo, ...control1, ...control2, ...lastPoint);
          break;
        case 's':
          control1 = prevCommand == 's' || prevCommand == 'S' ? projectPoint(control2, lastPoint) : [...lastPoint];
          control2 = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          this.buffer.pushCommand(CommandOp.bezierCurveTo, ...control1, ...control2, ...lastPoint);
          break;
        case 'Q':
          control1 = [coordinates.shift(), coordinates.shift()];
          lastPoint = [coordinates.shift(), coordinates.shift()];
          this.buffer.pushCommand(CommandOp.quadraticCurveTo, ...control1, ...lastPoint);
          break;
        case 'q':
          control1 = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          this.buffer.pushCommand(CommandOp.quadraticCurveTo, ...control1, ...lastPoint);
          break;
        case 'T':
          control1 = prevCommand == 't' || prevCommand == 'T' ? projectPoint(control1, lastPoint) : [...lastPoint];
          lastPoint = [coordinates.shift(), coordinates.shift()];
          this.buffer.pushCommand(CommandOp.quadraticCurveTo, ...control1, ...lastPoint);
          break;
        case 't':
          control1 = prevCommand == 't' || prevCommand == 'T' ? projectPoint(control1, lastPoint) : [...lastPoint];
          lastPoint = [lastPoint[0] + coordinates.shift(), lastPoint[1] + coordinates.shift()];
          this.buffer.pushCommand(CommandOp.quadraticCurveTo, ...control1, ...lastPoint);
          break;
        case 'A':
        case 'a':
          throw new Error('Method not implemented.');
        case 'Z':
        case 'z':
          numBuffer = ""
          //isFollow = false
          this.buffer.pushCommand(CommandOp.closePath);
          return;
        default:
          return;
      }
      if (coordinates.length > 0) {
        //isFollow = true
        flushCommand();
      } else {
        currentPoint = [...lastPoint]
        //isFollow = false
      }
    };

    for (const c of path) {
      switch (c) {
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
        case ' ':
          flushNum();
          break;
        case '-':
          flushNum();
          numBuffer += c;
          break;
        default:
          numBuffer += c;
          break;
      }
    }
    flushNum();
    flushCommand();
  }

  apply(){
    this.buffer.apply()
  }
  // toString() {
  //   return this.commands.join("\n");
  // }
}
