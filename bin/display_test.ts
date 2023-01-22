// deno-lint-ignore-file no-empty-interface
//
interface Displayer {
  display(stuff: string[]): void;
}

interface Adapter {
  createDisplayData(): string[];
}

// type TextParts = string[];
type Line = string[];
type Lines = string[][];
type DrawResult = Lines | Line;

interface Component {
  draw(): DrawResult; // string[] ~~ Text Parts | string[][] ~~ Lines of TextParts
}
interface Conditional extends Component {}
interface Iterated extends Component {}

const WIDTH = 40;

interface ComponentHolder extends Component {
  children: Component[];
}

class TextComponent implements Component {
  constructor(public content: string) {}
  draw(): Line {
    return [this.content];
  }
}

function Text(content: string) {
  return new TextComponent(content);
}

class ProgressBarComponent implements Component {
  constructor(public progress: number) {}
  draw(): Line {
    return ['Progress:', this.progress.toString()];
  }
}

function isLine(x: DrawResult): x is Line {
  return typeof x[0] !== 'object';
}

type FlexDirection = 'row' | 'column';
const enum FlexJustifyContent {
  FlexStart,
  SpaceBetween,
}
class FlexBoxComponent implements ComponentHolder {
  direction: FlexDirection = 'row' as const;
  spacing: FlexJustifyContent = FlexJustifyContent.FlexStart;

  constructor(public children: Component[] = []) {}

  draw(): DrawResult {
    const lines: Line[] = [];

    for (const child of this.children) {
      const result = child.draw();
      if (result.length === 0) {
        continue;
      }

      if (isLine(result)) lines.push(result);
      else lines.push(...result);
    }

    return this.formatLines(lines);
  }

  private formatLines(lines: Line[]): Line[] {
    if (lines.length === 0) return lines;
    if (this.direction === 'column') return lines;

    const onlyLines = lines.every((e) => isLine(e));
    if (onlyLines) {
      switch (this.spacing) {
        case FlexJustifyContent.FlexStart:
          return [(lines as Line[]).map((e) => e.join(' '))];

        case FlexJustifyContent.SpaceBetween: {
          const totalOccupiedSpace = (lines as Line[]).reduce(
            (acc, curr) => acc + curr[0].length,
            0,
          );
          const x = WIDTH - totalOccupiedSpace;
          const totalSpacePerItem = x <= 0 ? 1 : Math.floor(x / lines.length);
          const joiner = ' '.repeat(totalSpacePerItem);
          console.log({
            totalOccupiedSpace,
            totalSpacePerItem,
            WIDTH,
            x,
          });
          const mappedLines = [];
          let index = 0;
          for (const line of lines) {
            if (index === 0) {
              mappedLines.push(line.join(' ') + joiner);
            } else {
              mappedLines.push(joiner + line.join(' '));
            }
            index += 1;
          }
          return [mappedLines];
        }

        default:
          throw new Error('Not supported with multiline components');
      }
    }

    throw new Error('Not supported with multiline components');
  }
}
function FlexBox(...components: Component[]) {
  return new FlexBoxComponent(components);
}

class ElementAdapter implements Adapter, Displayer {
  constructor(private root: Component) {
    // Todo :: Add .. Rész to the last line, while waiting for new printing
  }

  createDisplayData(): string[] {
    const res = this.root.draw();
    const lines: Lines = isLine(res) ? [res] : res;
    return lines.map((e) => e.join(''));
  }

  display(stuff: string[]): void {
    console.log('='.repeat(WIDTH));
    for (const x of stuff) {
      console.log(x);
    }
  }
}

const component = Text('NKS');
const flexBox = FlexBox(Text('Szia'), Text('Maci'), component);
const displayer = new ElementAdapter(flexBox);

displayer.display(displayer.createDisplayData());
flexBox.direction = 'row';
flexBox.spacing = FlexJustifyContent.SpaceBetween;
component.content = 'Criminal Madafaka';
displayer.display(displayer.createDisplayData());
