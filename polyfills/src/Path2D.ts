class SvgCommand {
  constructor(public readonly name: string, public readonly args: any[]) { }
}

export class Path2D {

  public readonly commands: SvgCommand[] = [];

  constructor(path?: Path2D | string) {
    this.pushCommand("beginPath", []);
    if(typeof(path) == "string"){
      this.parse(path)
    }
  }

  private pushCommand(name, args) {
    this.commands.push(new SvgCommand(name, args));
  }

  addPath(path: Path2D, transform?: DOMMatrix2DInit) {
    if (this.commands.length > 0 && this.commands[this.commands.length - 1].name !== "closePath") {
      this.pushCommand("closePath", []);
    }
    this.pushCommand("beginPath", []);
    throw new Error('Method not implemented.');
  }
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.pushCommand("arc", [x, y, radius, startAngle, endAngle, counterclockwise]);
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.pushCommand("arcTo", [x1, y1, x2, y2, radius]);
  }
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.pushCommand("bezierCurve", [cp1x, cp1y, cp2x, cp2y, x, , y]);
  }
  closePath(): void {
    this.pushCommand("closePath", []);
  }
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void {
    this.pushCommand("ellipse", [x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise]);
  }
  lineTo(x: number, y: number): void {
    this.pushCommand("lineTo", [x, y]);
  }
  moveTo(x: number, y: number): void {
    this.pushCommand("moveTo", [x, y]);
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.pushCommand("quadraticCurveTo", [cpx, cpy, x, y]);
  }
  rect(x: number, y: number, w: number, h: number): void {
    this.pushCommand("rect", [x, y, w, h]);
  }


  private parse(path: string) {
    type Vector2 = [number, number];
    let numBuffer = "";
    let currentPoint: Vector2 = [0, 0];
    let currentCommand = "";
    let prevCommand = "";
    let coordinates: number[] = [];
    let control1: Vector2 = [0, 0];
    let control2: Vector2 = [0, 0];

    const flushNum = () => {
      if (numBuffer.length == 0)
        return;

      coordinates.push(parseFloat(numBuffer));
      numBuffer = "";
    };

    const projectPoint = (control: Vector2, anchor: Vector2): Vector2 => {
      return [anchor[0] + (anchor[0] - control[0]), anchor[1] + (anchor[1] - control[1])];
    };

    const flushCommand = () => {
      switch (currentCommand) {
        case 'M':
          currentPoint = [coordinates.shift(), coordinates.shift()];
          this.pushCommand("moveTo", currentPoint);
          currentCommand = 'L';
          break;
        case 'm':
          currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
          this.pushCommand("moveTo", currentPoint);
          currentCommand = 'l';
          break;
        case 'L':
          currentPoint = [coordinates.shift(), coordinates.shift()];
          this.pushCommand("lineTo", currentPoint);
          break;
        case 'l':
          currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
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
          currentPoint = [currentPoint[0], coordinates.shift()];
          this.pushCommand("lineTo", currentPoint);
          break;
        case 'v':
          currentPoint = [currentPoint[0], currentPoint[1] + coordinates.shift()];
          this.pushCommand("lineTo", currentPoint);
          break;
        case 'C':
          control1 = [coordinates.shift(), coordinates.shift()];
          control2 = [coordinates.shift(), coordinates.shift()];
          currentPoint = [coordinates.shift(), coordinates.shift()];
          this.pushCommand("bezierCurveTo", [...control1, ...control2, ...currentPoint]);
          break;
        case 'c':
          control1 = [control1[0] + coordinates.shift(), control1[1] + coordinates.shift()];
          control2 = [control2[0] + coordinates.shift(), control2[1] + coordinates.shift()];
          currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
          this.pushCommand("bezierCurveTo", [...control1, ...control2, ...currentPoint]);
          break;
        case 'S':
          control1 = prevCommand == 's' || prevCommand == 'S' ? projectPoint(control2, currentPoint) : [...currentPoint];
          control2 = [coordinates.shift(), coordinates.shift()];
          currentPoint = [coordinates.shift(), coordinates.shift()];
          this.pushCommand("bezierCurveTo", [...control1, ...control2, ...currentPoint]);
          break;
        case 's':
          control1 = prevCommand == 's' || prevCommand == 'S' ? projectPoint(control2, currentPoint) : [...currentPoint];
          control2 = [control2[0] + coordinates.shift(), control2[1] + coordinates.shift()];
          currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
          this.pushCommand("bezierCurveTo", [...control1, ...control2, ...currentPoint]);
          break;
        case 'Q':
          control1 = [coordinates.shift(), coordinates.shift()];
          currentPoint = [coordinates.shift(), coordinates.shift()];
          this.pushCommand("quadraticCurveTo", [...control1, ...currentPoint]);
          break;
        case 'q':
          control1 = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
          currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
          this.pushCommand("quadraticCurveTo", [...control1, ...currentPoint]);
          break;
        case 'T':
          control1 = prevCommand == 't' || prevCommand == 'T' ? projectPoint(control1, currentPoint) : [...currentPoint];
          currentPoint = [coordinates.shift(), coordinates.shift()];
          this.pushCommand("quadraticCurveTo", [...control1, ...currentPoint]);
          break;
        case 't':
          control1 = prevCommand == 't' || prevCommand == 'T' ? projectPoint(control1, currentPoint) : [...currentPoint];
          currentPoint = [currentPoint[0] + coordinates.shift(), currentPoint[1] + coordinates.shift()];
          this.pushCommand("quadraticCurveTo", [...control1, ...currentPoint]);
          break;
        case 'A':
        case 'a':
          throw new Error('Method not implemented.');
        case 'Z':
        case 'z':
          this.pushCommand("closePath", []);
          break;
        default:
          return;
      }
      if (coordinates.length > 0) {
        flushCommand();
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
}
