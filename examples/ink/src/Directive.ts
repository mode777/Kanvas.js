
export class Directive {
  command: string;
  operations: string[] = [];
  parameters: { [key: string]: any; } = {};
  text: string = '';

  private readonly innerReg = /([^\s"':]+):"([^"]+)"|([^\s"':]+):'([^']+)'|([^\s"':]+):([^\s]+)|([^\s"':]+)/gm;

  constructor(input: string) {
    this.parse(input);
  }

  private parse(input: string) {
    let innerMatch: RegExpExecArray;
    while ((innerMatch = this.innerReg.exec(input)) !== null) {
      const key = innerMatch[1] ?? innerMatch[3] ?? innerMatch[5] ?? null;
      const value = innerMatch[2] ?? innerMatch[4] ?? innerMatch[6] ?? innerMatch[7];
      if (!value)
        throw new Error('Malformed directive ' + input);
      if (key) {
        this.parameters[key] = value;
      } else {
        if (!this.command)
          this.command = value;
        else
          this.operations.push(value);
      }
    }
  }
}
