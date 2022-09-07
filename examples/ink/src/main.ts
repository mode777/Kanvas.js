import contents from './../ink/test2.ink';
import { InkApp, TextElement } from './ink-app';

const canvas = window["kanvas"] ?? <HTMLCanvasElement>document.getElementById("canvas")
var ctx = canvas.getContext('2d');

const ink = new InkApp(canvas, contents);

ink.runStory().catch(x => console.log(x))