import { Drawable } from './interfaces';
import { TimeUtils } from './utils';
import { Option } from './Option';
import { InkChoice } from './InkChoice';

export class Choices implements Drawable {
  options: Option[] = [];

  constructor(private canvas: HTMLCanvasElement) {
  }

  draw(ctx: CanvasRenderingContext2D) {

    for (const opt of this.options) {
      opt.draw(ctx);
    }
  }

  async waitForChoice(choices: InkChoice[], time = 0) {
    this.options = choices.map(x => new Option(this.canvas, x.index, x.text));
    this.options.push(new Option(this.canvas, -1, "<< BACK"))
    this.options.push(new Option(this.canvas, -2, "<< RESTART"))
    let x = 0.5;
    let y = 0.66;
    let observer: (number) => void;
    const promise = new Promise<number>((res) => observer = res);
    for (const opt of this.options) {
      opt.registerObserver(observer);
      opt.show(x, y, time);
      await TimeUtils.wait(time / 3);
      y += 0.08;
    }
    const choice = await promise;
    await this.hide(time);
    return choice;
  }

  async hide(time = 0) {
    for (const opt of this.options) {
      opt.hide(time);
      await TimeUtils.wait(time / 3);

    }
    this.options = [];
  }
}
