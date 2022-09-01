// make sure our code works in canvas and the browser
var canvas = window["kanvas"] ? window["kanvas"] : document.getElementById("canvas")
var ctx = canvas.getContext("2d");

canvas.addEventListener("mousemove", function(ev){
    //console.log(ev.offsetX + "," + ev.offsetY);
})

canvas.addEventListener("keydown", function(ev){
  if(!ev.repeat){
    console.log(ev.key)
  }
})

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
    ctx.resetTransform();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);