export class A {}

interface Component {
  draw(): string;
}

export class TextComponent implements Component {
  constructor(private text: string) {}
  draw(): string {
    return this.text;
  }
}
const text = new TextComponent('asd');
