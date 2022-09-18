import { Directive } from "./Directive";

export class InkLine {
  text = '';
  speaker = '';
  directives: Directive[] = [];

  get hasText() { return this.text && this.text !== ''; }

  private readonly outerReg = /@\(([^\)]+)\)/gm;

  constructor(input: string) {
    this.parse(input);
  }

  private parse(input: string) {
    let outerMatch: RegExpExecArray;
    while ((outerMatch = this.outerReg.exec(input)) !== null) {
      if (!outerMatch[1])
        throw new Error('Malformed directive in line: ' + input);
      this.directives.push(new Directive(outerMatch[1]));
    }
    this.text = input.replace(this.outerReg, '').trim();
    const parts = this.text.split(':');
    if (parts.length > 1) {
      this.speaker = parts[0];
      this.text = parts[1];
    }
  }
}
