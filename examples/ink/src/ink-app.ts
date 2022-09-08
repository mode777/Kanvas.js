import * as ink from 'inkjs/dist/ink'
import { KvsFramework, EventHandler, Screen } from './framework'
import { NodeProperties, Node } from './scene-graph';

// export class InkApp {
//     private fw: KvsFramework
//     private story: StoryRunner
//     private renderer: StoryRenderer

//     constructor(canvas: HTMLCanvasElement, inkJson: any){
//         this.fw = new KvsFramework(canvas);
//         this.story = new StoryRunner(inkJson);
//         this.renderer = new StoryRenderer(this.fw);
//         this.init()
//     }

//     private init(){
//         this.story.onChoices.subscribe(x => this.renderer.presentChoices(x))
//         this.story.onStory.subscribe(x => this.renderer.enqueueText(x));
//     }   

//     runStory(){
//         return this.story.run();
//     }
// }

interface Choice {
    index: number,
    text: string
}

// class StoryRenderer {

//     constructor(private fw: KvsFramework){
//         fw.renderer.onRender.subscribe((ctx) => this.render(ctx))
//     }

//     enqueueText(text: string){
//         console.log(text);
//     }

//     presentChoices(choices: Choice[]){
//         for (const choice of choices) {
//             console.log(`${choice.index}: ${choice.text}`);
//         }
//     }

//     render(ctx: CanvasRenderingContext2D){

//     }
// }

interface InkProperties extends NodeProperties {
    json: object
}

export class InkStory extends Node {
    
    private story: any;
    private resolver: (number) => void;
    private choice = -1;

    constructor(id: string, parent: Node = null, props: Partial<InkProperties> = {}){
        super(id,parent,props);
        if(props.json) this.story = new ink.Story(props.json);    
    }

    continue(index: number){
        if(index < 0) return;
        if(!this.story.currentChoices) return;
        if(index >= this.story.currentChoices.length) return;
        this.choice = index;
        if(this.resolver) this.resolver(index);
    }

    private async waitForChoice(){
        let choice: number
        if(this.choice !== -1) {
            choice = this.choice;
        } else {
            choice = await new Promise<number>((res,rej) => {
                this.resolver = res;
            });
        }
        this.choice = -1;
        this.resolver = null
        return choice;
    }

    async run(){
        while (this.story.canContinue) {
          while (this.story.canContinue) {
            this.emit("story", this.story.Continue())
          }
          if (this.story.currentChoices.length > 0) {
            this.emit("choices", [this.story.currentChoices])
            const choice = await this.waitForChoice()
            this.story.ChooseChoiceIndex(choice)
          } else {
            return;
          }
        }
    }
}

interface Unit {
    pixels: number
    toSize(): Size;
}

class PixelUnit implements Unit {
    constructor(public pixels: number){}
    toSize() : Size { return `${this.pixels}px` }
}

class PercentUnit implements Unit {
    constructor(private value: number, private dir: 'v' | 'h'){}
    get pixels(): number { return this.dir == 'h' ? this.value * Screen.width * 0.01 : this.value * Screen.height * 0.01 }
    toSize(): Size { return `${this.value}%` }
}

class ProportionalUnit implements Unit {
    constructor(private value: number, private dir: 'vw' | 'vh'){}
    get pixels(): number { return this.dir == 'vw' ? this.value * Screen.width * 0.01 : this.value * Screen.height * 0.01 }
    toSize(): Size { return `${this.value}${this.dir}` }
}

type Size = number | `${number}%` | `${number}vw` | `${number}vh` | `${number}px`

function parseUnit(size: Size, dir: 'v' | 'h' = 'h'){
    if(typeof(size) === 'number'){
        return new PixelUnit(size);
    } else {
        if(size.endsWith('px')) return new PixelUnit(parseFloat(size));
        if(size.endsWith('%')) return new PercentUnit(parseFloat(size), dir);
        if(size.endsWith('vw')) return new ProportionalUnit(parseFloat(size), 'vw');
        if(size.endsWith('vh')) return new ProportionalUnit(parseFloat(size), 'vh');
    }
    throw new Error('Cannot parse unit ' + size);
}

export interface ControlProperties extends NodeProperties {
    x: Size,
    y: Size,
    w: Size,
    h: Size
}
const defaultElProp = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
}

export class Control extends Node implements ControlProperties {

