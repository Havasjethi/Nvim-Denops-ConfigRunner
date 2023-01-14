import { BareCommand, CommandLoader, CommandManager } from '../src/config_manager.ts';
import { FileHandler } from '../src/file_handler.ts';
import { assert } from './test_deps.ts';

const test_config = 'test.json';
const configManager = new CommandManager();
const fh = new FileHandler();
const loader = new CommandLoader(configManager, fh, 'test.json');

const getCommand = () => ({ name: 'x', command: ['echo', 'y'] });

Deno.test('Add Command', () => {
  const toSave: BareCommand = getCommand();
  const stored = configManager.addConfig(toSave);
  assert(stored.id !== undefined);
  assert(stored === toSave);
});

Deno.test('Delete Command', () => {
  const toSave: BareCommand = getCommand();

  const stored = configManager.addConfig(toSave);
  assert(stored.id !== undefined);
  assert(stored === toSave);

  configManager.deleteCommand(stored.id);

  assert(configManager.getCommands.length === 0);
});

Deno.test('State export-import works', async () => {
  const toSave: BareCommand = getCommand();

  const stored = configManager.addConfig(toSave);
  assert(stored.id !== undefined);
  assert(stored === toSave);

  await loader.store();
  const cm = new CommandManager();

  const newLoader = new CommandLoader(cm, fh, 'test.json');
  await newLoader.load();

  assert(cm.getCommands().length === configManager.getCommands().length);
  fh.vim_config_remove(test_config);
});
