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
    const idx = this.text.indexOf(':')
    if(idx !== -1){
      this.speaker = this.text.substring(0,idx)
      this.text = this.text.substring(idx+1).trim()
    }
  }
}

