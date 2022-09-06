import contents from './../ink/test2.ink';
import { InkApp, TextElement } from './ink-app';

const canvas = window["kanvas"] ?? <HTMLCanvasElement>document.getElementById("canvas")
var ctx = canvas.getContext('2d');

const dummy = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an "

const t = new TextElement(100,100,dummy,300,{
  fontFace: 'serif',
  fontSize: 16.5,
  lineHeight: 20,
  shadowBlur: 5,
  shadowColor: '#00000044',
  fontStyle: 'italic'
})

requestAnimationFrame((time) => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "#fff"
  ctx.fillRect(0,0,canvas.width,canvas.height);
  t.render(ctx);
  ctx.strokeRect(t.x,t.y,t.w,t.h)
})

// const ink = new InkApp(canvas, contents);

// ink.runStory().catch(x => console.log(x))