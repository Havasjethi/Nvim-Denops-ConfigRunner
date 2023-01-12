// deno-lint-ignore-file no-unused-vars require-await
import { Denops } from 'https://deno.land/x/denops_std@v1.0.0/mod.ts';
import { ensureString } from 'https://deno.land/x/unknownutil@v0.1.1/mod.ts';
import { ProjectHandler } from './src/project_handler.ts';

type FileType = string;

let PROJECT_ROOT: FileType | undefined = undefined;

const CONFIG_FOLDER = '.vim';
const CONFIG_FILE = 'havas-project.json';

// Might be a Set
const PATTERNS: string[] = [];

const enum COMMAND_NAMES {
  add_pattern = 'add_pattern',
  show_list = 'show_pattern',
  write_buffer = 'write_buffer',
  remove_pattern = '',
  search_command = '',
  execute_last_command = '',
  execute_by_id = '',
}

const commands = [{ id: 1, name: 'Szia', command: ['echo', 'szia'] }];

export async function main(denops: Denops): Promise<void> {
  initCommands(denops);
  new ProjectHandler(denops).find_root();
}

const initCommands = async (denops: Denops) => {
  const denops_required: Record<string, CallableFunction> = {
    AddPattern: add_pattern,
    ShowPattern: show_pattern,
    async ListCommands(this: Denops): Promise<void> {
      const x = `:lua AVAILABLE_COMMANDS = ${mapper(commands)}`;
      await denops.cmd(x);
      await denops.cmd(`:HavasConfigListLua`);
    },
    async ExecuteCommand(this: Denops, asdasd: unknown): Promise<void> {
      console.log('Executing... ', asdasd);
    },
    async Test(this: Denops): Promise<void> {
      const result = await denops.cmd(':lua ' + `require('telescope.themes').get_dropdown{}`);
      console.log('Result:: ', result);
    },
  };
  await xxx(denops, denops_required);
};

type CommandLike = {
  id: number;
  name: string;
  command: string[];
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

async function add_pattern(this: Denops, pattern: string): Promise<void> {
  ensureString(pattern);
  PATTERNS.push(pattern);
}

async function show_pattern(this: Denops): Promise<void> {
  console.log(PATTERNS.join(', ') || '<no pattern>');
}

async function storeConfigFile(bufferId: number) {
  if (!PROJECT_ROOT) {
    setProjectRoot;
  }
}

async function setProjectRoot(this: Denops, currentRoot: string): Promise<FileType> {
  const entries = [];
  const folder = currentRoot;
  const targets = PATTERNS;
  let match_found = false;

  if (targets.length === 0) {
    PROJECT_ROOT = folder;
    return PROJECT_ROOT;
  }

  do {
    for await (const dirEntry of Deno.readDir(currentRoot)) {
      const matching = !!targets.find((e) => e === dirEntry.name);
      if (matching) {
        match_found = true;
      }
      entries.push();
    }
  } while (!match_found);

  PROJECT_ROOT = folder;
  return PROJECT_ROOT;
}
