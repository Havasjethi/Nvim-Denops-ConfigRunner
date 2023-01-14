import { assert } from './test_deps.ts';
import { FileHandler } from '../src/file_handler.ts';

const ph = new FileHandler();

Deno.test('Exists works', () => {
  assert(ph.vim_config_exists('.vimrc'));
  assert(!ph.vim_config_exists('.vimrcasdasd'));
});

Deno.test('Read works', async () => {
  assert((await ph.vim_config_read('init.lua')).length > 0);
});

Deno.test('Write-Read-Delete works', async () => {
  const text = 'asdasd';
  const asd = 'sdasd.asd';
  await ph.vim_config_write(asd, text);

  assert((await ph.vim_config_read(asd)) === text);
  await ph.vim_config_remove(asd);

  assert(!ph.vim_config_exists(text));
});
