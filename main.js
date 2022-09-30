// make sure our code works in canvas and the browser
var canvas = window["kanvas"] ? window["kanvas"] : document.getElementById("canvas")
var ctx = canvas.getContext("2d");


var p = new Path2D("m-9.8,174.4s-2.8,22.4,0.4,30.8,2.4,10.4,1.6,14.4,3.6,14,9.2,20l12,1.6s15.2-3.6,24.4-0.8c0,0,8.994,1.34,12.4-13.6,0,0,4.8-6.4,12-9.2s14.4-44.4,10.4-52.4-18.4-12.4-34.4,3.2-18-1.2-48,6z");
console.log(p)
function drawTriangle(x1,y1,x2,y2,x3,y3,color){
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x1,y1)
  ctx.lineTo(x2,y2)
  ctx.lineTo(x3,y3)
  ctx.closePath()
  ctx.fill()
}

function sinval(t,s,a) {
  return Math.sin(t*s) * a
} 

function loop(time){
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
    ctx.fillText("Kanvas",120,85)

    ctx.shadowBlur = 0
    ctx.fill(p);
    
    // vg.beginPath();
    // vg.pathWinding(vg.SOLID)
    // vg.rect(0,0,100,100);
    // vg.pathWinding(vg.HOLE)
    // vg.rect(10,10,80,80);
    // vg.fillColor("#000")
    // vg.fill()
    
    ctx.resetTransform();

    vg.beginPath();
    vg.moveTo(0,0)
    vg.lineTo(100,100)
    vg.lineTo(100,0)
    vg.closePath()
    vg.moveTo(10,10)
    vg.lineTo(90,10)
    vg.lineTo(90,90)
    vg.closePath()
    vg.pathWinding(vg.HOLE)
    vg.fillColor("#000")
    vg.fill()

    // var p = new Path2D();
    // p.moveTo(0,0)
    // p.lineTo(100,100)
    // p.lineTo(100,0)
    // p.closePath()
    // p.moveTo(10,10)
    // p.lineTo(90,10)
    // p.lineTo(90,90)
    // p.closePath()
    // ctx.fillStyle = "#000"
    // ctx.fill(p)

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

var wav = new Audio()
wav.src = 'assets/audio/bgm/mystical_theme.mp3'
wav.preload = true
wav.play()

