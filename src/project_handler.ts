import { existsSync } from './deps.ts';

const root_patterns = [];

declare global {
  interface String {
    resolve(other: string): string;
  }
}

String.prototype.resolve = function (other: string) {
  return this.concat('/', other);
};

const VIM_FOLDER = '.vim';

export class ProjectHandler {
  vim_config_remove(file: string): Promise<void> {
    const project_file = this.find_root_or_current().resolve(VIM_FOLDER).resolve(file);
    return Deno.remove(project_file);
  }
  private project_root: string | undefined;
  private root_indicators: string[] = ['.git'];
  readonly decoder = new TextDecoder('UTF-8');
  // TODO :: Should this supported??
  // private root_pattern_indicators: string[] = [''];

  constructor(_denops: any) {}

  public add_indicator(indicator: string) {
    this.root_indicators.push(indicator);
  }

  public get_root(): string {
    return this.project_root!;
  }

  public doesFileExists(file: string) {
    Deno.statSync;
  }

  public vim_config_exists(file: string): boolean {
    const project_file = this.find_root_or_current().resolve(VIM_FOLDER).resolve(file);
    return existsSync(project_file);
  }

  public vim_config_write(file: string, content: string): Promise<void> {
    const project_file = this.find_root_or_current().resolve(VIM_FOLDER).resolve(file);
    return Deno.writeTextFile(project_file, content);
  }

  public async vim_config_read(file: string): Promise<string> {
    const project_file = this.find_root_or_current().resolve(VIM_FOLDER).resolve(file);
    new TextDecoder('utf-8');
    return this.decoder.decode(await Deno.readFile(project_file, {}));
  }

  private _resolve_vim_folder(): string {
    return this.find_root_or_current().resolve('.vim');
  }

  public find_root_or_current(): string {
    let next = Deno.cwd();
    let prev;
    let match: string | undefined;

    outer: while (next !== '') {
      for (const entry of Deno.readDirSync(next)) {
        if (this.root_indicators.includes(entry.name)) {
          match = next;
          break outer;
        }
      }
      const temp = next.split('/');
      temp.pop();
      prev = next;
      next = temp.join('/') || '/';
      if (next === prev) break;
    }
    return match || Deno.cwd();
  }
}

export function load_config_file() {
  root_patterns.push();
}
