import { CommandExecutor } from '../src/command_executor.ts';
import { Command } from '../src/config_manager.ts';
import { assert } from './test_deps.ts';

const command: Command = {
  id: 1,
  name: 'Asd',
  command: ['sh', '-c', 'echo asd; sleep 1; echo asd; echo 12; sleep 5'],
};
const testCommand = new CommandExecutor(Deno.cwd());

Deno.test('Run and abort - early', async () => {
  const result = testCommand.runCommand(command);
  setTimeout(() => result.abort(), 300);
  await result.promise.catch(() => {});

  assert(result.output.length === 1);
});

Deno.test('Run and abort - lately', async () => {
  const result = testCommand.runCommand(command);
  setTimeout(() => result.abort(), 1300);
  await result.promise.catch(() => {});

  assert(result.output.length > 1);
});
