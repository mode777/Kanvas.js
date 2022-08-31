import * as ink from 'inkjs/dist/ink-full'
import contents from './../ink/example.ink';
import intercept from './../ink/intercept.ink';

var story = new ink.Story(intercept);

while(story.canContinue){
    while (story.canContinue) {
        console.log(story.Continue());
    }
    if( story.currentChoices.length > 0 )
    {
        for (var i = 0; i < story.currentChoices.length; i++) {
            var choice = story.currentChoices[i];
            console.log("Choice " + (i + 1) + ". " + choice.text);
        }
        story.ChooseChoiceIndex(0);
    }
}

const canvas = window["kanvas"] ?? <HTMLCanvasElement>document.getElementById("canvas")

class Mouse {
  constructor(canvas: HTMLCanvasElement){
    canvas.addEventListener("mousemove", (ev) => { this.x = ev.offsetX; this.y = ev.offsetY });
    canvas.addEventListener("mouseup", (ev) => mouse.buttons[ev.button] = false);
    canvas.addEventListener("mousedown", (ev) => mouse.buttons[ev.button] = true);
  }
  public x = 0;
  public y = 0;
  public buttons = [false,false,false]
}

const mouse = new Mouse(canvas);

const ctx = canvas.getContext("2d");

function drawTriangle(x1,y1,x2,y2,x3,y3,color){
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1,y1)
  ctx.lineTo(x2,y2)
  ctx.lineTo(x3,y3)
  ctx.closePath()
  ctx.fill()
}

function sinval(t:number,s:number,a:number): number {
  return Math.sin(t*s) * a
}

function waitKey(): Promise<void> {
  return new Promise((res,rej) => {
    const handler = (ev) => {
      res()
      removeEventListener("keydown",handler)
    }
    addEventListener("keydown", handler);
  })
}

(async function main(){

  function loop(time: number){
    //console.log(time)
    ctx.clearRect(0,0,640,480)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0,0,640,480)

    ctx.translate(80, 175 + sinval(time/1000,2,20))
    
    drawTriangle(0,0,100,0,50,50,"#FF004D")
    drawTriangle(0,0,50,50,0,100,"#00E436")
    drawTriangle(50,50,100,100,0,100,"#29ADFF")

    ctx.font = "bold 100px sans-serif"
    ctx.fillStyle = "#000"
    ctx.shadowBlur = 10
    ctx.shadowColor = "#00000066"
    //vg.fontAlign(vg.TOP | vg.CENTER)
    ctx.fillText("Kanvas",120,85)

    ctx.shadowBlur = 0
    ctx.resetTransform();
    
    ctx.beginPath()
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = mouse.buttons[0] ? "#FF004D" : "#FFEC27";
    ctx.fill()
    
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
  await waitKey();
  console.log("1")
  await waitKey();
  console.log("2")
  await waitKey();
  console.log("3")
})();