    protected xUnit: Unit;
    public get x(): Size { return this.xUnit.toSize(); }
    public set x(value: Size) { this.xUnit = parseUnit(value, 'h'); }
    protected yUnit: Unit;
    public get y(): Size { return this.yUnit.toSize(); }
    public set y(value: Size) { this.yUnit = parseUnit(value, 'v'); }
    protected wUnit: Unit;
    public get w(): Size { return this.wUnit.toSize(); }
    public set w(value: Size) { this.wUnit = parseUnit(value, 'h');}
    protected hUnit: Unit;
    public get h(): Size { return this.hUnit.toSize(); }
    public set h(value: Size) { this.hUnit = parseUnit(value, 'v');}

    constructor(id: string, parent: Node = null, props: Partial<ControlProperties> = defaultElProp){
        super(id, parent, { ...defaultElProp, ...props});
    }
}

export interface PanelProperties extends ControlProperties {
    color: string
}

export class Panel extends Control implements PanelProperties {

    color: string;

    constructor(id: string, parent: Node = null, props: Partial<PanelProperties> = { color: '#fff' }){
        super(id, parent, props);
    }

    draw(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = this.color
        ctx.fillRect(this.xUnit.pixels,this.yUnit.pixels,this.wUnit.pixels,this.hUnit.pixels)
    }
}

export interface TextStyle extends ControlProperties {
    text: string,
    fontFace: string,
    fontSize: Size,
    fontStyle: 'bold' | 'italic' | 'bold italic' | 'italic bold' | ''
    color: string,
    shadowBlur: number,
    shadowColor: string
    lineHeight: Size,
    align: 'left' | 'center' | 'right' 
}
const defaultStyle: Partial<TextStyle> = {
    text: '',
    fontFace: 'sans-serif',
    fontSize: 12,
    fontStyle: '',
    color: '#000',
    shadowBlur: 0,
    shadowColor: '#00000000',
    lineHeight: 0,
    align: 'left'
}
export class TextElement extends Control implements TextStyle {
    private lines: Line[];
    private font: string;
    fontFace: string;
    private fontSizeUnit: Unit;
    public get fontSize(): Size {return this.fontSizeUnit.toSize();}
    public set fontSize(value: Size) {this.fontSizeUnit = parseUnit(value, 'v');}
    fontStyle: '' | 'bold' | 'italic' | 'bold italic' | 'italic bold';
    color: string;
    shadowBlur: number;
    shadowColor: string;
    private lineHeightUnit: Unit;
    public get lineHeight(): Size { return this.lineHeightUnit.toSize();}
    public set lineHeight(value: Size) {this.lineHeightUnit = parseUnit(value,'v');}
    align: 'left' | 'center' | 'right';
    private _changed = true
    private _text: string;
    public get text(): string {
        return this._text;
    }
    public set text(value: string) {
        this._changed = true
        this._text = value;
    }
    constructor(id: string, parent: Node, props: Partial<TextStyle> = defaultStyle){
        super(id, parent, { ...defaultStyle, ...props });
        this.lineHeight = this.lineHeightUnit.pixels === 0 ? this.fontSize : this.lineHeight
        this.font = `${this.fontStyle} ${this.fontSizeUnit.pixels}px ${this.fontFace}`
    }

    draw(ctx: CanvasRenderingContext2D){        
        ctx.font =  this.font
        ctx.fillStyle = this.color
        ctx.shadowBlur = this.shadowBlur
        ctx.shadowColor = this.shadowColor
        ctx.textBaseline = 'top'
        
        if(this._changed){
            this.lines = this.getLines(ctx, this.text, this.wUnit.pixels);
            this.h = this.lines.length * this.lineHeightUnit.pixels
            this._changed = false
        }
        const x = this.xUnit.pixels;
        let y = this.yUnit.pixels;
        for (const line of this.lines) {
            const offset = this.align === 'left' 
                ? 0 : (this.align === 'center' ? (this.wUnit.pixels - line.width)/2 : this.wUnit.pixels - line.width) 
            ctx.fillText(line.text, x+offset,y);
            y += this.lineHeightUnit.pixels;
        }
        //ctx.beginPath()
        //ctx.strokeRect(this.x, this.y, this.w, this.h)
    }

    // see: https://stackoverflow.com/a/16599668/4361832
    private getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
        const words = text.split(" ");
        const lines: Line[] = [];
        let currentLine = words[0];

        let lastw = 0;
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push({ text:currentLine, width:lastw });
                currentLine = word;
                //lastw = width;
            }
            lastw = width;
            if(i === words.length -1) lastw = ctx.measureText(currentLine).width;
        }
        lines.push({ text:currentLine, width:lastw });
        return lines;
    }
}

interface Line {
    text: string,
    width: number
}