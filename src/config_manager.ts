import { FileHandler } from './file_handler.ts';

const CONFIG_TARGET = 'havas_cmd.json';

export interface Command {
  id: number;
  name: string;
  command: string[];
  relative_cwd?: string;
}

export type BareCommand = Omit<Command, 'id'>;

interface CommandManagerState {
  largestId: number;
  configs: Command[];
}

interface StateUser<State> {
  exportState(): State;
  loadState(state: State): void;
}

// interface statePatternUser<State> extends State, StateUser<State> {}

export class CommandManager implements StateUser<CommandManagerState>, CommandManagerState {
  largestId = 0;
  configs: Command[] = [];
  listeners: ((this_manager: CommandManager) => void)[] = [];

  onAction(listener: (manager: CommandManager) => void) {
    this.listeners.push(listener);
  }

  getById(id: number): Command | undefined {
    return this.configs.find((e) => e.id === id);
  }

  addConfig(config: BareCommand): Command {
    (config as Command).id = this.largestId += 1;
    this.configs.push(config as Command);
    this.emit();
    return config as Command;
  }

  getCommands(): Command[] {
    return this.configs;
  }

  deleteCommand(id: number) {
    const index = this.configs.findIndex((e) => e.id === id);
    if (index >= 0) {
      this.configs.splice(index, 1);
    }
    this.emit();
  }
  async emit() {
    this.listeners.forEach((e) => e(this));
  }

  public exportState(): CommandManagerState {
    return {
      largestId: this.largestId,
      configs: this.configs,
    };
  }
  public loadState(state: CommandManagerState): void {
    this.largestId = state.largestId;
    this.configs = state.configs;
  }
}

export class CommandLoader {
  constructor(
    private manager: CommandManager,
    private file_handler: FileHandler,
    private target_file: string = CONFIG_TARGET,
  ) {}

  async load(): Promise<void> {
    const stored = await this.file_handler.vim_config_read(this.target_file);
    if (!stored) return;
    const storedState = JSON.parse(stored);
    this.manager.loadState(storedState);
  }

  store(): Promise<void> {
    const state = JSON.stringify(this.manager.exportState());
    return this.file_handler.vim_config_write(this.target_file, state);
  }
}
