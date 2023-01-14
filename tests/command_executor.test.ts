import { CommandExecutor } from '../src/command_executor.ts';
import { Command } from '../src/config_manager.ts';

const command: Command = {
  id: 1,
  name: 'Asd',
  command: ['echo', 'hello', 'world'],
  // command: ['sleep', '5'],
};
const x = new CommandExecutor(Deno.cwd());

Deno.test('Main', async () => {
  const result = await x.runCommand(command);
  console.log('res', result);
});
