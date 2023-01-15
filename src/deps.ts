export { existsSync } from 'https://deno.land/std/fs/mod.ts';
export { mergeReadableStreams } from 'https://deno.land/std@0.172.0/streams/merge.ts';

export type { Denops } from 'https://deno.land/x/denops_std@v1.0.0/mod.ts';
export { ensureString } from 'https://deno.land/x/unknownutil@v0.1.1/mod.ts';
export {
  open as bufferCreate,
  append as bufferAppend,
  replace as bufferReplace,
} from 'https://deno.land/x/denops_std@v4.0.0/buffer/mod.ts';
