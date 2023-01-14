// deno-lint-ignore-file require-await no-explicit-any
import { assert } from './test_deps.ts';
import { FileHandler } from '../src/file_handler.ts';
import { ProjectLogic } from '../src/project_logic.ts';

const test_obj = {
  lua_calls: 0,
  vim_calls: 0,

  async executeLuaFile(path: any) {
    this.lua_calls += 1;
  },
  async executeVimFile(path: any) {
    this.vim_calls += 1;
  },
};
const x = new ProjectLogic(new FileHandler(), test_obj);

Deno.test('Files could be  detected', () => {
  const { lua_calls, vim_calls } = test_obj;
  x.onStartup();

  assert(lua_calls < test_obj.lua_calls);
  assert(vim_calls < test_obj.vim_calls);
});
