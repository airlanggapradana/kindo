import { rmSync } from 'node:fs';

// Resolve generated files relative to the project, regardless of the caller's cwd.
for (const target of ['dist/', 'server.js']) {
  rmSync(new URL(`../${target}`, import.meta.url), { recursive: true, force: true });
}
