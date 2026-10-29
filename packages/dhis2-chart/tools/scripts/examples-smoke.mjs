import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../..');
for (const example of ['basic', 'normalized', 'extension']) {
  execFileSync(process.execPath, [resolve(root, 'packages/dhis2-chart/examples', `${example}.mjs`)],
    { cwd: root, stdio: 'inherit' });
}
