import { InkLine } from "./InkLine";


export class InkChoice extends InkLine {
  index: number;

  constructor(choice: any) {
    super(choice.text);
    this.index = choice.index;
  }
}
