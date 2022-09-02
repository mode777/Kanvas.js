# Kanvas.js

A tiny Javascript interpreter with a canvas (2d) implementation. It aims to implement a subset of Browser APIs to enable the development/porting of games, visualizations and canvas-based application

![](2022-08-28-09-26-35.png)

It should be easily portable to any platform capable of running OpenGL ES 2. So far it has been tested with

* MacOS (arm64)
* Windows (x64)
* Linux (x86)
* RaspberryPI (arm)

## Installation

None, yet. See "Buidling".

## Getting Started

Here's some boilerplate that produces above image. 
```javascript
// make sure our code works in canvas and the browser
var canvas = window["kanvas"] ? window["kanvas"] : document.getElementById("canvas")
var ctx = canvas.getContext("2d");

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
```
The code works just like it would on the browser. The only difference is, that a global `kanvas` object exists where we can get a `RenderingContext2d` from.

Save as `canvas.js` and run `./canvas canvas.js`

## Compatibility

Kanvas.js aims to implement a subset of belowmentioned browser APIs. That means that Kanvas apps will generally run in the browser but not vice-versa.

### Javascript

Kanvas is based on Duktape and therefore mostly supports ES5. It is recommended to use Babel or Typescript to compile your code down to ES5. There is also no module support yet. So no `require` or `import`. It is therefore recommended to use a bundler like Webpack or Rollup to bundle modules into a single js-file. An example project with Webpack and Typescript can be found in the `templates` folder. 

> Kanvas pre-loads a polyfill (`core-js`) for ES6 primitives like `Promise`, `Map`, `Set` etc..So you don't have to polyfill them yourself.

### RenderingContext2d (Canvas)

Not much support here yet, as this project just started. Most of it should be fairly easy to implement due to NanoVGs similarity to HTML canvas.

|API|Support| 
|---|---|
|globalAlpha|       no|
|drawImage|         no|
|beginPath|         yes|
|clip|              no|
|fill|              yes|
|isPointInPath|     no|
|isPointInStroke|   no|
|stroke|            no|
|fillStyle|         partial (only solid colors)|
|strokeStyle|       no|
|createConicGradient|no|
|createLinearGradient|no|
|createPattern|     no|
|createRadialGradient|no|
|filter|            no|
|createImageData|   no|
|getImageData|      no|
|putImageData|      no|
|imageSmoothingEnabled|no|
|imageSmoothingQuality|no|
|arc|               yes|
|arcTo|             no|
|bezierCurveTo|     yes|
|ellipse|           partially (no rotation)|
|lineTo|            yes|
|moveTo|            yes|
|quadraticCurveTo|  yes|
|rect|              yes|
|lineCap|           no|
|lineDashOffset|    no|
|lineJoin|          no|
|lineWidth|         yes|
|miterLimit|        no|
|getLineDash|       no|
|setLineDash|       no|
|clearRect|         yes|
|fillRect|          yes|
|strokeRect|        no|
|shadowBlur|        partial (text only)|
|shadowColor|       yes|
|shadowOffsetX|     yes|
|shadowOffsetY|     yes|
|restore|           no|
|save|              no|
|fillText|          yes|
|measureText|       no|
|strokeText|        no|
|direction|         no|
|font|              yes|
|textAlign|         no|
|textBaseline|      no|
|resetTransform|    yes|
|rotate|            no|
|scale|             no|
|setTransform|      no|
|transform|         no|
|translate|         yes|
|drawFocusIfNeeded| no|
|canvas|            yes (returns window.kanvas)|
|getContextAttributes|yes (empty)|


## Building

Kanvas uses CMake for building.

### Dependencies

* SDL2
* ANGLE (On Desktop platforms)

Static dependencies (create on bulld)
* duktape
* nanovg

### Instructions

Building on Windows has only been tested with Mingw32

```
git submodule init
git submodule update --recursive
mkdir build
cd build
cmake ..
cmake --build .
```

