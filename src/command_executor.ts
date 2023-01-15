// deno-lint-ignore-file no-explicit-any
import './string_extend.ts';
import { Command } from './config_manager.ts';
import { mergeReadableStreams } from './deps.ts';

export interface CommandState {
  finished: boolean;
  originalCommand: Command;
  status?: number;
  // TODO :: Might add Type to this
  output: string[];

  // TODO ::
  p?: Promise<void>;
}

export class ClassFieldWrite implements WritableStream<Uint8Array> {
  text_decoder = new TextDecoder('utf-8');
  constructor(public obj: CommandState) {}
  locked = false;

  write(chunk: any) {
    this.obj.output.push(this.text_decoder.decode(chunk));
  }
  async abort(reason?: any): Promise<void> {}
  async close(): Promise<void> {}
  getWriter(): WritableStreamDefaultWriter<Uint8Array> {
    throw new Error('Method not implemented.');
  }
}

export class CommandExecutor {
  constructor(public working_directory: string) {}

  total_processes: Record<number, CommandState> = {};
  runningProcesses: Record<number, Deno.Process<any>> = {};
  recent_process?: Command;

  text_decoder = new TextDecoder('utf-8');

  async runCommand(command: Command, _onUpdate?: (s: CommandState) => void): Promise<CommandState> {
    this.recent_process = command;
    const process = Deno.run({
      cmd: command.command,
      cwd: this.working_directory.resolve(command.relative_cwd),
      stdin: 'null',
      stderr: 'piped',
      stdout: 'piped',
    });

    this.runningProcesses[process.pid] = process;

    const processWrapper: CommandState = {
      finished: false,
      originalCommand: command,
      output: [],
    };
    this.total_processes[process.pid] = processWrapper;

    const outputWriter = new WritableStream(new ClassFieldWrite(processWrapper));

    const joined = mergeReadableStreams(process.stdout.readable, process.stderr.readable);
    const processPiping = joined.pipeTo(outputWriter);

    // TODO :: This shouldn't wait here, cause the integrated area won't receive
    //         ANY info until the process is finished
    //         Which is horrible for long  running processes (eg.: gradle bootRun / host webapp with auto compile)
    const stats = await process.status();
    await processPiping;
    process.close();

    processWrapper.finished = true;
    processWrapper.status = stats.code;

    return processWrapper;
  }

  private async modify_data_1(
    process: Deno.Process<{ cmd: string[]; stdout: 'piped'; stderr: 'piped' }>,
  ) {
    const status = await process.status();

    this.runningProcesses[process.pid];
    const item = this.total_processes[process.pid];
    item.finished = true;
    item.status = status.code;
    process.close();
  }

  public killAll() {
    for (const [_key, value] of Object.entries(this.runningProcesses)) {
      value.kill();
      value.close();
    }
  }
}
