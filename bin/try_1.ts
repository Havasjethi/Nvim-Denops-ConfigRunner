import { Buffer } from 'https://deno.land/std@0.173.0/io/buffer.ts';

import { getHeight, getSize, getWidth } from 'https://deno.land/x/terminal_size/mod.ts';

export class Displayer {
  encoder = new TextEncoder();
  width: number;
  constructor() {
    const { rows, cols: width } = getSize();
    this.width = width;
  }
  display(toDisplay: string[]) {
    Deno.stdout.writeSync(this.encoder.encode('\r\b\r'));
    for (const x of toDisplay) {
      const length = x.length;
      const suffix = Math.max(this.width - length, 0);
      Deno.stdout.writeSync(this.encoder.encode(x + ' '.repeat(suffix)));
    }
  }
}

const displayer = new Displayer();

const main = () => {
  const toDisplay = ['A', 'B', 'C', 'd'.repeat(250)];
  displayer.display(toDisplay);
  displayer.display(toDisplay);
};

main();
