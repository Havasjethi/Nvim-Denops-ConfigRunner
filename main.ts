// deno-lint-ignore-file no-unused-vars require-await no-explicit-any no-var valid-typeof no-inner-declarations no-redeclare
import { CommandExecutor } from './src/command_executor.ts';
import { CommandLoader, CommandManager } from './src/config_manager.ts';
import { FileHandler } from './src/file_handler.ts';
import { Denops } from './src/deps.ts';
import { bufferReplace, bufferAppend, ensureString } from './src/deps.ts';
const CONFIG_FOLDER = '.vim';
const CONFIG_FILE = 'havas-project.json';

// declare var BUFFER_ID: number | undefined;
// if (typeof BUFFER_ID === undefined) {
// var BUFFER_ID: number | undefined = undefined;
// }
// let BUFFER_ID: number | undefined = undefined;
// deno-lint-ignore prefer-const
let global_state: {
  file_handler: FileHandler;
  manager: CommandManager;
  loader: CommandLoader;
  executor: CommandExecutor;
  BUFFER_ID: undefined | number;
} = { BUFFER_ID: undefined } as any;

export async function main(denops: Denops): Promise<void> {
  init_global_state();
  global_state.file_handler.find_root_or_current();

  global_state.loader.load().catch((e) => console.log('No file'));
  global_state.manager.onAction((x) => global_state.loader.store());

  if (global_state.file_handler.vim_config_exists('.vimrc')) {
    denops.cmd(`source ${CONFIG_FOLDER}/.vimrc`);
  }

  if (global_state.file_handler.vim_config_exists('init.lua')) {
    denops.cmd(`luafile ${CONFIG_FOLDER}/init.lua`);
  }

  initCommands(denops);
}

function init_global_state() {
  const file_handler = new FileHandler(CONFIG_FOLDER);
  file_handler.find_root_or_current();
  const manager = new CommandManager();
  const loader = new CommandLoader(manager, file_handler, CONFIG_FILE);
  const executor = new CommandExecutor(Deno.cwd());

  global_state.file_handler = file_handler;
  global_state.manager = manager;
  global_state.loader = loader;
  global_state.executor = executor;
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
      ensureString(input_string);
      const input = input_string.split(',');
      global_state.manager.addConfig({ name: input[0], command: input[1].split(' ') });
    },
    async ReloadCommands(this: Denops): Promise<void> {
      global_state.loader.load();
    },
    async ListCommands(this: Denops): Promise<void> {
      const commands: CommandLike[] = global_state.manager.getCommands();
      const x = `:lua AVAILABLE_COMMANDS = ${mapper(commands)}`;
      await denops.cmd(x);
      // TODO :: Find better way for this!!
      await denops.cmd(`:HavasConfigListLua`);
    },
    async ExecuteCommand(this: Denops, commandId: string): Promise<void> {
      console.log('Hell', typeof +commandId, +commandId);
      const command = global_state.manager.getById(+commandId);

      if (!command) {
        console.log('Cannot find command with id:', commandId);
        return;
      }

      console.log('Executing... ', command.name);
      const result = await global_state.executor.runCommand(command);
      console.log('Result: ', result.output[0]);

      if (!global_state.BUFFER_ID) {
        const s = await denops.cmd('new +setl\\ buftype=nofile');
        global_state.BUFFER_ID = (await denops.call('nvim_get_current_buf')) as number;
      } else {
        console.log('Exist:');
        await denops.cmd(`sbuffer ${global_state.BUFFER_ID}`);
      }
      const formatted_text = result.output.map((e) => e.split('\n')).flat(1);
      formatted_text.unshift(command.command.join(' '));

      bufferReplace(denops as any, global_state.BUFFER_ID, formatted_text);
    },
    async Test(this: Denops): Promise<void> {
      // await denops.cmd(`sbuffer ${BUFFER_ID}`);
    },
  };
  await bindCommands(denops, denops_required);
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

async function bindCommands(denops: Denops, denops_required: Record<string, CallableFunction>) {
  const to_register: any = {};
  for (const [key, value] of Object.entries(denops_required)) {
    // console.log(key);
    to_register[key] = value.bind(denops);
    await denops.cmd(
      `command! -nargs=? HavasProject${key} call denops#request('${denops.name}', '${key}', [<q-args>])`,
    );
  }

  denops.dispatcher = {
    ...to_register,
  };
}
