// Only run this source tree's suite, not copies inside buyer exports.
import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const tests=readdirSync(join(root,'tests')).filter((name)=>name.endsWith('.test.mjs')).map((name)=>join(root,'tests',name));
execFileSync(process.execPath,['--test',...tests],{cwd:root,stdio:'inherit'});
