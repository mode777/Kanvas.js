import compiledStory from './../ink/test2.ink';
import { KvsInit, Mouse, onRender, Time } from './framework'
import { Node } from './scene-graph'
import { InkStory, Panel, TextElement } from './ink-app'

const canvas = window['kanvas'] ?? <HTMLCanvasElement>document.getElementById('canvas')

KvsInit(canvas);

class Game extends Node {
  
  text: TextElement;
  paragraphs: string[] = []

  init(){
    const ink = this.getNode<InkStory>('ink')
    ink.connect('story', this, this.onStory);

    this.text = this.getNode<TextElement>('text')
  
    ink.run().catch(e => console.log(e.stack))
    this.run().catch(e => console.log(e.stack))
  }
  onStory(str){
    this.paragraphs.push(str)
  }

  async run(){
      while(true){
        await Time.waitFor(() => this.paragraphs.length > 0)
        this.text.text = this.paragraphs.shift();
        await Mouse.waitClick();
      }
  }
}

const root = new Game('root');
const ink = new InkStory('ink', root, { json: compiledStory });
const bg = new Panel('panel', root, { color: '#fff', w: '100%', h: '100%' });
const text = new TextElement('text', root, {
  x: '10%',
  y: '10%',
  w: '80%',
  fontSize: '5%',
  fontFace: 'serif',
  fontStyle: 'italic',
  align: 'center',
  color: '#000'
});

root.iterate(x => x['init']?.call(x));
onRender(ctx => root.iterate(x => x['draw']?.call(x, ctx)));

//onRender(_ => console.log(canvas.width, canvas.height))