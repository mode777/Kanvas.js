import * as ink from 'inkjs/dist/ink-full'
import contents from './../ink/example.ink';
import intercept from './../ink/intercept.ink';


async function ink_main() {
  var story = new ink.Story(intercept);
  while (story.canContinue) {
    while (story.canContinue) {
      story.Continue();
      //console.log(story.Continue());
    }
    if (story.currentChoices.length > 0) {
      //console.log("-------------")
      for (var i = 0; i < story.currentChoices.length; i++) {
        var choice = story.currentChoices[i];
        console.log("Choice " + (i + 1) + ". " + choice.text);
      }
      while (true) {
        const k = await waitKey();
        const idx = parseInt(k);
        if(idx > 0 && idx <= story.currentChoices.length){
          story.ChooseChoiceIndex(idx-1);
          break;
        }
      }
    }
  }
}



const canvas = window["kanvas"] ?? <HTMLCanvasElement>document.getElementById("canvas")

class Mouse {
  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousemove", (ev) => { this.x = ev.offsetX; this.y = ev.offsetY });
    canvas.addEventListener("mouseup", (ev) => mouse.buttons[ev.button] = false);
    canvas.addEventListener("mousedown", (ev) => mouse.buttons[ev.button] = true);
  }
  public x = 0;
  public y = 0;
  public buttons = [false, false, false]
}

const mouse = new Mouse(canvas);

const ctx = canvas.getContext("2d");

function drawTriangle(x1, y1, x2, y2, x3, y3, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x3, y3)
  ctx.closePath()
  ctx.fill()
}

function sinval(t: number, s: number, a: number): number {
  return Math.sin(t * s) * a
}

function waitForEvent<T extends Event>(name: string, target: EventTarget = window, predicate?: (ev: T) => boolean) {
  return new Promise<T>((res, rej) => {
    const handler = (ev) => {
      if (!predicate || predicate(ev)){
        res(ev);
        removeEventListener(name, handler)
      } 
    }
    addEventListener(name, handler);
  })
}

async function waitKey(keys?: string[]) {
  var ev = await waitForEvent<KeyboardEvent>("keydown", window, ev => !keys || keys.findIndex(x => x === ev.key) != -1)
  return ev.key;
}

async function test() {
  const ev = await waitForEvent<CustomEvent>("ink_choice");
  console.log("Choices are here! " + ev.detail);
}




(async function main() {
  throw new Error("Async error")
  console.log(Event)
  ink_main()

  function loop(time: number) {
    //console.log(time)
    ctx.clearRect(0, 0, 640, 480)
    ctx.fillStyle = "#fff"
    ctx.fillRect(0, 0, 640, 480)

    ctx.translate(80, 175 + sinval(time / 1000, 2, 20))

    drawTriangle(0, 0, 100, 0, 50, 50, "#FF004D")
    drawTriangle(0, 0, 50, 50, 0, 100, "#00E436")
    drawTriangle(50, 50, 100, 100, 0, 100, "#29ADFF")

    ctx.font = "bold 100px sans-serif"
    ctx.fillStyle = "#000"
    ctx.shadowBlur = 10
    ctx.shadowColor = "#00000066"
    //vg.fontAlign(vg.TOP | vg.CENTER)
    ctx.fillText("Kanvas", 120, 85)

    ctx.shadowBlur = 0
    ctx.resetTransform();

    ctx.beginPath()
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = mouse.buttons[0] ? "#FF004D" : "#FFEC27";
    ctx.fill()

    requestAnimationFrame(loop);
  }
  test();

  requestAnimationFrame(loop);
  console.log(await waitKey())
  console.log(await waitKey())
  console.log(await waitKey())
  console.log(CustomEvent)
  const ev = new CustomEvent("ink_choice", { detail: "xxx" })
  console.log("redy!")
  dispatchEvent(ev)
})().catch(x => {
  for (const key in x) {
    if (Object.prototype.hasOwnProperty.call(x, key)) {
      const element = x[key];
      
    }
  }
});
