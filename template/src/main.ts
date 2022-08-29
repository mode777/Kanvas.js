(async function main(){
  const canvas = window["kanvas"] ?? document.getElementById("canvas")
  const ctx = canvas.getContext("2d");

  requestAnimationFrame((time) => {
    ctx.fillStyle = "#fff"
    ctx.fillRect(0,0,640,480)

    ctx.font = "bold 100px sans-serif"
    ctx.fillStyle = "#000"
    ctx.fillText("Hello World",50,50)
  });
})();
