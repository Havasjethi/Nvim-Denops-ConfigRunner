// deno-lint-ignore-file no-unused-vars require-await
import { Denops } from 'https://deno.land/x/denops_std@v1.0.0/mod.ts';
import { ensureString } from 'https://deno.land/x/unknownutil@v0.1.1/mod.ts';
import { CommandLoader, CommandManager } from './src/config_manager.ts';
import { FileHandler } from './src/file_handler.ts';

const CONFIG_FOLDER = '.vim';
const CONFIG_FILE = 'havas-project.json';

const file_handler = new FileHandler(CONFIG_FOLDER);
file_handler.find_root_or_current();
const manager = new CommandManager();
const loader = new CommandLoader(manager, file_handler, CONFIG_FILE);

const global_state = {
  file_handler,
  manager,
  loader,
};

export async function main(denops: Denops): Promise<void> {
  file_handler.find_root_or_current();
  const loader = new CommandLoader(manager, file_handler, CONFIG_FILE);
  loader.load().catch((e) => console.log('No file'));
  manager.onAction((x) => loader.store());

  if (file_handler.vim_config_exists('.vimrc')) {
    denops.cmd(`source ${CONFIG_FOLDER}/.vimrc`);
  }

  if (file_handler.vim_config_exists('init.lua')) {
    denops.cmd(`luafile ${CONFIG_FOLDER}/init.lua`);
  }

  initCommands(denops);
}

const initCommands = async (denops: Denops) => {
  const denops_required: Record<string, CallableFunction> = {
    async AddPattern(this: Denops, pattern: string): Promise<void> {
      ensureString(pattern);
      global_state.file_handler.add_indicator(pattern);
    },
    async ShowPattern(this: Denops): Promise<void> {
      console.log(global_state.file_handler.get_indicators());
    },
    async AddCommand(this: Denops, input_string: string): Promise<void> {
      // ensureString(pattern);
      const x = input_string.split(',');
      global_state.manager.addConfig({ name: x[0], command: x[1].split(' ') });
      global_state.manager;
    },
    async ListCommands(this: Denops): Promise<void> {
      const commands: CommandLike[] = global_state.manager.getCommands();
      const x = `:lua AVAILABLE_COMMANDS = ${mapper(commands)}`;
      await denops.cmd(x);
      await denops.cmd(`:HavasConfigListLua`);
    },
    async ExecuteCommand(this: Denops, commandId: unknown): Promise<void> {
      console.log('Executing... ', commandId);
    },
    async Test(this: Denops): Promise<void> {
      const result = await denops.cmd(':lua ' + `require('telescope.themes').get_dropdown{}`);
      console.log('Result xyz:: ', result);
    },
  };
  await xxx(denops, denops_required);
};

type CommandLike = {
  id: number;
  name: string;
  // command?: string[];
};

const mapper = (commands: CommandLike[]) => {
  const x = commands.map((e) => {
    return `{'${e.name}', id = ${e.id}}`;
  });

  return `{${x.join(',')}}`;
};

async function xxx(denops: Denops, denops_required: Record<string, CallableFunction>) {
  const to_register: any = {};
  for (const [key, value] of Object.entries(denops_required)) {
    console.log(key);
    to_register[key] = value.bind(denops);
    await denops.cmd(
      `command! -nargs=? HavasProject${key} call denops#request('${denops.name}', '${key}', [<q-args>])`,
    );
  }

  denops.dispatcher = {
    ...to_register,
  };
}

// async function setProjectRoot(this: Denops, currentRoot: string): Promise<FileType> {
// const entries = [];
// const folder = currentRoot;
// const targets = PATTERNS;
// let match_found = false;
//
// if (targets.length === 0) {
// PROJECT_ROOT = folder;
// return PROJECT_ROOT;
// }
//
// do {
// for await (const dirEntry of Deno.readDir(currentRoot)) {
// const matching = !!targets.find((e) => e === dirEntry.name);
// if (matching) {
// match_found = true;
// }
// entries.push();
// }
// } while (!match_found);
//
// PROJECT_ROOT = folder;
// return PROJECT_ROOT;
// }
