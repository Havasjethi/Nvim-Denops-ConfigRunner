// deno-lint-ignore-file no-explicit-any
import './string_extend.ts';
import { Command } from './config_manager.ts';

export interface CommandState {
  finished: boolean;
  originalCommand: Command;
  status?: number;
  stdout?: any;
  stderr?: any;
}

export class CommandExecutor {
  constructor(public working_directory: string) {}

  total_processes: Record<number, CommandState> = {};
  runningProcesses: Record<number, Deno.Process<any>> = {};

  text_decoder = new TextDecoder('utf-8');

  runCommand(command: Command): Promise<CommandState> {
    const filepath_1 = Deno.makeTempFileSync({ prefix: 'havas_denops_' });
    const file_1 = Deno.openSync(filepath_1, { write: true, read: true, create: true });
    // const filepath_2 = Deno.makeTempFileSync({ prefix: 'havas_denops_' });
    // const file_2 = Deno.openSync(filepath_2);

    const process = Deno.run({
      cmd: command.command,
      cwd: this.working_directory.resolve(command.relative_cwd),
      stdin: 'null',

      stderr: 'piped',
      stdout: 'piped',
      // stderr: file_1.rid,
      // stdout: file_2.rid,
    });

    this.runningProcesses[process.pid] = process;
    this.total_processes[process.pid] = {
      finished: false,
      originalCommand: command,
    };
    const xx = this.total_processes[process.pid];

    try {
      process.stdout.readable.pipeTo(file_1.writable).then(() => console.log('hello'));
    } catch (e) {
      console.log('e');
    }

    return new Promise((res, rej) =>
      process
        .status()
        .then(() => {
          this.modify_data_1(process).then(() => res(xx));
        })
        .catch(rej)
        .finally(() => file_1.close()),
    );
  }

  private async modify_data_1(
    process: Deno.Process<{ cmd: string[]; stdout: 'piped'; stderr: 'piped' }>,
  ) {
    const status = await process.status();
    // const [status, out, err] = await Promise.all([ process.status(), process.output(), process.stderrOutput(), ]);
    // const [status, err] = await Promise.all([process.status(), process.stderrOutput()]);

    this.runningProcesses[process.pid];
    const item = this.total_processes[process.pid];
    item.finished = true;
    item.status = status.code;
    // item.stderr = this.text_decoder.decode(err);
    // item.stdout = this.text_decoder.decode(out);
    process.close();
  }

  // private async modify_data_2(
  // process: Deno.Process<{ cmd: string[]; stdout: number; stderr: number }>,
  // ) {
  // const [status, err] = await Promise.all([
  // process.status(),
  // // process.output(),
  // process.stderrOutput(),
  // ]);
  //
  // this.runningProcesses[process.pid];
  // const item = this.total_processes[process.pid];
  // item.finished = true;
  // item.status = status.code;
  // item.stderr = this.text_decoder.decode(err);
  // // item.stdout = this.text_decoder.decode(out);
  // process.close();
  // }

  public killAll() {
    for (const [_key, value] of Object.entries(this.runningProcesses)) {
      value.kill();
      value.close();
    }
  }
}
