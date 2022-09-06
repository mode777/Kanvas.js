import * as ink from 'inkjs/dist/ink'
import { Framework, EventHandler } from './framework'

export class InkApp {
    private fw: Framework
    private story: StoryRunner
    private renderer: StoryRenderer

    constructor(canvas: HTMLCanvasElement, inkJson: any){
        this.fw = new Framework(canvas);
        this.story = new StoryRunner(inkJson);
        this.renderer = new StoryRenderer(this.fw);
        this.init()
    }

    private init(){
        this.story.onChoices.subscribe(x => this.renderer.presentChoices(x))
        this.story.onStory.subscribe(x => this.renderer.enqueueText(x));
    }   

    runStory(){
        return this.story.run();
    }
}

interface Choice {
    index: number,
    text: string
}

class StoryRenderer {

    constructor(private fw: Framework){
        fw.renderer.onRender.subscribe((ctx) => this.render(ctx))
    }

    enqueueText(text: string){
        console.log(text);
    }

    presentChoices(choices: Choice[]){
        for (const choice of choices) {
            console.log(`${choice.index}: ${choice.text}`);
        }
    }

    render(ctx: CanvasRenderingContext2D){

    }
}

class StoryRunner{
    
    private story: any;
    private resolver: (number) => void;
    private choice = -1;
    
    public onChoices = new EventHandler<Choice[]>();
    public onStory = new EventHandler<string>();

    constructor(inkJson: any){
        this.story = new ink.Story(inkJson);    
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
            this.onStory.dispatch(this.story.Continue());
          }
          if (this.story.currentChoices.length > 0) {
            this.onChoices.dispatch(this.story.currentChoices)
            const choice = await this.waitForChoice()
            this.story.ChooseChoiceIndex(choice)
          } else {
            return;
          }
        }
    }
}

export class Element {
    constructor(public x: number, public y: number, public w: number, public h: number){

    }
}

export interface TextStyle {
    fontFace: string,
    fontSize: number,
    fontStyle: 'bold' | 'italic' | 'bold italic' | 'italic bold' | ''
    color: string,
    shadowBlur: number,
    shadowColor: string
    lineHeight: number
}
const defaultStyle: TextStyle = {
    fontFace: 'sans-serif',
    fontSize: 12,
    fontStyle: '',
    color: '#000',
    shadowBlur: 0,
    shadowColor: '#00000000',
    lineHeight: 12
}

export class TextElement extends Element {
    private lines: string[];
    private font: string;
    private style: TextStyle

    constructor(x: number, y: number, private text: string, width: number, style: Partial<TextStyle> = defaultStyle){
        super(x,y,width,0);
        this.style = { ...defaultStyle, ...style }
        this.style.lineHeight = style.lineHeight ?? this.style.fontSize
        this.font = `${this.style.fontStyle} ${this.style.fontSize}px ${this.style.fontFace}`
    }

    render(ctx: CanvasRenderingContext2D){        
        ctx.font =  this.font
        ctx.fillStyle = this.style.color
        ctx.shadowBlur = this.style.shadowBlur
        ctx.shadowColor = this.style.shadowColor
        
        if(this.h == 0){
            this.lines = this.getLines(ctx, this.text, this.w);
            this.h = this.lines.length * this.style.lineHeight
        }
        const x = this.x;
        let y = this.y;
        for (const line of this.lines) {
            ctx.fillText(line, x,y);
            y += this.style.lineHeight;
        }
    }

    // see: https://stackoverflow.com/a/16599668/4361832
    private getLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = words[0];
    
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
        return lines;
    }
}