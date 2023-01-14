import { FileHandler } from './file_handler.ts';

const VIM_SCRIPT_FILE = '.vimrc';
const LUA_SCRIPT_FILE = 'init.lua';

export interface FileExecutor {
  executeVimFile(path: string): Promise<void>;
  executeLuaFile(path: string): Promise<void>;
}

export class ProjectLogic {
  constructor(private handler: FileHandler, private fileExecutor: FileExecutor) {}

  async onStartup(): Promise<void> {
    const promises = [];
    if (this.handler.vim_config_exists(VIM_SCRIPT_FILE)) {
      promises.push(this.fileExecutor.executeVimFile(VIM_SCRIPT_FILE));
    }

    if (this.handler.vim_config_exists(LUA_SCRIPT_FILE)) {
      promises.push(this.fileExecutor.executeLuaFile(LUA_SCRIPT_FILE));
    }
    await Promise.all(promises);
  }

  executeFile() {}
}
